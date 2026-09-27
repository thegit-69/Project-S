"""
Sovereign AI Workbench — FastAPI application entry point.

Initializes the model registry, tool registry, verifier registry,
audit service, document intelligence subsystem, knowledge base & RAG
subsystem, agent orchestrator, and wires up all API routes.

Model provider selection:
- When SAW_LLM_ENABLED=true (default), registers a real LlamaCppProvider
  that talks to a local llama.cpp server.
- When SAW_LLM_ENABLED=false, registers DummyLocalModel (for testing
  without a running LLM server).
"""

import logging
from contextlib import asynccontextmanager
from collections.abc import AsyncIterator
from datetime import datetime, timezone

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.models.registry import ModelRegistry
from app.models.catalog import ModelCatalog
from app.models.selector import ModelSelector
from app.models.local import DummyLocalModel
from app.security.audit import AuditService
from app.security.network_monitor import NetworkMonitor
from app.tools.registry import ToolRegistry
from app.tools.calculator import CalculatorTool
from app.tools.file_reader import FileReaderTool
from app.agents.verifier import VerifierRegistry, CalculatorVerifier
from app.agents.orchestrator import AgentOrchestrator
from app.documents.processor import ProcessorRegistry
from app.documents.txt_processor import TxtProcessor
from app.documents.pdf_processor import PdfProcessor
from app.documents.docx_processor import DocxProcessor
from app.documents.store import DocumentStore
from app.documents.persistence import DocumentMetadataStore
from app.knowledge.chunking import ChunkingConfig, ChunkingService
from app.knowledge.tfidf_embeddings import TfidfEmbeddingProvider
from app.knowledge.embeddings import EmbeddingProvider
from app.knowledge.persistence import KnowledgeMetadataStore
from app.knowledge.persistent_store import PersistentVectorStore
from app.knowledge.ingestion import KnowledgeIngestionService
from app.knowledge.retrieval import KnowledgeRetriever
from app.knowledge.rag_service import RAGService
from app.tools.rag_tool import KnowledgeSearchTool
from app.api import agent as agent_api
from app.api import files as files_api
from app.api import models as models_api
from app.api import documents as documents_api
from app.api import knowledge as knowledge_api

logger = logging.getLogger(__name__)


def _build_embedding_provider(settings) -> EmbeddingProvider:
    """Create the configured embedding provider.

    Returns TfidfEmbeddingProvider (default) or LocalNeuralEmbeddingProvider
    based on SAW_EMBEDDING_PROVIDER.
    """
    if settings.embedding_provider == "neural":
        from app.knowledge.neural_embeddings import LocalNeuralEmbeddingProvider

        return LocalNeuralEmbeddingProvider(
            model_path=settings.neural_model_path,
            model_name=settings.neural_model_name,
            device=settings.neural_device,
            fallback_to_cpu=settings.neural_fallback_to_cpu,
            max_seq_length=settings.neural_max_seq_length,
            batch_size=settings.neural_batch_size,
            normalize=settings.neural_normalize,
        )

    return TfidfEmbeddingProvider(
        max_features=settings.embedding_dimension,
    )


def _build_tool_registry(settings) -> ToolRegistry:
    """Create and populate the tool registry."""
    tool_registry = ToolRegistry()

    # Calculator — always available.
    tool_registry.register(CalculatorTool())

    # File reader — uses the configured data directory as workspace root.
    workspace = settings.data_dir
    workspace.mkdir(parents=True, exist_ok=True)
    tool_registry.register(FileReaderTool(workspace_root=workspace))

    return tool_registry


def _build_verifier_registry() -> VerifierRegistry:
    """Create and populate the verifier registry."""
    verifier_registry = VerifierRegistry()
    verifier_registry.register(CalculatorVerifier())
    return verifier_registry


def _build_processor_registry() -> ProcessorRegistry:
    """Build and return a ProcessorRegistry with all supported processors."""
    reg = ProcessorRegistry()
    reg.register(TxtProcessor())
    reg.register(PdfProcessor())
    reg.register(DocxProcessor())
    return reg


