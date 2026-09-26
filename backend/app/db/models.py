import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from app.db.session import Base
import enum

def generate_uuid():
    return str(uuid.uuid4())

class IngestionStatus(str, enum.Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    READY = "READY"
    FAILED = "FAILED"

class Workspace(Base):
    __tablename__ = "workspaces"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    documents = relationship("Document", back_populates="workspace", cascade="all, delete-orphan")

class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=True)
    original_filename = Column(String(255), nullable=False)
    file_extension = Column(String(50), nullable=True)
    mime_type = Column(String(100), nullable=True)
    size_bytes = Column(Integer, default=0)
    content_hash = Column(String(255), nullable=True)
    storage_key = Column(String(1024), nullable=True) # e.g. objects/{id}/original.pdf
    page_count = Column(Integer, default=0)
    sheet_count = Column(Integer, default=0)
    embedding_model_used = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    workspace = relationship("Workspace", back_populates="documents")
    ingestion_job = relationship("IngestionJob", back_populates="document", uselist=False, cascade="all, delete-orphan")
    assets = relationship("DocumentAsset", back_populates="document", cascade="all, delete-orphan")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")

class IngestionJob(Base):
    __tablename__ = "ingestion_jobs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    status = Column(Enum(IngestionStatus), default=IngestionStatus.PENDING)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    document = relationship("Document", back_populates="ingestion_job")

class DocumentAsset(Base):
    __tablename__ = "document_assets"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    asset_type = Column(String(50), nullable=False) # e.g. image, rendered_page
    storage_key = Column(String(1024), nullable=False)
    page_number = Column(Integer, nullable=True)

    document = relationship("Document", back_populates="assets")

class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    qdrant_point_id = Column(String(36), nullable=False) # maps to Qdrant UUID
    chunk_index = Column(Integer, nullable=False)
    page_number = Column(Integer, nullable=True)
    section_name = Column(String(255), nullable=True)

    document = relationship("Document", back_populates="chunks")
