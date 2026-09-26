"""
Dummy local model implementation for testing and development.
"""

from __future__ import annotations

from app.models.base import (
    GenerationRequest,
    GenerationResponse,
    ModelCapabilities,
    ModelProvider,
)


class DummyLocalModel(ModelProvider):
    """Deterministic local model placeholder for development and testing."""

    def __init__(self, name: str = "dummy-local") -> None:
        self._name = name

    def get_name(self) -> str:
        return self._name

    def get_provider_type(self) -> str:
        return "dummy"

    def is_available(self) -> bool:
        return True

    def health_status(self) -> str:
        return "available"

    def get_capabilities(self) -> ModelCapabilities:
        return ModelCapabilities(
            supports_text=True,
            supports_vision=False,
            supports_code=True,
            max_context_tokens=4096,
        )

    def generate(self, request: GenerationRequest) -> GenerationResponse:
        raise RuntimeError("Model is currently unavailable. Please ensure the local llama-server is running.\nPlease Contact the ADMIN")
