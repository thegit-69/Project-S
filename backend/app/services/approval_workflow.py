"""
Approval-note workflow orchestrator.

Deterministically chains the *active* ingestion pipeline into a single
flagship deliverable:

    (upload | existing document) -> ingest -> retrieve -> extract findings
        -> draft approval note -> export DOCX

No OCR / no offline fallback: this composes the same text-extraction path
used by ``/files/upload`` and requires the local llama.cpp server to be
running. On LLM failure a clear HTTP 503 is surfaced — a note is never
fabricated.
"""

from __future__ import annotations

import hashlib
import io
import logging
import time
import uuid
from pathlib import Path
from typing import List, Optional

from fastapi import HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.models import IngestionStatus
from app.models.base import GenerationRequest
from app.services.context_builder import ContextBuilder
from app.services.document_service import DocumentService
from app.services.ingestion_service import IngestionService
from app.services.storage import LocalFilesystemStorage

logger = logging.getLogger(__name__)

_DEFAULT_FINDINGS_QUERY = (
    "key findings, observations, defects, non-conformances and "
    "recommendations in this report"
)

_MIME_BY_EXT = {
    "pdf": "application/pdf",
    "txt": "text/plain",
    "csv": "text/csv",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
}


# ---------------------------------------------------------------------------
# Result models
# ---------------------------------------------------------------------------


class Citation(BaseModel):
    source: int
    filename: str
    page: Optional[int] = None
    section: Optional[str] = None


class WorkflowStep(BaseModel):
    name: str
    status: str = "ok"
    model: Optional[str] = None
    elapsed_ms: int = 0
    detail: Optional[str] = None


class ApprovalNoteResult(BaseModel):
    run_id: str
    document_id: str
    model: str
    steps: List[WorkflowStep]
    findings: str
    citations: List[Citation]
    note_markdown: str
    artifact_filename: str
    download_url: str


# ---------------------------------------------------------------------------
# Workflow
# ---------------------------------------------------------------------------


