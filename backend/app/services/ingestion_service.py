import logging
from app.db.session import SessionLocal
from app.db.models import IngestionStatus, DocumentChunk
from app.services.document_service import DocumentService
from app.services.parsers import ParserRegistry
from app.services.storage import LocalFilesystemStorage
from app.services.chunking_service import ChunkingService
from app.services.embedding_service import get_embedding_provider
from app.services.vector_store import VectorStoreService
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
        chunking_service = ChunkingService()
        embedding_provider = get_embedding_provider()
        
        # Initialize Vector Store
        qdrant_path = str(settings.data_dir / "qdrant")
        vector_store = VectorStoreService(path=qdrant_path)
        vector_store.initialize_collection(embedding_provider.get_dimension())
        
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
            
            # Update Document Metadata
            document.page_count = len(normalized_doc.pages)
            
            # 4. Chunking
            payloads = chunking_service.chunk_document(normalized_doc)
            logger.info(f"Generated {len(payloads)} chunks for document {document.id}")
            
            if payloads:
                # 5. Embedding
                texts_to_embed = [p.content for p in payloads]
                embeddings = embedding_provider.embed_texts(texts_to_embed)
                
                # 6. Indexing in Qdrant
                vector_store.upsert_chunks(payloads, embeddings)
                
                # 7. Record chunks in SQLite to maintain source of truth
                for idx, payload in enumerate(payloads):
                    chunk_record = DocumentChunk(
                        document_id=document.id,
                        qdrant_point_id=payload.chunk_id,
                        chunk_index=idx,
                        page_number=payload.page,
                        section_name=payload.section
                    )
                    db_session.add(chunk_record)
            
            # Save all changes to DB
            db_session.commit()
            
            # 8. Finalize
            doc_service.update_job_status(job_id, IngestionStatus.READY)
            logger.info(f"Successfully completed ingestion for job {job_id}")
            
        except Exception as e:
            logger.error(f"Ingestion job {job_id} failed: {e}")
            doc_service = DocumentService(db_session) # Ensure doc_service still exists
            doc_service.update_job_status(job_id, IngestionStatus.FAILED, error_message=str(e))
        finally:
            db_session.close()
