from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional
from app.services.embedding_service import get_embedding_provider
from app.services.vector_store import VectorStoreService
from app.services.retrieval_service import RetrievalService
from app.services.context_builder import ContextBuilder
from app.config import get_settings
from app.models.schemas import QdrantPayload

router = APIRouter(prefix="/retrieval", tags=["retrieval"])

class RetrieveRequest(BaseModel):
    query: str
    top_k: int = 5
    document_id: Optional[str] = None

class RetrieveResponse(BaseModel):
    query: str
    context: str
    sources: List[QdrantPayload]

def get_retrieval_service():
    settings = get_settings()
    embedding_provider = get_embedding_provider()
    qdrant_path = str(settings.data_dir / "qdrant")
    vector_store = VectorStoreService(path=qdrant_path)
    
    return RetrievalService(
        vector_store=vector_store, 
        embedding_provider=embedding_provider
    )

@router.post("/search", response_model=RetrieveResponse)
def search_knowledge_base(
    request: RetrieveRequest,
    retrieval_service: RetrievalService = Depends(get_retrieval_service)
):
    # 1. Retrieve chunks
    chunks = retrieval_service.search(
        query=request.query, 
        top_k=request.top_k, 
        document_id=request.document_id
    )
    
    # 2. Build context string
    context_string = ContextBuilder.build_context(chunks)
    
    return RetrieveResponse(
        query=request.query,
        context=context_string,
        sources=chunks
    )
