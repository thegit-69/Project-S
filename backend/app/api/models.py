"""
Models API routes.

Exposes endpoints for listing registered model providers, their
capabilities, and health status, plus a file-backed **model catalog** CRUD
API (add / edit / enable / delete) with **hot-reload** — new open-weight
models can be added at runtime without a backend restart.

NOTE: These management routes are intentionally unauthenticated. The product
is an on-premise, single-workstation, air-gapped MVP with no multi-tenant
surface; the catalog file is already git-tracked and every ``base_url`` is
loopback-enforced. Add auth here before any multi-user / networked deployment.
"""

import time
from typing import Any

from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Request

from app.agents.router import TaskRouter
from app.models.base import GenerationRequest, ImageInput
from app.models.catalog import ModelCatalog, ModelDefinition
from app.models.registry import ModelRegistry
from app.models.selector import ModelSelector

router = APIRouter(prefix="/models", tags=["models"])

_router_singleton = TaskRouter()


class ModelInferenceRequest(BaseModel):
    """Request payload for direct model inference testing."""

    prompt: str
    model_name: str | None = "general"
    system_prompt: str | None = None
    max_tokens: int = 1024
    temperature: float = 0.7
    images: list[ImageInput] | None = None


class ModelInferenceResponse(BaseModel):
    """Response payload for model inference."""

    text: str
    model_name: str
    provider: str
    tokens_used: int | None = None
    duration_ms: float
    fallback_used: bool = False
    selection_reason: str = ""
    metadata: dict[str, Any] = {}


@router.get("/")
def list_models(request: Request) -> dict[str, object]:
    """Return all registered model providers and their capabilities."""
    registry: ModelRegistry | None = getattr(request.app.state, "registry", None)
    if registry is None:
        raise HTTPException(status_code=503, detail="Model registry not initialized.")

    models = {}
    for name in registry.list_models():
        provider = registry.get(name)
        cap = provider.get_capabilities()
        provider_type = getattr(provider, "get_provider_type", lambda: "unknown")()
        base_url = getattr(provider, "get_base_url", lambda: None)()
        models[name] = {
            "provider_name": provider.get_name(),
            "provider_type": provider_type,
            "available": provider.is_available(),
            "local": True,
            "base_url": base_url,
            "capabilities": cap.model_dump(),
        }
    return {"models": models}


@router.get("/health")
def models_health(request: Request) -> dict[str, object]:
    """
    Health check for all registered model providers.

    Returns per-model status indicating whether the backing
    inference server is reachable and ready.

    Possible status values:
        ``available``     — server is reachable and healthy
        ``unavailable``   — server is down or refused the connection
        ``timeout``       — server did not respond in time
        ``misconfigured`` — server responded but health check failed
    """
    registry: ModelRegistry | None = getattr(request.app.state, "registry", None)
    if registry is None:
        raise HTTPException(status_code=503, detail="Model registry not initialized.")

    results = []
    for name in registry.list_models():
        provider = registry.get(name)
        provider_type = getattr(provider, "get_provider_type", lambda: "unknown")()

        # Use granular health_status() when available; fall back to is_available()
        health_fn = getattr(provider, "health_status", None)
        if health_fn is not None:
            status = health_fn()
        else:
            status = "available" if provider.is_available() else "unavailable"

        model_path = getattr(provider, "get_model_path", lambda: None)()

        results.append({
            "name": name,
            "provider": provider_type,
            "status": status,
            "local": True,
            "model_path": model_path,
        })
    return {"models": results}


@router.post("/inference", response_model=ModelInferenceResponse)
def model_inference(
    body: ModelInferenceRequest, request: Request
) -> ModelInferenceResponse:
    """Execute on-premise local model inference directly."""
    registry: ModelRegistry | None = getattr(request.app.state, "registry", None)
    if registry is None:
        raise HTTPException(status_code=503, detail="Model registry not initialized.")

    if not body.prompt.strip():
        raise HTTPException(status_code=422, detail="Prompt cannot be empty.")

    # Auto-route when the caller omits a model or asks for "auto": images →
    # a vision model, code prompts → a code model, else the general model.
    requested = (body.model_name or "").strip().lower()
    selection_reason = ""
    if requested in ("", "auto"):
        selector: ModelSelector | None = getattr(request.app.state, "selector", None)
        if selector is None:
            selector = ModelSelector(registry)
        route = _router_singleton.route(body.prompt)
        selection = selector.select(
            body.prompt, route=route, has_images=bool(body.images)
        )
        target_name = selection.model_key
        selection_reason = selection.reason
    else:
        target_name = body.model_name

    try:
        provider = registry.get(target_name)
    except KeyError:
        raise HTTPException(
            status_code=404,
            detail=f"Model provider '{target_name}' not found.",
        )

    fallback_used = False
    if not provider.is_available():
        available = registry.get_available(preferred="local")
        if available is not None and available[1] is not provider:
            target_name, provider = available
            fallback_used = True
        else:
            raise HTTPException(
                status_code=503,
                detail=f"Model provider '{target_name}' is not currently reachable.",
            )

    start = time.monotonic()
    gen_req = GenerationRequest(
        prompt=body.prompt,
        system_prompt=body.system_prompt,
        max_tokens=body.max_tokens,
        temperature=body.temperature,
        images=body.images,
    )
    try:
        response = provider.generate(gen_req)
    except Exception as exc:
        available = registry.get_available(preferred="local")
        if not fallback_used and available is not None and available[1] is not provider:
            provider = available[1]
            response = provider.generate(gen_req)
            fallback_used = True
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Inference generation failed: {exc}",
            )

    duration_ms = round((time.monotonic() - start) * 1000, 2)
    provider_type = getattr(provider, "get_provider_type", lambda: "unknown")()

    return ModelInferenceResponse(
        text=response.text,
        model_name=response.model_name,
        provider=provider_type,
        tokens_used=response.tokens_used,
        duration_ms=duration_ms,
        fallback_used=fallback_used,
        selection_reason=selection_reason,
        metadata=response.metadata or {},
    )


