# Implementation Guide — Flagship Approval-Note Workflow (RAG → Findings → Note → DOCX)

> Standalone handoff. Everything needed to implement in a fresh chat is below.
> Project root: `E:\Hackathon\SIH 2026\project-s`

## Context / Goal
PRD headline demo (SIH 2026 / Problem 26117, MRPL): take a report PDF → RAG-extract key
findings → draft an approval note → produce a Word (DOCX) deliverable, fully on-premise.
All components exist but are **not chained**. We add one deterministic orchestration
service + one API router that composes the existing active pipeline into a single call.

## Scope decisions (confirmed by user — do NOT deviate)
1. **No OCR.** Use the **active ingestion pipeline only** (`PdfParser` text extraction via
   pypdf). Do **not** wire in the orphaned `app/documents/ocr_processor.py` / pipeline B.
   Scanned/image-only PDFs are out of scope this iteration.
2. **Live servers.** The user runs the backend and the llama.cpp ai-inference server. On
   LLM failure, surface a clear error — do **not** add offline fallbacks.
3. **Tooling: `uv`** (not bare python). Run commands are at the bottom.
4. **Endpoint input:** accept **either** a fresh multipart PDF upload **or** an existing
   `document_id`. **Response:** JSON (`findings`, `citations`, `note_markdown`, `steps`,
   `download_url`) + a **separate GET** that streams the DOCX.

## Existing components to reuse (paths + signatures)
- Active ingest: `IngestionService.process_document_job(job_id, registry=None)` (sync
  staticmethod, opens own `SessionLocal`) — `backend/app/services/ingestion_service.py`.
- Upload logic to replicate: `backend/app/api/files.py:87-113` (hash, uuid4, `storage.save_file`,
  `DocumentService.create_document`, set `.source`, commit).
- `DocumentService(db)` — `create_document(...)`, `get_document(id)`, `get_job(id)` —
  `backend/app/services/document_service.py`.
- `LocalFilesystemStorage(base_path=str(settings.data_dir / "objects"))`,
  `save_file(BytesIO, key)`, `read_file(key)` — `backend/app/services/storage.py`.
- `RetrievalService.search(query, top_k=5, document_id=None) -> List[QdrantPayload]`
  (hybrid dense+sparse RRF, filters by document_id) — `backend/app/services/retrieval_service.py`.
- `ContextBuilder.build_context(chunks: List[QdrantPayload]) -> str` (static; emits
  `[Source n: file, Page p, Section s]`) — `backend/app/services/context_builder.py`.
- `QdrantPayload` fields: `document_id, chunk_id, filename, file_type, page, section,
  block_type, content_type, content, parent_content` — `backend/app/models/schemas.py`.
- Generation: `name, provider = registry.get_available(preferred="general")`;
  `provider.generate(GenerationRequest(prompt, system_prompt, max_tokens, temperature, images))
  -> GenerationResponse(text, model_name, tokens_used, metadata)` —
  `backend/app/models/base.py`, `backend/app/models/registry.py`.
- DOCX: `ExportService().markdown_to_docx(title, markdown_text) -> bytes` —
  `backend/app/services/export_service.py:125`.
- DOCX Response pattern (attachment headers): `backend/app/api/studio.py` /
  `backend/app/api/files.py:167`.
- `AuditService` (log entry per run) — on `app.state.audit_service`.
- `settings.data_dir`, `settings.allowed_extensions`, `settings.max_upload_size` —
  `backend/app/config.py`.

## New file: `backend/app/services/approval_workflow.py`
Class `ApprovalNoteWorkflow` constructed with: `registry`, `retrieval_service` (reuse the
`new_retrieval_service` already built in `main.py`), `export_service` (`ExportService()`),
`audit_service`, `settings`. Uses `ContextBuilder` (static) + `DocumentService` /
`IngestionService` / `LocalFilesystemStorage` for the ingest sub-step.

Define a small result dataclass/pydantic model `ApprovalNoteResult(run_id, document_id,
model, steps, findings, citations, note_markdown, artifact_filename, download_url)`.

Method `run(*, db, file_bytes=None, filename=None, ext=None, document_id=None, title=None,
instructions=None) -> ApprovalNoteResult`:
1. **Stage input.**
   - If `file_bytes`: replicate `files.py:87-113` — sha256 hash, `document_id = uuid4()`,
     `storage_key = f"{document_id}/original.{ext}"`, `storage.save_file(BytesIO(bytes), key)`,
     `DocumentService(db).create_document(...)`, set `doc.source = "workflow"`, `db.commit()`.
     Then run ingestion **inline/synchronously**: `IngestionService.process_document_job(job.id, registry)`.
     Re-fetch the job; if status != READY → raise with the job error message.
   - If `document_id`: `DocumentService(db).get_document(document_id)`; 404 if missing; ensure its
     ingestion job is READY (else 409 "document still processing / failed").
2. **Retrieve (scoped):** `chunks = retrieval_service.search(query=findings_query, top_k=8,
   document_id=document_id)`. `findings_query` = `instructions` or default:
   "key findings, observations, defects, non-conformances and recommendations in this report".
   If `chunks` empty → raise 422 "no indexed content found for this document".
3. **Context:** `context = ContextBuilder.build_context(chunks)`.
4. **LLM call #1 — findings:** `name, provider = registry.get_available(preferred="general")`
   (raise 503 if None). `provider.generate(GenerationRequest(system_prompt=<analyst reading an
   industrial inspection report>, prompt=f"Extract the key findings as concise bullet points,
   citing sources.\n\n{context}", max_tokens=1024, temperature=0.2))` → `findings`.
