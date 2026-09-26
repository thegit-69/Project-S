"""
Deterministic model selector (auto-routing).

Maps a task to the best-fit registered model using capability tags and the
task type produced by the deterministic ``TaskRouter``. No LLM call, no
external service — the decision is a pure function of the request, so it is
fast, reproducible, and auditable (a ``MODEL_SELECTED`` trace event records
the human-readable reason).

Routing rules, in order:
    1. Image input        → model with ``vision`` capability   (e.g. Gemma)
    2. Code / agentic task → model with ``code``/``agentic`` capability (e.g. Qwen)
    3. Otherwise           → the general-purpose model
Ties break on descending ``priority``; only enabled models are considered.
A registry-level availability fallback is applied last.
"""

from __future__ import annotations

from pydantic import BaseModel

from app.agents.router import RouteResult
from app.models.registry import ModelRegistry

# Task types that should prefer a code / agentic model.
_CODE_TASK_TYPES = {"code", "agentic", "multi_step", "calculation"}


class SelectionResult(BaseModel):
    """Outcome of a routing decision."""

    model_key: str
    reason: str


class ModelSelector:
    """Chooses a registered model for a task using deterministic rules."""

    def __init__(self, registry: ModelRegistry, default_key: str = "general") -> None:
        self._registry = registry
        self._default_key = default_key

    def select(
        self,
        task: str,
        route: RouteResult | None = None,
        has_images: bool = False,
    ) -> SelectionResult:
        """Return the model key to use for this task, with a reason."""
        task_type = route.task_type if route else "general"

        # 1. Vision — image input requires a vision-capable model.
        if has_images:
            cands = self._registry.candidates(capability="vision")
            picked = self._first_available(cands)
            if picked:
                name, rec = picked
                return SelectionResult(
                    model_key=name,
                    reason=f"image input → {rec.display_name} (vision capability)",
                )

        # 2. Code / agentic tasks require a code- or agentic-capable model.
        if task_type in _CODE_TASK_TYPES:
            cands = self._registry.candidates(capability="code")
            cands += [c for c in self._registry.candidates(capability="agentic") if c not in cands]
            picked = self._first_available(cands)
            if picked:
                name, rec = picked
                return SelectionResult(
                    model_key=name,
                    reason=f"{task_type} task → {rec.display_name} (code capability)",
                )

        # 3. General — prefer a model that advertises the general task type.
        cands = self._registry.candidates(task_type="general")
        picked = self._first_available(cands)
        if picked:
            name, rec = picked
            return SelectionResult(
                model_key=name,
                reason=f"general task → {rec.display_name}",
            )

        # 4. Fallback: any available enabled model, preferring the default.
        available = self._registry.get_available(preferred=self._default_key)
        if available is not None:
            name, _provider = available
            return SelectionResult(
                model_key=name,
                reason=f"fallback → {name} (best available model)",
            )

        # 5. Nothing available — return the default key; the orchestrator
        #    surfaces the unavailability error downstream.
        return SelectionResult(
            model_key=self._default_key,
            reason="no models available; using default",
        )

    def _first_available(self, cands):
        """From priority-ordered candidates, return the first available one,
        else the highest-priority candidate (so routing still resolves and
        the orchestrator's own availability fallback can act)."""
        if not cands:
            return None
        for name, rec in cands:
            try:
                if rec.provider.is_available():
                    return (name, rec)
            except Exception:  # noqa: BLE001 - health probe must not crash routing
                continue
        return cands[0]
