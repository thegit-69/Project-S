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
            for block in page.blocks:
                text = block.content
                start = 0
                while start < len(text) or (start == 0 and len(text) == 0):
                    end = start + self.config.max_chars
                    chunk_content = text[start:end]
                    
                    if not chunk_content.strip():
                        start += self.config.max_chars - self.config.overlap
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
                        content=chunk_content
                    )
                    chunks.append(payload)
                    
                    if end >= len(text):
                        break
                        
                    start += self.config.max_chars - self.config.overlap

        return chunks
