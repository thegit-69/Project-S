"""
Local llama.cpp model provider with loopback enforcement for air-gapped security.
"""

from __future__ import annotations

import logging
from urllib.parse import urlparse

import httpx

from app.models.base import (
    GenerationRequest,
    GenerationResponse,
    ModelCapabilities,
    ModelProvider,
)

logger = logging.getLogger(__name__)

# Permitted loopback hostnames / IPs for air-gap compliance
_ALLOWED_LOCAL_HOSTS = {
    "127.0.0.1",
    "localhost",
    "::1",
    "0.0.0.0",
}


class LocalEndpointError(ValueError):
    """Raised when an endpoint URL is not a local loopback address."""


class LlamaCppProviderError(RuntimeError):
    """Raised when communication with the llama.cpp server fails."""


def validate_local_endpoint(url: str) -> str:
    """
    Ensure the endpoint points strictly to a local loopback address.

    Raises LocalEndpointError if the hostname resolves to an external
    domain or non-loopback IP.
    """
    parsed = urlparse(url)
    hostname = parsed.hostname
    if not hostname:
        raise LocalEndpointError(f"Endpoint '{url}' is not a local address.")

    hostname_clean = hostname.strip("[]").lower()
    if hostname_clean not in _ALLOWED_LOCAL_HOSTS:
        raise LocalEndpointError(
            f"Endpoint '{url}' is not a local address. "
            "Air-gapped deployment requires loopback endpoints."
        )
    return url


class LlamaCppProvider(ModelProvider):
    """
    Model provider connecting to a local llama.cpp server via its
    OpenAI-compatible HTTP API.
    """

    def __init__(
        self,
        base_url: str = "http://127.0.0.1:8080",
        model_id: str = "gemma-3-4b-it",
        timeout: int | float = 120,
        model_path: str | None = None,
        supports_vision: bool = False,
        max_context_tokens: int = 8192,
    ) -> None:
        validate_local_endpoint(base_url)
        self._base_url = base_url.rstrip("/")
        self._model_id = model_id
        self._timeout = float(timeout)
        self._model_path = model_path
        self._supports_vision = supports_vision
        self._max_context_tokens = max_context_tokens

    def get_name(self) -> str:
        return f"llama-cpp:{self._model_id}"

    def get_base_url(self) -> str:
        return self._base_url

    def get_provider_type(self) -> str:
        return "llama_cpp"

    def get_model_id(self) -> str:
        return self._model_id

    def get_model_path(self) -> str | None:
        return self._model_path

    def get_capabilities(self) -> ModelCapabilities:
        return ModelCapabilities(
            supports_text=True,
            supports_vision=self._supports_vision,
            supports_code=True,
            max_context_tokens=self._max_context_tokens,
        )

    def health_status(self) -> str:
        """Query server /health to get granular status."""
        try:
            resp = httpx.get(
                f"{self._base_url}/health",
                timeout=min(self._timeout, 5.0),
            )
            if 200 <= resp.status_code < 300:
                return "available"
            return "misconfigured"
        except (httpx.TimeoutException, TimeoutError):
            return "timeout"
        except (httpx.ConnectError, OSError):
            return "unavailable"
        except Exception:
            return "unavailable"

    def is_available(self) -> bool:
        """Check whether the llama.cpp server is reachable and healthy."""
        return self.health_status() == "available"

    def generate(self, request: GenerationRequest) -> GenerationResponse:
        """Execute chat completion request against local llama.cpp endpoint."""
        messages: list[dict[str, str]] = []
        if request.system_prompt:
            messages.append({"role": "system", "content": request.system_prompt})
        messages.append({"role": "user", "content": request.prompt})

        payload = {
            "model": self._model_id,
            "messages": messages,
            "max_tokens": request.max_tokens,
            "temperature": request.temperature,
        }

        try:
            resp = httpx.post(
                f"{self._base_url}/v1/chat/completions",
                json=payload,
                timeout=self._timeout,
            )
        except httpx.ConnectError as exc:
            raise LlamaCppProviderError(
                f"Cannot connect to llama.cpp server at {self._base_url}: {exc}"
            ) from exc
        except (httpx.TimeoutException, TimeoutError) as exc:
            raise LlamaCppProviderError(
                f"Request to llama.cpp server timed out ({self._timeout}s): {exc}"
            ) from exc
        except Exception as exc:
            raise LlamaCppProviderError(
                f"Cannot connect to llama.cpp server at {self._base_url}: {exc}"
            ) from exc

        if resp.status_code != 200:
            raise LlamaCppProviderError(
                f"llama.cpp server error: HTTP {resp.status_code} - {resp.text}"
            )

        data = resp.json()
        choices = data.get("choices", [])
        if not choices:
            raise LlamaCppProviderError("llama.cpp returned empty choices in response.")

        text = choices[0].get("message", {}).get("content", "")
        tokens_used = data.get("usage", {}).get("total_tokens")

        return GenerationResponse(
            text=text,
            model_name=self.get_name(),
            tokens_used=tokens_used,
            metadata={"provider": "llama_cpp", "local": True},
        )
