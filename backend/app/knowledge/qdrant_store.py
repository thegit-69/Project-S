import logging
import uuid
from typing import Any
import numpy as np
from pathlib import Path
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue

from app.knowledge.vector_store import VectorStore, VectorStoreResult

logger = logging.getLogger(__name__)

class QdrantVectorStore(VectorStore):
    def __init__(self, storage_dir: Path | str, expected_dimension: int, collection_name: str = "knowledge"):
        self.storage_dir = Path(storage_dir)
        self.storage_dir.mkdir(parents=True, exist_ok=True)
        self.dimension = expected_dimension
        self.collection_name = collection_name
        
        # Initialize local Qdrant client
        self.client = QdrantClient(path=str(self.storage_dir))
        
        self._ensure_collection()

    def _ensure_collection(self):
        collections = [c.name for c in self.client.get_collections().collections]
        if self.collection_name not in collections:
            logger.info(f"Creating Qdrant collection '{self.collection_name}' with dim {self.dimension}")
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(size=self.dimension, distance=Distance.COSINE),
            )
            
    def _to_uuid(self, chunk_id: str) -> str:
        # Qdrant requires UUIDs or unsigned integers for Point IDs
        return str(uuid.uuid5(uuid.NAMESPACE_URL, chunk_id))
            
    def add(self, chunk_id: str, vector: np.ndarray, metadata: dict[str, Any] | None = None) -> None:
        self.add_batch([chunk_id], [vector], [metadata] if metadata else None)

    def add_batch(self, chunk_ids: list[str], vectors: list[np.ndarray], metadatas: list[dict[str, Any]] | None = None) -> None:
        if not metadatas:
            metadatas = [{} for _ in chunk_ids]
            
        points = []
        for cid, vec, meta in zip(chunk_ids, vectors, metadatas):
            meta = meta or {}
            # Preserve original string ID in payload so we can recover it on search
            meta["_original_chunk_id"] = cid
            points.append(
                PointStruct(
                    id=self._to_uuid(cid),
                    vector=vec.tolist(),
                    payload=meta
                )
            )
        
        self.client.upsert(
            collection_name=self.collection_name,
            points=points
        )

    def search(self, query_vector: np.ndarray, top_k: int = 5, filters: dict[str, Any] | None = None) -> list[VectorStoreResult]:
        query_filter = None
        if filters and "document_id" in filters:
            query_filter = Filter(
                must=[
                    FieldCondition(
                        key="document_id",
                        match=MatchValue(value=filters["document_id"])
                    )
                ]
            )
            
        results = self.client.search(
            collection_name=self.collection_name,
            query_vector=query_vector.tolist(),
            query_filter=query_filter,
            limit=top_k,
            with_payload=True
        )
        
        return [
            VectorStoreResult(
                chunk_id=r.payload.get("_original_chunk_id", str(r.id)),
                score=r.score,
                metadata=r.payload or {}
            )
            for r in results
        ]

    def delete(self, chunk_id: str) -> bool:
        res = self.client.delete(
            collection_name=self.collection_name,
            points_selector=[self._to_uuid(chunk_id)]
        )
        return res.status.name == "COMPLETED"

    def delete_by_document(self, document_id: str) -> int:
        query_filter = Filter(
            must=[
                FieldCondition(
                    key="document_id",
                    match=MatchValue(value=document_id)
                )
            ]
        )
        count_res = self.client.count(
            collection_name=self.collection_name,
            count_filter=query_filter
        )
        
        self.client.delete(
            collection_name=self.collection_name,
            points_selector=query_filter
        )
        return count_res.count

    def count(self) -> int:
        res = self.client.count(collection_name=self.collection_name)
        return res.count

    def clear(self) -> None:
        self.client.delete_collection(self.collection_name)
        self._ensure_collection()

    def has(self, chunk_id: str) -> bool:
        res = self.client.retrieve(
            collection_name=self.collection_name,
            ids=[self._to_uuid(chunk_id)],
            with_payload=False,
            with_vectors=False
        )
        return len(res) > 0

    def get_metadata(self, chunk_id: str) -> dict[str, Any] | None:
        res = self.client.retrieve(
            collection_name=self.collection_name,
            ids=[self._to_uuid(chunk_id)],
            with_payload=True,
            with_vectors=False
        )
        if not res:
            return None
        return res[0].payload

    def get_health_info(self) -> dict[str, Any]:
        try:
            col_info = self.client.get_collection(self.collection_name)
            return {
                "status": "healthy",
                "type": "qdrant_local",
                "vector_count": col_info.points_count,
                "dimension": self.dimension
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e)
            }
