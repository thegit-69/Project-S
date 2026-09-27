"""
Code Generation API — Qwen3-4B via llama.cpp server.

Streams code from the local Qwen model (llama.cpp at port 9090)
using Server-Sent Events (SSE) so the frontend can animate code
appearing in the Monaco editor in real-time.
"""

import json
import logging
from typing import AsyncIterator

import httpx
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/codegen", tags=["codegen"])

LLAMA_BASE = "http://localhost:9090"
QWEN_MODEL = "Qwen/Qwen3-4B-GGUF:Q4_K_M"

SYSTEM_PROMPT = """You are an expert Python programmer embedded in a secure, air-gapped AI workbench for industrial use.
When asked to write code:
1. Reply with ONLY valid Python code — no markdown fences, no explanations outside the code.
2. Include concise docstrings and inline comments where helpful.
3. Before the code, output exactly ONE line starting with "# SUMMARY: " describing what the code does.
Keep code clean, readable, and production-quality."""


class CodeGenRequest(BaseModel):
    prompt: str = Field(..., description="User's natural language coding request.")
    max_tokens: int = Field(default=1500, ge=100, le=4096)


class CodeGenHealthResponse(BaseModel):
    model: str
    status: str
    endpoint: str


@router.get("/health", response_model=CodeGenHealthResponse)
async def codegen_health() -> CodeGenHealthResponse:
    """Check if the Qwen code generation model is reachable."""
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            resp = await client.get(f"{LLAMA_BASE}/health")
            resp.raise_for_status()
        return CodeGenHealthResponse(model=QWEN_MODEL, status="ok", endpoint=LLAMA_BASE)
    except Exception as exc:
        logger.warning("Qwen health check failed: %s", exc)
        return CodeGenHealthResponse(model=QWEN_MODEL, status="unreachable", endpoint=LLAMA_BASE)


@router.post("/generate")
async def generate_code(request: CodeGenRequest) -> StreamingResponse:
    """
    Stream Python code from Qwen3-4B via llama.cpp.

    Returns an SSE stream with two event types:
    - event: summary  — the one-line description of the code
    - event: token    — each streamed token of the code itself
    - event: done     — signals completion
    - event: error    — signals an error
    """
    async def event_stream() -> AsyncIterator[str]:
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": request.prompt + " /no_think"},
        ]
        payload = {
            "model": QWEN_MODEL,
            "messages": messages,
            "max_tokens": request.max_tokens,
            "temperature": 0.2,
            "stream": True,
        }

        summary_sent = False
        buffer = ""

        try:
            async with httpx.AsyncClient(timeout=120) as client:
                async with client.stream(
                    "POST",
                    f"{LLAMA_BASE}/v1/chat/completions",
                    json=payload,
                    headers={"Content-Type": "application/json"},
                ) as response:
                    response.raise_for_status()

                    async for line in response.aiter_lines():
                        if not line.startswith("data: "):
                            continue
                        data = line[6:]
                        if data == "[DONE]":
                            break
                        try:
                            chunk = json.loads(data)
                            token = chunk["choices"][0].get("delta", {}).get("content", "")
                            if not token:
                                continue

                            buffer += token

                            # Extract SUMMARY line if present
                            if not summary_sent and "\n" in buffer:
                                first_line, rest = buffer.split("\n", 1)
                                if first_line.startswith("# SUMMARY:"):
                                    summary = first_line[10:].strip()
                                    yield f"event: summary\ndata: {json.dumps(summary)}\n\n"
                                    summary_sent = True
                                    buffer = rest
                                    # Stream the rest as tokens
                                    for ch in rest:
                                        yield f"event: token\ndata: {json.dumps(ch)}\n\n"
                                    buffer = ""
                                    continue

                            # If summary already found, stream token directly
                            if summary_sent:
                                yield f"event: token\ndata: {json.dumps(token)}\n\n"

                        except (json.JSONDecodeError, KeyError):
                            continue

                    # If no summary line was extracted, send buffer as tokens
                    if not summary_sent:
                        yield f"event: summary\ndata: {json.dumps('Code generated by Qwen3-4B.')}\n\n"
                        for ch in buffer:
                            yield f"event: token\ndata: {json.dumps(ch)}\n\n"

                    yield "event: done\ndata: {}\n\n"

        except httpx.ConnectError:
            yield f'event: error\ndata: {json.dumps("Cannot reach Qwen model at localhost:9090. Is llama-server running?")}\n\n'
        except Exception as exc:
            logger.exception("Code generation error: %s", exc)
            yield f'event: error\ndata: {json.dumps(str(exc))}\n\n'

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
