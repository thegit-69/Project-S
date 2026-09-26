"""
Model provider registry for managing available LLMs.

Holds concrete :class:`ModelProvider` instances keyed by name, together
with routing metadata (capabilities, task-type affinity, priority, enabled
flag) sourced from the model catalog. Supports hot-reload so models can be
added, edited, or removed at runtime without a backend restart.
"""

from __future__ import annotations

import logging

from pydantic import BaseModel, Field

from app.models.base import ModelProvider
from app.models.catalog import ModelCatalog, ModelDefinition, build_provider

logger = logging.getLogger(__name__)


class RegisteredModel(BaseModel):
    """A provider plus its routing metadata."""

    model_config = {"arbitrary_types_allowed": True}

    provider: ModelProvider
    display_name: str = ""
    capabilities: dict = Field(default_factory=dict)
    task_types: list[str] = Field(default_factory=list)
    priority: int = 10
    enabled: bool = True


class ModelRegistry:
    """In-memory registry of named model providers."""

    def __init__(self) -> None:
        self._models: dict[str, RegisteredModel] = {}
        # Keys that were registered from the catalog. Reloads only drop stale
        # catalog keys, so manually-pinned providers (e.g. the "local" dummy
        # fallback) survive hot-reload.
        self._catalog_keys: set[str] = set()

    def register(
        self,
        name: str,
        provider: ModelProvider,
        meta: dict | None = None,
        replace: bool = False,
    ) -> None:
        """Register a model provider under the given name.

        Args:
            name:     Registry key.
            provider: The provider instance.
            meta:     Optional routing metadata (display_name, capabilities,
                      task_types, priority, enabled).
            replace:  Allow replacing an existing entry (used by hot-reload).
        """
        if name in self._models and not replace:
            raise ValueError(f"Model provider '{name}' is already registered.")
        meta = meta or {}
        self._models[name] = RegisteredModel(
            provider=provider,
            display_name=meta.get("display_name", name),
            capabilities=meta.get("capabilities", {}),
            task_types=meta.get("task_types", []),
            priority=meta.get("priority", 10),
            enabled=meta.get("enabled", True),
        )
        logger.debug("Registered model provider: %s", name)

    def unregister(self, name: str) -> None:
        """Unregister a model provider."""
        self._models.pop(name, None)

    def get(self, name: str) -> ModelProvider:
        """Retrieve a model provider by name."""
        if name not in self._models:
            raise KeyError(f"No model provider '{name}' registered.")
        return self._models[name].provider

    def get_meta(self, name: str) -> RegisteredModel | None:
        """Retrieve the full registered record (provider + metadata)."""
        return self._models.get(name)

    def has(self, name: str) -> bool:
        """Check whether a model provider is registered."""
        return name in self._models

    def list_models(self) -> list[str]:
        """Return names of all registered model providers."""
        return list(self._models.keys())

    def list_detailed(self) -> list[dict]:
        """Return name + routing metadata for every registered model."""
        return [
            {
                "name": name,
                "display_name": rec.display_name,
                "capabilities": rec.capabilities,
                "task_types": rec.task_types,
                "priority": rec.priority,
                "enabled": rec.enabled,
            }
            for name, rec in self._models.items()
        ]

    def candidates(
        self,
        *,
        capability: str | None = None,
        task_type: str | None = None,
    ) -> list[tuple[str, RegisteredModel]]:
        """Return enabled models matching a capability and/or task type,
        sorted by descending priority (best first)."""
        matches: list[tuple[str, RegisteredModel]] = []
        for name, rec in self._models.items():
            if not rec.enabled:
                continue
            if capability and not rec.capabilities.get(capability):
                continue
            if task_type and task_type not in rec.task_types:
                continue
            matches.append((name, rec))
        matches.sort(key=lambda kv: kv[1].priority, reverse=True)
        return matches

    def get_available(
        self, preferred: str | None = "general"
    ) -> tuple[str, ModelProvider] | None:
        """
        Return the preferred available provider if available,
        or the highest-priority available enabled provider.
        """
        if preferred and preferred in self._models:
            rec = self._models[preferred]
            if rec.enabled and rec.provider.is_available():
                return (preferred, rec.provider)

        ordered = sorted(
            self._models.items(), key=lambda kv: kv[1].priority, reverse=True
        )
        for name, rec in ordered:
            if rec.enabled and rec.provider.is_available():
                return (name, rec.provider)

        return None

    def reload_from_catalog(self, catalog: ModelCatalog) -> list[str]:
        """Rebuild the registry from a catalog: add new, replace changed,
        drop removed. Returns the list of registered model names.

        Providers that fail to build (e.g. non-loopback endpoint) are skipped
        with a logged warning rather than aborting the whole reload.
        """
        definitions: list[ModelDefinition] = catalog.list()
        desired_keys = {d.key for d in definitions}

        # Drop catalog-managed models no longer in the catalog. Providers that
        # were registered outside the catalog (e.g. the "local" dummy) stay.
        for stale in [k for k in self._catalog_keys if k not in desired_keys]:
            self.unregister(stale)
            logger.info("Removed model '%s' (no longer in catalog)", stale)

        # Add / replace from catalog.
        registered: set[str] = set()
        for defn in definitions:
            try:
                provider = build_provider(defn)
            except Exception as exc:  # noqa: BLE001 - never abort reload
                logger.warning("Skipping model '%s': %s", defn.key, exc)
                continue
            self.register(
                defn.key,
                provider,
                meta={
                    "display_name": defn.display_name,
                    "capabilities": defn.capabilities.model_dump(),
                    "task_types": defn.task_types,
                    "priority": defn.priority,
                    "enabled": defn.enabled,
                },
                replace=True,
            )
            registered.add(defn.key)
        self._catalog_keys = registered
        return self.list_models()
