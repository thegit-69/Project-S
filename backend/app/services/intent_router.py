"""
Lightweight, deterministic intent router for the chat agent layer.

Classifies a natural-language chat prompt into one of a small set of
actionable intents so the chat box can dispatch to the right pipeline:

    "approval_note" -> run the ApprovalNoteWorkflow (RAG -> findings -> note -> DOCX)
    "qa"            -> fall back to normal grounded RAG chat

Keyword/pattern based by design: no extra LLM call, so routing stays fast,
free and reliable for the demo. The classifier is intentionally
conservative — it only claims ``approval_note`` when the prompt clearly asks
for an approval-note/memo deliverable, otherwise it defers to QA.
"""

from __future__ import annotations

import re

# The deliverable the user is asking us to produce.
_ARTIFACT = (
    r"(approval[\s-]+notes?|approval[\s-]+memos?|approval[\s-]+letters?|"
    r"note[\s-]+for[\s-]+approval|sign[\s-]?off[\s-]+notes?|"
    r"approval[\s-]+documents?)"
)

# Verbs that signal a "produce this artifact" request.
_VERB = (
    r"(draft|prepare|generate|create|write|produce|make|compose|issue|"
    r"give\s+me|build)"
)

_APPROVAL_PATTERNS = [
    # e.g. "draft an approval note", "generate the approval memo"
    re.compile(rf"\b{_VERB}\b.{{0,40}}\b{_ARTIFACT}\b", re.IGNORECASE | re.DOTALL),
    # bare mention is a strong enough signal on its own
    # ("... and draft approval note", "approval note please")
    re.compile(rf"\b{_ARTIFACT}\b", re.IGNORECASE),
]

INTENT_APPROVAL_NOTE = "approval_note"
INTENT_QA = "qa"


def classify_intent(prompt: str | None) -> str:
    """Return the routed intent for a chat prompt.

    Returns ``"approval_note"`` when the prompt asks for an approval-note
    deliverable, otherwise ``"qa"`` (normal grounded RAG chat).
    """
    text = (prompt or "").strip()
    if not text:
        return INTENT_QA
    for pattern in _APPROVAL_PATTERNS:
        if pattern.search(text):
            return INTENT_APPROVAL_NOTE
    return INTENT_QA
