"""
Model catalog — file-backed source of truth for the multi-model registry.

The catalog is a JSON array of model definitions (see ``config/models.json``).
It drives which model providers get registered and how the deterministic
``ModelSelector`` routes tasks. Editing the catalog (directly or via the
``/models/catalog`` CRUD API) plus a registry reload adds or removes models
without a backend restart.

Every ``base_url`` is validated through ``validate_local_endpoint`` so the
air-gap guarantee (loopback-only endpoints) holds for every catalog entry.
"""

from __future__ import annotations

import json
import logging
import os
import tempfile
from pathlib import Path

from pydantic import BaseModel, Field

from app.models.base import ModelProvider
from app.models.llama_cpp_provider import LlamaCppProvider, validate_local_endpoint

logger = logging.getLogger(__name__)


class ModelCapabilitiesSpec(BaseModel):
    """Capability flags declared for a catalog model."""

    text: bool = True
    vision: bool = False
    code: bool = False
    agentic: bool = False


class ModelDefinition(BaseModel):
    """A single model entry in the catalog."""

    key: str
    display_name: str
    provider_type: str = "llama_cpp"
    base_url: str = "http://127.0.0.1:8080"
    model_id: str = "default"
    model_path: str | None = None
    mmproj_path: str | None = None
    timeout: int = 120
    max_context_tokens: int = 8192
    capabilities: ModelCapabilitiesSpec = Field(default_factory=ModelCapabilitiesSpec)
    task_types: list[str] = Field(default_factory=list)
    priority: int = 10
    enabled: bool = True

    # __CATALOG_VALIDATORS__

    def validate_endpoint(self) -> None:
        """Ensure the endpoint is a local loopback address (air-gap)."""
        validate_local_endpoint(self.base_url)


class ModelCatalog:
    """File-backed collection of :class:`ModelDefinition` entries."""

    def __init__(self, path: Path | str) -> None:
        self._path = Path(path)
        self._defs: list[ModelDefinition] = []

    @property
    def path(self) -> Path:
        return self._path

    def load(self) -> list[ModelDefinition]:
        """Load definitions from disk. Missing file yields an empty catalog."""
        if not self._path.exists():
            logger.warning("Model catalog not found at %s; starting empty.", self._path)
            self._defs = []
            return self._defs
        try:
            raw = json.loads(self._path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError) as exc:
            logger.error("Failed to read model catalog %s: %s", self._path, exc)
            self._defs = []
            return self._defs
        self._defs = [ModelDefinition(**entry) for entry in raw]
        return self._defs

    def save(self) -> None:
        """Persist current definitions to disk atomically."""
        self._path.parent.mkdir(parents=True, exist_ok=True)
        payload = json.dumps(
            [d.model_dump() for d in self._defs], indent=2, ensure_ascii=False
        )
        fd, tmp = tempfile.mkstemp(dir=str(self._path.parent), suffix=".tmp")
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as fh:
                fh.write(payload)
            os.replace(tmp, self._path)
        finally:
            if os.path.exists(tmp):
                os.remove(tmp)

    def list(self) -> list[ModelDefinition]:
        return list(self._defs)

    def get(self, key: str) -> ModelDefinition | None:
        return next((d for d in self._defs if d.key == key), None)

    def upsert(self, defn: ModelDefinition) -> None:
        """Add a new definition or replace an existing one by key, then save."""
        defn.validate_endpoint()
        for i, existing in enumerate(self._defs):
            if existing.key == defn.key:
                self._defs[i] = defn
                self.save()
                return
        self._defs.append(defn)
        self.save()

    def remove(self, key: str) -> bool:
        """Remove a definition by key. Returns True if one was removed."""
        before = len(self._defs)
        self._defs = [d for d in self._defs if d.key != key]
        removed = len(self._defs) < before
        if removed:
            self.save()
        return removed


def build_provider(defn: ModelDefinition) -> ModelProvider:
    """Instantiate a concrete :class:`ModelProvider` from a catalog entry.

    Only ``llama_cpp`` (OpenAI-compatible local server) is supported today;
    the factory is the single extension point for new provider types.
    """
    if defn.provider_type != "llama_cpp":
        raise ValueError(
            f"Unsupported provider_type '{defn.provider_type}' for model "
            f"'{defn.key}'. Only 'llama_cpp' is supported."
        )
    return LlamaCppProvider(
        base_url=defn.base_url,
        model_id=defn.model_id,
        timeout=defn.timeout,
        model_path=defn.model_path,
        supports_vision=defn.capabilities.vision,
        supports_code=defn.capabilities.code,
        supports_agentic=defn.capabilities.agentic,
        max_context_tokens=defn.max_context_tokens,
    )
