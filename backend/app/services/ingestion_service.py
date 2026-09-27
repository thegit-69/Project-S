import logging
from app.db.session import SessionLocal
from app.db.models import IngestionStatus, DocumentChunk, DocumentAsset
from app.services.document_service import DocumentService
from app.services.parsers import ParserRegistry
from app.services.storage import LocalFilesystemStorage
from app.services.chunking_service import ChunkingService
from app.services.embedding_service import get_embedding_provider
from app.services.vector_store import VectorStoreService
from app.config import get_settings

logger = logging.getLogger(__name__)

class IngestionService:
    @staticmethod
    def process_document_job(job_id: str, registry=None):
        """
        Background worker task to process a document ingestion job.
        """
        db_session = SessionLocal()
        settings = get_settings()
        storage = LocalFilesystemStorage(base_path=str(settings.data_dir / "objects"))
        parser_registry = ParserRegistry()
        chunking_service = ChunkingService()
        embedding_provider = get_embedding_provider()
        
        # Initialize Vector Store
        qdrant_path = str(settings.data_dir / "qdrant")
        vector_store = VectorStoreService(path=qdrant_path)
        vector_store.initialize_collection(embedding_provider.get_dimension())
        
        try:
            doc_service = DocumentService(db_session)
            job = doc_service.get_job(job_id)
            if not job or not job.document:
                logger.error(f"Job {job_id} or its document not found.")
                return

            document = job.document
            logger.info(f"Starting background ingestion for job {job_id}, document {document.id}")
            
            # 1. Update status to PROCESSING
            doc_service.update_job_status(job_id, IngestionStatus.PROCESSING)
            
            # 2. Fetch File Path
            file_path = str(storage._get_absolute_path(document.storage_key))
            
            # 3. Parse Document
            parser = parser_registry.get_parser(document.file_extension)
            normalized_doc = parser.parse(file_path=file_path, document_id=document.id)
            
            # Update Document Metadata
            document.page_count = len(normalized_doc.pages)
            normalized_doc.metadata["original_filename"] = document.original_filename
            normalized_doc.metadata["workspace_id"] = getattr(document, "workspace_id", None)
            
            # 3.5 Process Extracted Assets
            if hasattr(normalized_doc, "assets") and normalized_doc.assets:
                import io
                import uuid
                for asset in normalized_doc.assets:
                    try:
                        asset_id = asset["asset_id"]
                        filename = asset["filename"]
                        data = asset["data"]
                        
                        asset_storage_key = f"{document.id}/assets/{filename}"
                        storage.save_file(io.BytesIO(data), asset_storage_key)
                        
                        asset_record = DocumentAsset(
                            id=asset_id,
                            document_id=document.id,
                            asset_type=asset.get("asset_type", "image"),
                            storage_key=asset_storage_key,
                            page_number=asset.get("page_number", None)
                        )
                        db_session.add(asset_record)
                        
                        # Process image with VLM if available
                        if registry and asset.get("asset_type") == "image":
                            cands = registry.candidates(capability="vision")
                            if cands:
                                vision_provider_entry = registry.get_available(preferred=cands[0][0])
                                if vision_provider_entry:
                                    vision_provider = vision_provider_entry[1]
                                    import base64
                                    from app.models.base import GenerationRequest, ImageInput
                                    from app.models.schemas import Block
                                    
                                    b64_img = base64.b64encode(data).decode("utf-8")
                                    req = GenerationRequest(
                                        prompt="Describe this image in detail so its information can be used in a search system.",
                                        images=[ImageInput(base64_data=b64_img, media_type=asset.get("mime_type", "image/png"))]
                                    )
                                    resp = vision_provider.generate(req)
                                    
                                    if resp.text and normalized_doc.pages:
                                        normalized_doc.pages[0].blocks.append(
                                            Block(
                                                block_id=str(uuid.uuid4()),
                                                block_type="image_description",
                                                content=f"Image Description: {resp.text}",
                                                page=1
                                            )
                                        )
                    except Exception as e:
                        logger.error(f"Failed to process asset {asset.get('filename')}: {e}")
            
            # 4. Chunking
            payloads = chunking_service.chunk_document(normalized_doc)
            logger.info(f"Generated {len(payloads)} chunks for document {document.id}")
            
            if payloads:
                # 5. Dense Embedding
                texts_to_embed = [p.content for p in payloads]
                embeddings = embedding_provider.embed_texts(texts_to_embed)
                
                # 5.5 Sparse Embedding for Hybrid Search
                from app.services.sparse_embedding_service import get_sparse_embedding_provider
                sparse_provider = get_sparse_embedding_provider()
                sparse_embeddings = sparse_provider.embed_texts(texts_to_embed)
                
                # 6. Indexing in Qdrant (Hybrid)
                vector_store.upsert_chunks(payloads, embeddings, sparse_embeddings=sparse_embeddings)
                
                # 7. Record chunks in SQLite to maintain source of truth
                for idx, payload in enumerate(payloads):
                    chunk_record = DocumentChunk(
                        document_id=document.id,
                        qdrant_point_id=payload.chunk_id,
                        chunk_index=idx,
                        page_number=payload.page,
                        section_name=payload.section
                    )
                    db_session.add(chunk_record)
            
            # Save all changes to DB
            db_session.commit()
            
            # 8. Finalize
            doc_service.update_job_status(job_id, IngestionStatus.READY)
            logger.info(f"Successfully completed ingestion for job {job_id}")
            
        except Exception as e:
            logger.error(f"Ingestion job {job_id} failed: {e}")
            doc_service = DocumentService(db_session) # Ensure doc_service still exists
            doc_service.update_job_status(job_id, IngestionStatus.FAILED, error_message=str(e))
        finally:
            db_session.close()
