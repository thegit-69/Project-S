import logging
import time
from app.db.session import SessionLocal
from app.db.models import IngestionStatus
from app.services.document_service import DocumentService
from app.services.parsers import ParserRegistry
from app.services.storage import LocalFilesystemStorage
from app.config import get_settings

logger = logging.getLogger(__name__)

class IngestionService:
    @staticmethod
    def process_document_job(job_id: str):
        """
        Background worker task to process a document ingestion job.
        """
        db_session = SessionLocal()
        settings = get_settings()
        storage = LocalFilesystemStorage(base_path=str(settings.data_dir / "objects"))
        parser_registry = ParserRegistry()
        
        try:
            doc_service = DocumentService(db_session)
            job = doc_service.get_job(job_id)
            if not job or not job.document:
                logger.error(f"Job {job_id} or its document not found.")
                return

            document = job.document
            logger.info(f"Starting background ingestion for job {job_id}, document {document.id}")
            
            # 1. Update status to PROCESSING
            doc_service.update_job_status(job_id, IngestionStatus.PROCESSING)
            
            # 2. Fetch File Path
            file_path = str(storage._get_absolute_path(document.storage_key))
            
            # 3. Parse Document
            parser = parser_registry.get_parser(document.file_extension)
            normalized_doc = parser.parse(file_path=file_path, document_id=document.id)
            
            logger.info(f"Parsed {len(normalized_doc.pages)} pages for document {document.id}")
            
            # 4. Update Document Metadata (e.g. page count)
            document.page_count = len(normalized_doc.pages)
            db_session.commit()
            
            # 5. TODO: ChunkingService, EmbeddingService, Qdrant
            time.sleep(1) # Simulating chunking/embedding time
            
            # 6. Finalize
            doc_service.update_job_status(job_id, IngestionStatus.READY)
            logger.info(f"Successfully completed ingestion for job {job_id}")
            
        except Exception as e:
            logger.error(f"Ingestion job {job_id} failed: {e}")
            doc_service = DocumentService(db_session) # Ensure doc_service still exists
            doc_service.update_job_status(job_id, IngestionStatus.FAILED, error_message=str(e))
        finally:
            db_session.close()