5. **LLM call #2 — approval note:** second `generate` with a structured template
   (Subject / Background / Key Findings / Assessment / Recommendation / Approval block),
   grounded in `findings` + citation list → **markdown** `note_markdown`.
6. **Export DOCX:** `docx_bytes = export_service.markdown_to_docx(title or "Approval Note",
   note_markdown)`; write to `settings.data_dir / "outputs" / document_id / "approval_note.docx"`
   (mkdir parents). `download_url = f"/workflows/approval-note/{document_id}/download"`.
7. **Audit + steps:** build `steps` list (`ingest`, `retrieve`, `extract_findings`,
   `draft_note`, `export_docx`) each with model + elapsed ms; one `audit_service` entry.
   Build `citations` from the retrieved payloads (`filename`, `page`, `section`). Return the
   `ApprovalNoteResult`.

**Errors:** provider unavailable / `generate()` raises → HTTP 503 "local LLM server must be
running (start llama-server)"; never fabricate a note. Keep each LLM prompt deterministic
(temperature 0.2) for a reliable demo.

## New file: `backend/app/api/workflows.py`
`router = APIRouter(prefix="/workflows", tags=["workflows"])`.
- `POST /workflows/approval-note` — params: `file: UploadFile | None = None`,
  `document_id: str | None = Form(None)`, `title: str | None = Form(None)`,
  `instructions: str | None = Form(None)`, `request: Request`, `db = Depends(get_db)`.
  Validate exactly one of `file`/`document_id`. For `file`: reuse ext/size checks from
  `files.py:80-91`, `content = await file.read()`. Pull `wf = request.app.state.approval_workflow`;
  call `wf.run(...)`; return `ApprovalNoteResult` as JSON.
- `GET /workflows/approval-note/{document_id}/download` — read
  `settings.data_dir / "outputs" / document_id / "approval_note.docx"` (key strictly on
  `document_id`, no traversal); return `Response(content=bytes,
  media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  headers={"Content-Disposition": f'attachment; filename="approval_note.docx"'})`. 404 if absent.

## Wiring: `backend/app/main.py`
- In `lifespan` startup (after the orchestrator, ~line 202): build
  `ApprovalNoteWorkflow(registry=model_registry, retrieval_service=new_retrieval_service,
  export_service=ExportService(), audit_service=audit_service, settings=settings)` and set
  `app.state.approval_workflow = ...` (mirror the `orchestrator` wiring).
- Register router (~line 321): `from app.api import workflows as workflows_api;
  app.include_router(workflows_api.router)`.
- Optional: add `"approval_workflow": True` to `/health` subsystems.

## Tests
Primary is **live e2e** (servers on). Add `backend/tests/run_approval_workflow_e2e.py`:
- POST `/workflows/approval-note` (multipart) with a text PDF from `test_files/`
  (`Invoice-ZBQNYIEJ-0011.pdf` or `MRPL annual report multi page.pdf`) → assert 200 +
  non-empty `findings` + `note_markdown` + `citations`.
- Repeat with `document_id` of an already-uploaded doc → assert 200.
- GET the `download_url` → assert 200 + `Content-Type` docx + non-empty body; optionally
  open with `python-docx` to confirm it's a valid document.
- Hit `/health` → assert network compliance shows only local endpoints (sovereignty proof).

Optional offline unit test `backend/tests/test_approval_workflow.py` for the non-LLM glue
(citation building, download path, validation that exactly one input source is required)
using a fake provider — but LLM generation is validated against the live server.

## Run commands (uv + llama-server)
AI inference server:
```bash
llama-server.exe -hf ggml-org/gemma-3-4b-it-GGUF:Q4_K_M -ngl 99 -c 8192 -np 1
```
Backend:
```bash
cd "E:/Hackathon/SIH 2026/project-s/backend" && source ".venv/Scripts/activate" && uv run uvicorn app.main:app --host 127.0.0.1 --port 8000
```
E2E test (new terminal, both servers up):
```bash
cd "E:/Hackathon/SIH 2026/project-s/backend" && uv run python tests/run_approval_workflow_e2e.py
```

## Files touched
| File | Change |
|---|---|
| `backend/app/services/approval_workflow.py` | **New** orchestrator (ingest→retrieve→findings→note→docx) |
| `backend/app/api/workflows.py` | **New** router: POST + download GET |
| `backend/app/main.py` | Build workflow in lifespan, register router |
| `backend/tests/run_approval_workflow_e2e.py` | **New** live e2e script |
| `backend/tests/test_approval_workflow.py` | **New (optional)** offline glue tests |

No changes to `ingestion_service.py` / `parsers.py` (active pipeline reused as-is).

## Verification checklist
1. Backend boots; `app.state.approval_workflow` set; `/health` OK; `workflows` routes listed
   (`GET /openapi.json`).
2. With both servers up: e2e returns findings + downloadable valid DOCX for upload AND
   document_id inputs.
3. LLM server down → clear 503, no fabricated note.
4. `/health` network compliance shows no external endpoints.

## Frontend (user tests separately)
Add a "Generate Approval Note" action that POSTs to `/workflows/approval-note` (file or
selected Library `document_id`), renders `findings` + `citations` + `note_markdown`, and
links the returned `download_url`. App shell/routes: `frontend/src/App.jsx`.

