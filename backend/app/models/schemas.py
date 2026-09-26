from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class Block(BaseModel):
    block_id: str
    block_type: str  # e.g., 'heading', 'paragraph', 'list', 'table', 'image_ref', 'sheet_summary'
    content: str
    page: Optional[int] = None
    section: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

class NormalizedPage(BaseModel):
    page_number: int
    blocks: List[Block]

class NormalizedDocument(BaseModel):
    document_id: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    pages: List[NormalizedPage] = Field(default_factory=list)
    assets: List[Dict[str, str]] = Field(default_factory=list)

class QdrantPayload(BaseModel):
    document_id: str
    workspace_id: Optional[str] = None
    chunk_id: str
    filename: str
    file_type: str
    page: Optional[int] = None
    section: Optional[str] = None
    block_type: str
    content_type: str
    content: str
