from typing import List
from app.models.schemas import QdrantPayload

class ContextBuilder:
    @staticmethod
    def build_context(chunks: List[QdrantPayload]) -> str:
        """
        Formats the retrieved chunks into a prompt-ready string,
        injecting provenance (filename, page, section) for citations.
        """
        if not chunks:
            return "No relevant context found."
            
        context_parts = []
        for i, chunk in enumerate(chunks):
            # Citation Header
            header = f"[Source {i+1}: {chunk.filename}"
            if chunk.page is not None:
                header += f", Page {chunk.page}"
            if chunk.section:
                header += f", Section: {chunk.section}"
            header += "]"
            
            # Content
            context_parts.append(f"{header}\n{chunk.content}")
            
        return "\n\n".join(context_parts)
