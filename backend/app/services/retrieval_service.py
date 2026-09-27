from typing import List, Optional
import hashlib
from qdrant_client.models import Filter, FieldCondition, MatchValue, Prefetch, FusionQuery, Fusion, SparseVector
from app.services.embedding_service import BaseEmbeddingProvider
from app.services.vector_store import VectorStoreService
from app.models.schemas import QdrantPayload
from app.services.sparse_embedding_service import get_sparse_embedding_provider

class RetrievalService:
    def __init__(self, vector_store: VectorStoreService, embedding_provider: BaseEmbeddingProvider):
        self.vector_store = vector_store
        self.embedding_provider = embedding_provider
        
    def search(self, query: str, top_k: int = 5, document_id: Optional[str] = None) -> List[QdrantPayload]:
        # 1. Embed the query (Dense)
        query_vector = self.embedding_provider.embed_texts([query])[0]
        
        # 1.5. Embed the query (Sparse)
        sparse_provider = get_sparse_embedding_provider()
        sparse_query = sparse_provider.embed_texts([query])[0]
        
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
            
        # 3. Perform Hybrid Vector Search with RRF Fusion
        # We fetch top_k * 3 to ensure we have enough unique parents after deduplication
        fetch_limit = top_k * 3
        search_result = self.vector_store.client.query_points(
            collection_name=self.vector_store.collection_name,
            prefetch=[
                Prefetch(
                    query=query_vector,
                    using="dense",
                    limit=fetch_limit,
                    filter=query_filter
                ),
                Prefetch(
                    query=SparseVector(indices=sparse_query["indices"], values=sparse_query["values"]),
                    using="sparse",
                    limit=fetch_limit,
                    filter=query_filter
                )
            ],
            query=FusionQuery(fusion=Fusion.RRF),
            limit=fetch_limit,
            with_payload=True
        )
        
        # 4. Map back to Payloads & Apply Hierarchical Chunking Deduplication
        payloads = []
        seen_parents = set()
        
        for scored_point in search_result.points:
            p = QdrantPayload(**(scored_point.payload or {}))
            
            if p.parent_content:
                # Deduplicate parents so the LLM isn't flooded with the exact same page text
                h = hashlib.sha256(p.parent_content.encode()).hexdigest()
                if h in seen_parents:
                    continue
                seen_parents.add(h)
                # Swap the child chunk's snippet for the full parent page context
                p.content = p.parent_content
                
            payloads.append(p)
            
            if len(payloads) >= top_k:
                break
                
        return payloads