def create_app() -> FastAPI:
    """Application factory. Each call produces a fully independent app instance."""
    settings = get_settings()

    # Per-app-instance singletons
    model_registry = ModelRegistry()

    # Model catalog — file-backed source of truth for the multi-model registry.
    # If the file is missing/empty, seed it from the SAW_LLM_* defaults so the
    # backend still boots with one working model.
    model_catalog = ModelCatalog(settings.model_catalog_path)
    model_catalog.load()
    if not model_catalog.list():
        from app.models.catalog import ModelDefinition, ModelCapabilitiesSpec

        logger.info(
            "Model catalog empty/missing at %s — seeding from SAW_LLM_* defaults.",
            settings.model_catalog_path,
        )
        model_catalog.upsert(
            ModelDefinition(
                key="general",
                display_name="Local Model",
                base_url=str(settings.llm_base_url),
                model_id=settings.llm_model_id,
                model_path=settings.llm_model_path,
                mmproj_path=settings.llm_mmproj_path or None,
                timeout=settings.llm_timeout,
                capabilities=ModelCapabilitiesSpec(text=True, vision=True),
                task_types=["general", "file_analysis", "vision"],
                priority=10,
                enabled=settings.llm_enabled,
            )
        )

    model_selector = ModelSelector(model_registry, default_key="general")

    audit_service = AuditService(log_file=settings.audit_log_file)
    tool_registry = _build_tool_registry(settings)
    verifier_registry = _build_verifier_registry()
    processor_registry = _build_processor_registry()
    network_monitor = NetworkMonitor(
        configured_endpoints={
            f"llm_{defn.key}": defn.base_url for defn in model_catalog.list()
        }
    )

    # Create retrieval service for the agent tool using the new Qdrant vector store
    from app.services.vector_store import VectorStoreService
    from app.services.retrieval_service import RetrievalService
    from app.services.embedding_service import get_embedding_provider
    
    embedding_provider = get_embedding_provider()
    
    new_vector_store = VectorStoreService(path=str(settings.data_dir / "qdrant"))
    new_retrieval_service = RetrievalService(
        vector_store=new_vector_store,
        embedding_provider=embedding_provider
    )
    
    knowledge_search_tool = KnowledgeSearchTool(retriever=new_retrieval_service)
    tool_registry.register(knowledge_search_tool)

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        """Startup / shutdown lifecycle hook."""
        # Build the live registry from the catalog (multi-model, hot-reloadable).
        registered = model_registry.reload_from_catalog(model_catalog)
        logger.info("Registered models from catalog: %s", registered)

        # Always keep a "local" dummy provider as a last-resort fallback so the
        # workbench stays responsive when no llama.cpp server is running. It is
        # registered outside the catalog, so hot-reloads preserve it.
        model_registry.register("local", DummyLocalModel(), replace=True)

        # When no real catalog model registered (e.g. all endpoints unbuildable),
        # ensure a usable "general" key exists for the RAG service and default.
        if not model_registry.has("general"):
            model_registry.register("general", DummyLocalModel(), replace=True)

        # Wire up the orchestrator with all registries + the auto-router.
        orchestrator = AgentOrchestrator(
            registry=model_registry,
            audit_service=audit_service,
            tool_registry=tool_registry,
            verifier_registry=verifier_registry,
            default_model="general",
            model_selector=model_selector,
        )


        # Store on app.state for dependency injection in routes
        app.state.registry = model_registry
        app.state.catalog = model_catalog
        app.state.selector = model_selector
        app.state.tool_registry = tool_registry
        app.state.orchestrator = orchestrator
        app.state.settings = settings
        app.state.audit_service = audit_service
        app.state.processor_registry = processor_registry
        app.state.knowledge_search_tool = knowledge_search_tool

        logger.info(
            "Sovereign AI Workbench started "
            "(tools=%s, processors=%s, upload_dir=%s, "
            "embedding=MiniLM-%d, vector_store=%s)",
            tool_registry.list_tools(),
            processor_registry.list_extensions(),
            settings.upload_dir,
            embedding_provider.get_dimension(),
            type(new_vector_store).__name__,
        )
        yield
        # Clean shutdown
        logger.info("Sovereign AI Workbench shutting down")

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description=(
            "On-premise agentic AI workbench using open-weight multimodal LLMs "
            "for confidential industrial work. SIH 2026 — Problem ID 26117."
        ),
        lifespan=lifespan,
    )

    # --- CORS middleware (dev-safe, restrict in production) ---
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:4173",
            "http://127.0.0.1:4173",
        ],
        allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # --- Root routes ---
    @app.get("/", tags=["root"])
    def root() -> dict[str, str]:
        """Root endpoint — confirms the backend is running."""
        return {
            "service": settings.app_name,
            "version": settings.app_version,
            "status": "running",
            "message": "Sovereign AI Workbench backend is operational.",
        }

    @app.get("/health", tags=["root"])
    def health(request: Request) -> dict[str, object]:
        """Health check endpoint.

        Returns comprehensive health status including all subsystems:
        models, tools, documents, knowledge/vectors, audit, and
        network compliance.
        """
        reg: ModelRegistry = request.app.state.registry
        tools: ToolRegistry = request.app.state.tool_registry
        knowledge_ingest = getattr(request.app.state, "knowledge_ingestion", None)
        knowledge_docs = (
            len(knowledge_ingest.list_documents())
            if knowledge_ingest
            else 0
        )
        knowledge_chunks = new_vector_store.client.count(new_vector_store.collection_name).count if new_vector_store.client.collection_exists(new_vector_store.collection_name) else 0

        # Subsystem health details
        vector_health = {"status": "healthy", "provider": "qdrant"}
        audit_health = audit_service.get_health()
        network_compliance = network_monitor.check_compliance()
        embedding_health = (
            embedding_provider.get_health_info()
            if hasattr(embedding_provider, "get_health_info")
            else {"embedding_provider": embedding_provider.get_name()}
        )

        return {
            "status": "healthy",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "version": settings.app_version,
            "models_registered": reg.list_models(),
            "tools_registered": tools.list_tools(),
            "document_processors": processor_registry.list_extensions(),
            "knowledge_documents": knowledge_docs,
            "knowledge_chunks": knowledge_chunks,
            "embedding_provider": embedding_provider.get_name(),
            "subsystems": {
                "vector_store": vector_health,
                "audit": audit_health,
                "network": network_compliance,
                "embeddings": embedding_health,
            },
        }

    # --- Route groups ---
    app.include_router(agent_api.router)
    # app.include_router(files_api.router)  # Disabled in favor of RAG files router
    app.include_router(models_api.router)
    
    from app.api import retrieval, chat, files as new_files_api
    from app.api import studio as studio_api
    app.include_router(new_files_api.router)
    app.include_router(retrieval.router)
    app.include_router(chat.router)
    app.include_router(studio_api.router)

    # Initialize database tables if missing
    from app.db.init_db import init_db
    try:
        init_db()
    except Exception as e:
        logger.warning(f"Database initialization skipped or failed: {e}")

    return app


app = create_app()
