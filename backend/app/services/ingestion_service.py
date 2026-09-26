import logging
import time
from app.db.session import SessionLocal
from app.db.models import IngestionStatus
from app.services.document_service import DocumentService

logger = logging.getLogger(__name__)

class IngestionService:
    @staticmethod
    def process_document_job(job_id: str):
        """
        Background worker task to process a document ingestion job.
        """
        db_session = SessionLocal()
        try:
            doc_service = DocumentService(db_session)
            logger.info(f"Starting background ingestion for job {job_id}")
            
            # 1. Update status to PROCESSING
            doc_service.update_job_status(job_id, IngestionStatus.PROCESSING)
            
            # 2. Simulate heavy lifting (parsing, chunking, embedding, indexing)
            # TODO: Integrate ParserRegistry, ChunkingService, EmbeddingService, Qdrant here.
            time.sleep(3) # Simulate work
            
            # 3. Finalize
            doc_service.update_job_status(job_id, IngestionStatus.READY)
            logger.info(f"Successfully completed ingestion for job {job_id}")
            
        except Exception as e:
            logger.error(f"Ingestion job {job_id} failed: {e}")
            doc_service = DocumentService(db_session) # Ensure doc_service still exists
            doc_service.update_job_status(job_id, IngestionStatus.FAILED, error_message=str(e))
        finally:
            db_session.close()
