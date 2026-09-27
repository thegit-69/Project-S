"""
Flagship approval-note workflow routes.

    POST /workflows/approval-note                       — run the pipeline
    GET  /workflows/approval-note/{document_id}/download — stream the DOCX
"""

from __future__ import annotations

import logging
from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    Form,
    HTTPException,
    Request,
    UploadFile,
)
from fastapi.responses import Response
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db.session import get_db
from app.services.approval_workflow import ApprovalNoteResult
from app.services.intent_router import classify_intent, INTENT_APPROVAL_NOTE

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/workflows", tags=["workflows"])

_DOCX_MEDIA_TYPE = (
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
)


@router.post("/approval-note", response_model=ApprovalNoteResult)
async def create_approval_note(
    request: Request,
    file: Optional[UploadFile] = None,
    document_id: Optional[str] = Form(None),
    title: Optional[str] = Form(None),
    instructions: Optional[str] = Form(None),
    db: Session = Depends(get_db),
) -> ApprovalNoteResult:
    """Run the RAG → findings → note → DOCX pipeline in a single call."""
    settings = get_settings()

    has_file = file is not None and file.filename
    has_doc_id = bool(document_id)
    if has_file == has_doc_id:
        raise HTTPException(
            status_code=422,
            detail="Provide exactly one of: an uploaded file or a document_id.",
        )

    file_bytes: Optional[bytes] = None
    ext: Optional[str] = None
    filename: Optional[str] = None

    if has_file:
        filename = file.filename
        ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
        if ext not in settings.allowed_extensions:
            raise HTTPException(
                status_code=422, detail=f"Unsupported file type '.{ext}'."
            )
        file_bytes = await file.read()
        if len(file_bytes) > settings.max_upload_size:
            raise HTTPException(status_code=413, detail="File too large.")
        if len(file_bytes) == 0:
            raise HTTPException(status_code=422, detail="File is empty.")

    workflow = getattr(request.app.state, "approval_workflow", None)
    if workflow is None:
        raise HTTPException(
            status_code=503, detail="Approval-note workflow is not initialised."
        )

    return workflow.run(
        db=db,
        file_bytes=file_bytes,
        filename=filename,
        ext=ext,
        document_id=document_id,
        title=title,
        instructions=instructions,
    )


# ---------------------------------------------------------------------------
# Agent-routed chat entrypoint
# ---------------------------------------------------------------------------


class AgentChatRequest(BaseModel):
    prompt: str
    document_id: Optional[str] = None
    title: Optional[str] = None


class AgentChatResponse(BaseModel):
    """Routing result for a chat prompt.

    ``intent="qa"``            -> the caller should fall back to normal RAG chat.
    ``intent="approval_note"`` -> ``result`` holds the generated note, or
                                  ``error`` explains why it could not be produced.
    """

    intent: str
    result: Optional[ApprovalNoteResult] = None
    error: Optional[str] = None


@router.post("/agent-chat", response_model=AgentChatResponse)
def agent_chat(
    body: AgentChatRequest,
    request: Request,
    db: Session = Depends(get_db),
) -> AgentChatResponse:
    """Thin agent layer for the chat box.

    Detects an approval-note request and, when a document is selected, runs the
    ApprovalNoteWorkflow and returns the note + citations + download URL inline.
    Any other prompt is reported as ``qa`` so the caller streams a normal
    grounded RAG answer instead. LLM/workflow failures are surfaced verbatim in
    ``error`` — a note is never fabricated.
    """
    intent = classify_intent(body.prompt)
    if intent != INTENT_APPROVAL_NOTE:
        return AgentChatResponse(intent=INTENT_QA)

    if not body.document_id:
        return AgentChatResponse(
            intent=INTENT_APPROVAL_NOTE,
            error="Attach or select a document first, then ask me to draft the approval note.",
        )

    workflow = getattr(request.app.state, "approval_workflow", None)
    if workflow is None:
        return AgentChatResponse(
            intent=INTENT_APPROVAL_NOTE,
            error="Approval-note workflow is not initialised.",
        )

    try:
        result = workflow.run(
            db=db,
            document_id=body.document_id,
            title=body.title or "Approval Note",
            instructions=body.prompt,
        )
    except HTTPException as exc:
        return AgentChatResponse(intent=INTENT_APPROVAL_NOTE, error=str(exc.detail))

    return AgentChatResponse(intent=INTENT_APPROVAL_NOTE, result=result)


@router.get("/approval-note/{document_id}/download")
def download_approval_note(
    document_id: str, request: Request
) -> Response:
    """Stream the generated approval-note DOCX for a document."""
    workflow = getattr(request.app.state, "approval_workflow", None)
    if workflow is None:
        raise HTTPException(
            status_code=503, detail="Approval-note workflow is not initialised."
        )

    path = workflow.artifact_path(document_id)
    if not path.exists():
        raise HTTPException(
            status_code=404, detail="No approval note found for this document."
        )

    content = path.read_bytes()
    return Response(
        content=content,
        media_type=_DOCX_MEDIA_TYPE,
        headers={
            "Content-Disposition": 'attachment; filename="approval_note.docx"',
            "Content-Length": str(len(content)),
        },
    )
