from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, SparseVectorParams, SparseVector
from typing import List, Dict, Optional
from app.models.schemas import QdrantPayload

class VectorStoreService:
    _clients = {}

    def __init__(self, path: str = ":memory:", collection_name: str = "documents"):
        if path not in self.__class__._clients:
            self.__class__._clients[path] = QdrantClient(path=path)
        self.client = self.__class__._clients[path]
        self.collection_name = collection_name
        
    def initialize_collection(self, dimension: int):
        if not self.client.collection_exists(self.collection_name):
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config={
                    "dense": VectorParams(size=dimension, distance=Distance.COSINE)
                },
                sparse_vectors_config={
                    "sparse": SparseVectorParams(
                        # Qdrant will handle IDF internally if not provided, but we don't need it if we provide TF-IDF
                    )
                }
            )

    def upsert_chunks(self, payloads: List[QdrantPayload], embeddings: List[List[float]], sparse_embeddings: Optional[List[Dict[str, List]]] = None):
        if not payloads:
            return
            
        points = []
        for i, payload in enumerate(payloads):
            vector_dict = {"dense": embeddings[i]}
            if sparse_embeddings and i < len(sparse_embeddings):
                vector_dict["sparse"] = SparseVector(
                    indices=sparse_embeddings[i]["indices"],
                    values=sparse_embeddings[i]["values"]
                )
                
            points.append(
                PointStruct(
                    id=payload.chunk_id,
                    vector=vector_dict,
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