class ApprovalNoteWorkflow:
    """Composes the active RAG pipeline into an approval-note deliverable."""

    ARTIFACT_NAME = "approval_note.docx"

    def __init__(self, *, registry, retrieval_service, export_service,
                 audit_service, settings) -> None:
        self.registry = registry
        self.retrieval_service = retrieval_service
        self.export_service = export_service
        self.audit_service = audit_service
        self.settings = settings

    # -- public -----------------------------------------------------------

    def run(
        self,
        *,
        db: Session,
        file_bytes: Optional[bytes] = None,
        filename: Optional[str] = None,
        ext: Optional[str] = None,
        document_id: Optional[str] = None,
        title: Optional[str] = None,
        instructions: Optional[str] = None,
    ) -> ApprovalNoteResult:
        if bool(file_bytes) == bool(document_id):
            raise HTTPException(
                status_code=422,
                detail="Provide exactly one of an uploaded file or an existing document_id.",
            )

        run_id = str(uuid.uuid4())
        steps: List[WorkflowStep] = []

        # 1. Stage input (ingest fresh upload, or validate existing doc).
        if file_bytes is not None:
            document_id = self._ingest_upload(
                db=db, file_bytes=file_bytes, filename=filename, ext=ext, steps=steps
            )
        else:
            self._validate_existing(db=db, document_id=document_id, steps=steps)

        # 2. Retrieve (scoped to this document).
        t = time.perf_counter()
        query = (instructions or "").strip() or _DEFAULT_FINDINGS_QUERY
        chunks = self.retrieval_service.search(
            query=query, top_k=8, document_id=document_id
        )
        if not chunks:
            raise HTTPException(
                status_code=422,
                detail="No indexed content found for this document.",
            )
        steps.append(WorkflowStep(
            name="retrieve", elapsed_ms=_ms(t), detail=f"{len(chunks)} chunks",
        ))

        citations = [
            Citation(source=i + 1, filename=c.filename, page=c.page, section=c.section)
            for i, c in enumerate(chunks)
        ]

        # 3. Build grounded context.
        context = ContextBuilder.build_context(chunks)

        # 4. Resolve provider (shared across both LLM calls).
        avail = self.registry.get_available(preferred="general")
        if avail is None:
            raise HTTPException(
                status_code=503,
                detail="No local LLM provider is available. Start the llama-server.",
            )
        model_name, provider = avail

        # 5. LLM call #1 — extract findings.
        t = time.perf_counter()
        findings = self._generate(
            provider,
            system_prompt=(
                "You are a senior engineer analysing an industrial inspection "
                "report for MRPL. You reason only from the provided sources and "
                "cite them as [Source n]. You never invent facts."
            ),
            prompt=(
                "Extract the key findings from the report as concise bullet "
                "points. Cover observations, defects, non-conformances and "
                "recommendations. Cite each point with its [Source n].\n\n"
                f"{context}"
            ),
            max_tokens=1024,
        )
        steps.append(WorkflowStep(
            name="extract_findings", model=model_name, elapsed_ms=_ms(t),
        ))

        # 6. LLM call #2 — draft the approval note (markdown).
        t = time.perf_counter()
        note_markdown = self._generate(
            provider,
            system_prompt=(
                "You draft formal approval notes for MRPL management. Output "
                "clean Markdown only, grounded strictly in the findings and "
                "sources provided. Do not fabricate names, dates or figures."
            ),
            prompt=self._note_prompt(findings, context, title),
            max_tokens=1536,
        )
        steps.append(WorkflowStep(
            name="draft_note", model=model_name, elapsed_ms=_ms(t),
        ))

        # 7. Export DOCX.
        t = time.perf_counter()
        doc_title = (title or "").strip() or "Approval Note"
        docx_bytes = self.export_service.markdown_to_docx(doc_title, note_markdown)
        out_path = self._artifact_path(document_id)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_bytes(docx_bytes)
        steps.append(WorkflowStep(
            name="export_docx", elapsed_ms=_ms(t), detail=f"{len(docx_bytes)} bytes",
        ))

        download_url = f"/workflows/approval-note/{document_id}/download"

        # 8. Audit.
        try:
            self.audit_service.record(
                task="approval_note_workflow",
                selected_model=model_name,
                execution_status="success",
                metadata={
                    "run_id": run_id,
                    "document_id": document_id,
                    "chunks": len(chunks),
                    "steps": [s.name for s in steps],
                },
            )
        except Exception:  # noqa: BLE001 - auditing must never break the run
            logger.exception("Failed to write approval-note audit record")

        return ApprovalNoteResult(
            run_id=run_id,
            document_id=document_id,
            model=model_name,
            steps=steps,
            findings=findings,
            citations=citations,
            note_markdown=note_markdown,
            artifact_filename=self.ARTIFACT_NAME,
            download_url=download_url,
        )

    def artifact_path(self, document_id: str) -> Path:
        """Public accessor used by the download route (no path traversal)."""
        return self._artifact_path(document_id)

    # -- internals --------------------------------------------------------

    def _artifact_path(self, document_id: str) -> Path:
        # Guard against traversal: document_id must be a bare uuid-like token.
        if "/" in document_id or "\\" in document_id or ".." in document_id:
            raise HTTPException(status_code=400, detail="Invalid document_id.")
        return self.settings.data_dir / "outputs" / document_id / self.ARTIFACT_NAME

    def _storage(self) -> LocalFilesystemStorage:
        return LocalFilesystemStorage(base_path=str(self.settings.data_dir / "objects"))

    def _ingest_upload(self, *, db, file_bytes, filename, ext, steps) -> str:
        if not ext:
            raise HTTPException(status_code=422, detail="File extension is required.")

        t = time.perf_counter()
        content_hash = hashlib.sha256(file_bytes).hexdigest()
        document_id = str(uuid.uuid4())
        storage_key = f"{document_id}/original.{ext}"
        self._storage().save_file(io.BytesIO(file_bytes), storage_key)

        doc_service = DocumentService(db)
        doc, job = doc_service.create_document(
            original_filename=filename or f"upload.{ext}",
            file_extension=ext,
            mime_type=_MIME_BY_EXT.get(ext, "application/octet-stream"),
            size_bytes=len(file_bytes),
            storage_key=storage_key,
            content_hash=content_hash,
            document_id=document_id,
        )
        doc.source = "workflow"
        db.commit()

        # Run ingestion inline/synchronously (opens its own session internally).
        IngestionService.process_document_job(job.id, self.registry)

        # Re-read the job status from the DB (ingestion committed in its own session).
        db.expire_all()
        job = doc_service.get_job(job.id)
        if not job or job.status != IngestionStatus.READY:
            detail = (job.error_message if job and job.error_message
                      else "Document ingestion failed.")
            raise HTTPException(status_code=500, detail=detail)

        steps.append(WorkflowStep(name="ingest", elapsed_ms=_ms(t), detail=document_id))
        return document_id

    def _validate_existing(self, *, db, document_id, steps) -> None:
        t = time.perf_counter()
        doc = DocumentService(db).get_document(document_id)
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found.")
        job = doc.ingestion_job
        if not job or job.status != IngestionStatus.READY:
            status = job.status.value if job else "MISSING"
            raise HTTPException(
                status_code=409,
                detail=f"Document is not ready for use (ingestion status: {status}).",
            )
        steps.append(WorkflowStep(name="ingest", elapsed_ms=_ms(t), detail="reused"))

    def _generate(self, provider, *, system_prompt, prompt, max_tokens) -> str:
        try:
            resp = provider.generate(GenerationRequest(
                system_prompt=system_prompt,
                prompt=prompt,
                max_tokens=max_tokens,
                temperature=0.2,
            ))
        except Exception as exc:  # noqa: BLE001 - surface as a clear 503
            logger.error("LLM generation failed: %s", exc)
            raise HTTPException(
                status_code=503,
                detail=("Local LLM server must be running (start llama-server). "
                        f"Generation error: {exc}"),
            ) from exc
        text = (resp.text or "").strip()
        if not text:
            raise HTTPException(
                status_code=503,
                detail="Local LLM returned an empty response.",
            )
        return text

    @staticmethod
    def _note_prompt(findings: str, context: str, title: Optional[str]) -> str:
        subject = (title or "").strip() or "Approval Note"
        return (
            "Draft a formal approval note using the exact Markdown structure "
            "below. Ground every statement in the findings and sources; cite "
            "sources as [Source n]. Keep it concise and management-ready.\n\n"
            f"# {subject}\n"
            "**Subject:** <one line>\n\n"
            "## Background\n<2-3 sentences of context>\n\n"
            "## Key Findings\n<bulleted findings with [Source n] citations>\n\n"
            "## Assessment\n<risk / impact assessment grounded in findings>\n\n"
            "## Recommendation\n<clear recommended action>\n\n"
            "## Approval\n- Prepared by: _______\n- Reviewed by: _______\n"
            "- Approved by: _______\n\n"
            "---\n"
            "FINDINGS:\n"
            f"{findings}\n\n"
            "SOURCES:\n"
            f"{context}"
        )


def _ms(start: float) -> int:
    return int((time.perf_counter() - start) * 1000)
