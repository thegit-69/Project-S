import logging
from app.db.session import engine, Base
from app.db.models import Workspace, Document, IngestionJob, DocumentAsset, DocumentChunk

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db():
    logger.info("Initializing database...")
    
    logger.info("Creating tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database initialized successfully.")

if __name__ == "__main__":
    init_db()
