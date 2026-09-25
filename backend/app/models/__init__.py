"""
Models package for Sovereign AI Workbench.

Provides model abstractions, local model implementations,
llama.cpp provider, and model registry.
"""

from app.models.base import (
    GenerationRequest,
    GenerationResponse,
    ImageInput,
    ModelCapabilities,
    ModelProvider,
)
from app.models.local import DummyLocalModel
from app.models.llama_cpp_provider import (
    LlamaCppProvider,
    LocalEndpointError,
    LlamaCppProviderError,
    validate_local_endpoint,
)
from app.models.registry import ModelRegistry

__all__ = [
    "GenerationRequest",
    "GenerationResponse",
    "ImageInput",
    "ModelCapabilities",
    "ModelProvider",
    "DummyLocalModel",
    "LlamaCppProvider",
    "LocalEndpointError",
    "LlamaCppProviderError",
    "validate_local_endpoint",
    "ModelRegistry",
]
