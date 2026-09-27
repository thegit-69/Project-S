import uuid
from typing import List
from app.models.schemas import NormalizedDocument, QdrantPayload

class ChunkingConfig:
    def __init__(self, max_chars: int = 1000, overlap: int = 200):
        self.max_chars = max_chars
        self.overlap = overlap

class ChunkingService:
    def __init__(self, config: ChunkingConfig = None):
        self.config = config or ChunkingConfig()

    def chunk_document(self, document: NormalizedDocument) -> List[QdrantPayload]:
        chunks: List[QdrantPayload] = []
        
        for page in document.pages:
            # Build the parent content by joining all block contents in this page
            parent_content = "\n\n".join([b.content for b in page.blocks if b.content.strip()])
            
            for block in page.blocks:
                if not block.content.strip():
                    continue
                    
                chunk_id = str(uuid.uuid4())
                
                payload = QdrantPayload(
                    document_id=document.document_id,
                    workspace_id=document.metadata.get("workspace_id"),
                    chunk_id=chunk_id,
                    filename=document.metadata.get("original_filename", "unknown"),
                    file_type=document.metadata.get("source_type", "unknown"),
                    page=page.page_number,
                    section=block.section,
                    block_type=block.block_type,
                    content_type="text",
                    content=block.content,
                    parent_content=parent_content
                )
                chunks.append(payload)

        return chunks
