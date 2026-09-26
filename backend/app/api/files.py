import hashlib
import uuid
import logging
import io
from fastapi import APIRouter, HTTPException, UploadFile, Depends, BackgroundTasks
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

class FileListResponse(BaseModel):
    files: list[FileInfoResponse]
    total: int

class DeleteResponse(BaseModel):
    deleted: bool
    document_id: str


@router.post("/upload", response_model=FileUploadResponse)
async def upload_file(
    file: UploadFile, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
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
    
    # Storage
    storage = LocalFilesystemStorage(base_path=str(settings.data_dir / "objects"))
    storage_key = f"{document_id}/original.{ext}"
    
    file_obj = io.BytesIO(content)
    storage.save_file(file_obj, storage_key)
    
    # Database
    doc_service = DocumentService(db)
    doc, job = doc_service.create_document(
        original_filename=file.filename,
        file_extension=ext,
        mime_type=file.content_type,
        size_bytes=len(content),
        storage_key=storage_key,
        content_hash=content_hash
    )
    
    # Enqueue Background Task
    background_tasks.add_task(IngestionService.process_document_job, job.id)
    
    return FileUploadResponse(
        document_id=doc.id,
        job_id=job.id,
        status=job.status.value,
        message="File uploaded successfully. Ingestion started in the background."
    )


@router.get("/", response_model=FileListResponse)
def list_files(db: Session = Depends(get_db)) -> FileListResponse:
    from app.db.models import Document
    docs = db.query(Document).all()
    files = []
    for d in docs:
        job = d.ingestion_job
        files.append(FileInfoResponse(
            document_id=d.id,
            filename=d.original_filename,
            file_type=d.file_extension or "",
            file_size=d.size_bytes,
            page_count=d.page_count,
            created_at=d.created_at.isoformat(),
            job_status=job.status.value if job else "UNKNOWN"
        ))
    return FileListResponse(files=files, total=len(files))


@router.get("/{document_id}", response_model=FileInfoResponse)
def get_file(document_id: str, db: Session = Depends(get_db)) -> FileInfoResponse:
    doc_service = DocumentService(db)
    d = doc_service.get_document(document_id)
    if not d:
        raise HTTPException(status_code=404, detail="Document not found.")
    job = d.ingestion_job
    return FileInfoResponse(
        document_id=d.id,
        filename=d.original_filename,
        file_type=d.file_extension or "",
        file_size=d.size_bytes,
        page_count=d.page_count,
        created_at=d.created_at.isoformat(),
        job_status=job.status.value if job else "UNKNOWN"
    )


@router.delete("/{document_id}", response_model=DeleteResponse)
def delete_file(document_id: str, db: Session = Depends(get_db)) -> DeleteResponse:
    doc_service = DocumentService(db)
    d = doc_service.get_document(document_id)
    if not d:
        raise HTTPException(status_code=404, detail="Document not found.")
    
    settings = get_settings()
    storage = LocalFilesystemStorage(base_path=str(settings.data_dir / "objects"))
    if d.storage_key:
        storage.delete_file(d.storage_key)
        
    db.delete(d)
    db.commit()
    return DeleteResponse(deleted=True, document_id=document_id)
