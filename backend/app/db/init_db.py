import logging
from sqlalchemy import text
from app.db.session import engine, Base
from app.db.models import Document, DocumentChunk

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db():
    logger.info("Initializing database...")
    
    # Create the pgvector extension if it doesn't exist
    with engine.connect() as conn:
        conn.execute(text('CREATE EXTENSION IF NOT EXISTS vector'))
        conn.commit()
    
    logger.info("Creating tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database initialized successfully.")

if __name__ == "__main__":
    init_db()
