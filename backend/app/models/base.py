"""
Base definitions and interfaces for model providers.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any
from pydantic import BaseModel, Field


class ImageInput(BaseModel):
    """Image input specification for multimodal generation."""

    path: str | None = None
    base64_data: str | None = None
    media_type: str = "image/png"


class GenerationRequest(BaseModel):
    """Request payload for text / multimodal generation."""

    prompt: str
    system_prompt: str | None = None
    max_tokens: int = 1024
    temperature: float = 0.7
    images: list[ImageInput] | None = None


class GenerationResponse(BaseModel):
    """Response payload returned by a model provider."""

    text: str
    model_name: str
    tokens_used: int | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class ModelCapabilities(BaseModel):
    """Capabilities exposed by a model provider."""

    supports_text: bool = True
    supports_vision: bool = False
    supports_code: bool = True
    max_context_tokens: int = 4096


class ModelProvider(ABC):
    """Abstract base class for all LLM model providers."""

    @abstractmethod
    def get_name(self) -> str:
        """Return the unique provider / model name."""
        ...

    @abstractmethod
    def is_available(self) -> bool:
        """Check whether the model provider is currently available."""
        ...

    @abstractmethod
    def get_capabilities(self) -> ModelCapabilities:
        """Return the capabilities of this provider."""
        ...

    @abstractmethod
    def generate(self, request: GenerationRequest) -> GenerationResponse:
        """Generate text from a prompt."""
        ...

    def get_provider_type(self) -> str:
        """Return the provider type string (e.g. 'llama_cpp', 'dummy')."""
        return "unknown"

    def get_base_url(self) -> str | None:
        """Return the base URL if applicable."""
        return None

    def get_model_path(self) -> str | None:
        """Return the model weights path if applicable."""
        return None

    def get_model_id(self) -> str | None:
        """Return the model identifier if applicable."""
        return None

    def health_status(self) -> str:
        """Return granular health status."""
        return "available" if self.is_available() else "unavailable"