# --------------------------------------------------------------------------- #
# Model catalog CRUD + hot-reload
#
# The catalog (config/models.json) is the file-backed source of truth for the
# registry. Mutating it here persists the change and rebuilds the live registry
# in-process, so models are added / edited / removed WITHOUT a backend restart.
# --------------------------------------------------------------------------- #


def _catalog(request: Request) -> ModelCatalog:
    catalog: ModelCatalog | None = getattr(request.app.state, "catalog", None)
    if catalog is None:
        raise HTTPException(status_code=503, detail="Model catalog not initialized.")
    return catalog


def _reload(request: Request) -> list[str]:
    """Rebuild the live registry from the catalog on disk."""
    registry: ModelRegistry | None = getattr(request.app.state, "registry", None)
    catalog = _catalog(request)
    if registry is None:
        raise HTTPException(status_code=503, detail="Model registry not initialized.")
    return registry.reload_from_catalog(catalog)


def _health_status(provider) -> str:
    health_fn = getattr(provider, "health_status", None)
    if health_fn is not None:
        return health_fn()
    return "available" if provider.is_available() else "unavailable"


@router.get("/catalog")
def get_catalog(request: Request) -> dict[str, Any]:
    """Return the full model catalog with live health and routing info."""
    catalog = _catalog(request)
    registry: ModelRegistry | None = getattr(request.app.state, "registry", None)

    entries = []
    for defn in catalog.list():
        status = "unknown"
        if registry is not None and registry.has(defn.key):
            status = _health_status(registry.get(defn.key))
        entries.append(
            {
                **defn.model_dump(),
                "status": status,
                # Which task types deterministically route to this model.
                "routes": defn.task_types,
            }
        )
    return {"models": entries, "catalog_path": str(catalog.path)}


@router.post("/catalog", status_code=201)
def create_model(defn: ModelDefinition, request: Request) -> dict[str, Any]:
    """Add a new model definition (loopback-enforced) and hot-reload."""
    catalog = _catalog(request)
    if catalog.get(defn.key) is not None:
        raise HTTPException(
            status_code=409, detail=f"Model '{defn.key}' already exists; use PUT to edit."
        )
    try:
        defn.validate_endpoint()
        catalog.upsert(defn)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    registered = _reload(request)
    return {"status": "created", "key": defn.key, "registered": registered}


@router.put("/catalog/{key}")
def update_model(key: str, defn: ModelDefinition, request: Request) -> dict[str, Any]:
    """Edit an existing model (capabilities, priority, enabled, …) and hot-reload."""
    catalog = _catalog(request)
    if catalog.get(key) is None:
        raise HTTPException(status_code=404, detail=f"Model '{key}' not found.")
    if defn.key != key:
        raise HTTPException(
            status_code=422, detail="Body 'key' must match the path key."
        )
    try:
        defn.validate_endpoint()
        catalog.upsert(defn)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    registered = _reload(request)
    return {"status": "updated", "key": key, "registered": registered}


@router.delete("/catalog/{key}")
def delete_model(key: str, request: Request) -> dict[str, Any]:
    """Remove a model from the catalog and hot-reload."""
    catalog = _catalog(request)
    if not catalog.remove(key):
        raise HTTPException(status_code=404, detail=f"Model '{key}' not found.")
    registered = _reload(request)
    return {"status": "deleted", "key": key, "registered": registered}


@router.post("/reload")
def reload_catalog(request: Request) -> dict[str, Any]:
    """Re-read the catalog file from disk and rebuild the registry."""
    catalog = _catalog(request)
    catalog.load()
    registered = _reload(request)
    return {"status": "reloaded", "registered": registered}
