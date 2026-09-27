from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from typing import List
from app.models.schemas import QdrantPayload

class VectorStoreService:
    def __init__(self, path: str = ":memory:", collection_name: str = "documents"):
        self.client = QdrantClient(path=path)
        self.collection_name = collection_name
        
    def initialize_collection(self, dimension: int):
        if not self.client.collection_exists(self.collection_name):
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(size=dimension, distance=Distance.COSINE),
            )

    def upsert_chunks(self, payloads: List[QdrantPayload], embeddings: List[List[float]]):
        if not payloads:
            return
            
        points = []
        for payload, vector in zip(payloads, embeddings):
            points.append(
                PointStruct(
                    id=payload.chunk_id,
                    vector=vector,
                    payload=payload.model_dump()
                )
            )
            
        self.client.upsert(
            collection_name=self.collection_name,
            points=points
        )

    def delete_points(self, point_ids: List[str]):
        """Delete Qdrant points by their UUIDs."""
        if not point_ids:
            return
        from qdrant_client.models import PointIdsList
        self.client.delete(
            collection_name=self.collection_name,
            points_selector=PointIdsList(points=point_ids),
        )
