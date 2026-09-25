"""
Model provider registry for managing available LLMs.
"""

from __future__ import annotations

import logging
from app.models.base import ModelProvider

logger = logging.getLogger(__name__)


class ModelRegistry:
    """In-memory registry of named model providers."""

    def __init__(self) -> None:
        self._models: dict[str, ModelProvider] = {}

    def register(self, name: str, provider: ModelProvider) -> None:
        """Register a model provider under the given name."""
        if name in self._models:
            raise ValueError(f"Model provider '{name}' is already registered.")
        self._models[name] = provider
        logger.debug("Registered model provider: %s", name)

    def unregister(self, name: str) -> None:
        """Unregister a model provider."""
        self._models.pop(name, None)

    def get(self, name: str) -> ModelProvider:
        """Retrieve a model provider by name."""
        if name not in self._models:
            raise KeyError(f"No model provider '{name}' registered.")
        return self._models[name]

    def has(self, name: str) -> bool:
        """Check whether a model provider is registered."""
        return name in self._models

    def list_models(self) -> list[str]:
        """Return names of all registered model providers."""
        return list(self._models.keys())

    def get_available(
        self, preferred: str | None = "local"
    ) -> tuple[str, ModelProvider] | None:
        """
        Return the preferred available provider if available,
        or any available provider in the registry.
        """
        if preferred and preferred in self._models:
            provider = self._models[preferred]
            if provider.is_available():
                return (preferred, provider)

        for name, provider in self._models.items():
            if provider.is_available():
                return (name, provider)

        return None
