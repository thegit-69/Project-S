import asyncio
import hashlib
import uuid
import logging
import io
from fastapi import APIRouter, HTTPException, UploadFile, Depends, BackgroundTasks, Query, Request
from fastapi.responses import Response
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.config import get_settings
from app.services.storage import LocalFilesystemStorage
from app.services.document_service import DocumentService
from app.services.ingestion_service import IngestionService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/files", tags=["files"])


class FileUploadResponse(BaseModel):
    document_id: str
    job_id: str
    status: str
    message: str


class FileInfoResponse(BaseModel):
    document_id: str
    filename: str
    file_type: str
    file_size: int
    page_count: int
    created_at: str
    job_status: str
    source: str = "library"
    chunk_count: int = 0


class FileListResponse(BaseModel):
    files: list[FileInfoResponse]
    total: int


class DeleteResponse(BaseModel):
    deleted: bool
    document_id: str


def _storage():
    settings = get_settings()
    return LocalFilesystemStorage(base_path=str(settings.data_dir / "objects"))


def _doc_to_response(d, job=None) -> FileInfoResponse:
    from app.db.models import DocumentChunk
    return FileInfoResponse(
        document_id=d.id,
        filename=d.original_filename,
        file_type=d.file_extension or "",
        file_size=d.size_bytes,
        page_count=d.page_count or 0,
        created_at=d.created_at.isoformat(),
        job_status=(job or d.ingestion_job).status.value if (job or d.ingestion_job) else "UNKNOWN",
        source=d.source or "library",
        chunk_count=len(d.chunks) if d.chunks else 0,
    )


@router.post("/upload", response_model=FileUploadResponse)
async def upload_file(
    file: UploadFile,
    background_tasks: BackgroundTasks,
    request: Request,
    source: str = Query(default="library", description="Origin: 'library' | 'knowledge' | 'chat'"),
    db: Session = Depends(get_db),
):
    settings = get_settings()

    if not file.filename:
        raise HTTPException(status_code=422, detail="Filename is required.")

    ext = file.filename.rsplit(".", maxsplit=1)[-1].lower() if "." in file.filename else ""
    if ext not in settings.allowed_extensions:
        raise HTTPException(status_code=422, detail=f"Unsupported file type '.{ext}'.")

    content = await file.read()
    if len(content) > settings.max_upload_size:
        raise HTTPException(status_code=413, detail="File too large.")
    if len(content) == 0:
        raise HTTPException(status_code=422, detail="File is empty.")

    content_hash = hashlib.sha256(content).hexdigest()
    document_id = str(uuid.uuid4())

    storage = _storage()
    storage_key = f"{document_id}/original.{ext}"
    storage.save_file(io.BytesIO(content), storage_key)

    doc_service = DocumentService(db)
    doc, job = doc_service.create_document(
        original_filename=file.filename,
        file_extension=ext,
        mime_type=file.content_type,
        size_bytes=len(content),
        storage_key=storage_key,
        content_hash=content_hash,
        document_id=document_id,
    )

    # Stamp the source so it shows up correctly in the Library
    doc.source = source
    db.commit()

    registry = getattr(request.app.state, "registry", None)
    background_tasks.add_task(IngestionService.process_document_job, job.id, registry)

    return FileUploadResponse(
        document_id=doc.id,
        job_id=job.id,
        status=job.status.value,
        message="File uploaded successfully. Ingestion started in the background.",
    )


@router.get("/", response_model=FileListResponse)
def list_files(
    file_type: str = Query(default="", description="Filter by file extension, e.g. 'pdf'"),
    search: str = Query(default="", description="Search by filename (case-insensitive)"),
    db: Session = Depends(get_db),
) -> FileListResponse:
    from app.db.models import Document
    query = db.query(Document)
    if file_type:
        query = query.filter(Document.file_extension == file_type.lower().lstrip("."))
    if search:
        query = query.filter(Document.original_filename.ilike(f"%{search}%"))
    docs = query.order_by(Document.created_at.desc()).all()
    files = [_doc_to_response(d) for d in docs]
    return FileListResponse(files=files, total=len(files))


@router.get("/{document_id}", response_model=FileInfoResponse)
def get_file(document_id: str, db: Session = Depends(get_db)) -> FileInfoResponse:
    d = DocumentService(db).get_document(document_id)
    if not d:
        raise HTTPException(status_code=404, detail="Document not found.")
    return _doc_to_response(d)


@router.get("/{document_id}/download")
async def download_file(document_id: str, db: Session = Depends(get_db)) -> Response:
    """Serve the original file bytes as a downloadable attachment."""
    d = DocumentService(db).get_document(document_id)
    if not d:
        raise HTTPException(status_code=404, detail="Document not found.")
    if not d.storage_key:
        raise HTTPException(status_code=404, detail="File not stored.")

    storage = _storage()
    try:
        content = await asyncio.to_thread(storage.read_file, d.storage_key)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File missing on disk.")

    mime = d.mime_type or "application/octet-stream"
    return Response(
        content=content,
        media_type=mime,
        headers={
            "Content-Disposition": f'attachment; filename="{d.original_filename}"',
            "Content-Length": str(len(content)),
        },
    )


@router.delete("/{document_id}", response_model=DeleteResponse)
def delete_file(document_id: str, db: Session = Depends(get_db)) -> DeleteResponse:
    d = DocumentService(db).get_document(document_id)
    if not d:
        raise HTTPException(status_code=404, detail="Document not found.")

    storage = _storage()
    if d.storage_key:
        storage.delete_file(d.storage_key)

    # Also remove associated Qdrant vectors
    try:
        from app.services.vector_store import VectorStoreService
        settings = get_settings()
        vs = VectorStoreService(path=str(settings.data_dir / "qdrant"))
        point_ids = [chunk.qdrant_point_id for chunk in (d.chunks or [])]
        if point_ids:
            vs.delete_points(point_ids)
    except Exception as e:
        logger.warning("Could not remove vectors for document %s: %s", document_id, e)

    db.delete(d)
    db.commit()
    return DeleteResponse(deleted=True, document_id=document_id)
