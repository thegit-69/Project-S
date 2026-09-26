from typing import List, Optional
from qdrant_client.models import Filter, FieldCondition, MatchValue
from app.services.embedding_service import BaseEmbeddingProvider
from app.services.vector_store import VectorStoreService
from app.models.schemas import QdrantPayload

class RetrievalService:
    def __init__(self, vector_store: VectorStoreService, embedding_provider: BaseEmbeddingProvider):
        self.vector_store = vector_store
        self.embedding_provider = embedding_provider
        
    def search(self, query: str, top_k: int = 5, document_id: Optional[str] = None) -> List[QdrantPayload]:
        # 1. Embed the query
        query_vector = self.embedding_provider.embed_texts([query])[0]
        
        # 2. Build Metadata Filters (if applicable)
        query_filter = None
        if document_id:
            query_filter = Filter(
                must=[
                    FieldCondition(
                        key="document_id",
                        match=MatchValue(value=document_id)
                    )
                ]
            )
            
        # 3. Perform Vector Search
        search_result = self.vector_store.client.query_points(
            collection_name=self.vector_store.collection_name,
            query=query_vector,
            query_filter=query_filter,
            limit=top_k,
            with_payload=True
        )
        
        # 4. Map back to Payloads
        payloads = []
        for scored_point in search_result.points:
            payloads.append(QdrantPayload(**(scored_point.payload or {})))
            
        return payloads
