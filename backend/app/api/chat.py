from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.services.rag_service import RAGService
from app.api.retrieval import get_retrieval_service
from app.services.retrieval_service import RetrievalService

router = APIRouter(prefix="/chat", tags=["chat"])

class RagOptions(BaseModel):
    enabled: bool = True
    document_id: Optional[str] = None
    top_k: int = 5

class ChatRequest(BaseModel):
    messages: List[Dict[str, Any]]
    stream: bool = True
    rag_options: Optional[RagOptions] = None

def get_rag_service(retrieval_service: RetrievalService = Depends(get_retrieval_service)) -> RAGService:
    return RAGService(retrieval_service=retrieval_service)

@router.post("")
@router.post("/completions")
async def chat_completions(
    request: ChatRequest,
    rag_service: RAGService = Depends(get_rag_service)
):
    rag_opts = request.rag_options.model_dump() if request.rag_options else {"enabled": False}
    
    # We always use streaming for this implementation
    return StreamingResponse(
        rag_service.chat_stream(messages=request.messages, rag_options=rag_opts),
        media_type="text/event-stream"
    )
