import hashlib
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from app.db.models import Document, IngestionJob, IngestionStatus

class DocumentService:
    def __init__(self, db_session: Session):
        self.db = db_session

    def create_document(self, original_filename: str, file_extension: str, mime_type: str, 
                        size_bytes: int, storage_key: str, content_hash: str) -> Tuple[Document, IngestionJob]:
        """Creates a new document and an associated PENDING ingestion job."""
        
        doc = Document(
            original_filename=original_filename,
            file_extension=file_extension,
            mime_type=mime_type,
            size_bytes=size_bytes,
            storage_key=storage_key,
            content_hash=content_hash
        )
        self.db.add(doc)
        self.db.commit()
        self.db.refresh(doc)
        
        job = IngestionJob(
            document_id=doc.id,
            status=IngestionStatus.PENDING
        )
        self.db.add(job)
        self.db.commit()
        self.db.refresh(job)
        
        return doc, job

    def get_document(self, document_id: str) -> Optional[Document]:
        return self.db.query(Document).filter(Document.id == document_id).first()

    def get_job(self, job_id: str) -> Optional[IngestionJob]:
        return self.db.query(IngestionJob).filter(IngestionJob.id == job_id).first()

    def update_job_status(self, job_id: str, status: IngestionStatus, error_message: str = None):
        from datetime import datetime
        job = self.get_job(job_id)
        if job:
            job.status = status
            if error_message:
                job.error_message = error_message
            if status == IngestionStatus.PROCESSING:
                job.started_at = datetime.utcnow()
            elif status in (IngestionStatus.READY, IngestionStatus.FAILED):
                job.completed_at = datetime.utcnow()
            
            self.db.commit()
            self.db.refresh(job)
        return job
