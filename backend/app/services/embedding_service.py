import abc
import logging
from typing import List
from sentence_transformers import SentenceTransformer
from app.config import get_settings

logger = logging.getLogger(__name__)

class BaseEmbeddingProvider(abc.ABC):
    @abc.abstractmethod
    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        pass
        
    @abc.abstractmethod
    def get_dimension(self) -> int:
        pass


class LocalHuggingFaceEmbeddingProvider(BaseEmbeddingProvider):
    def __init__(self, model_name_or_path: str, cache_folder: str = None):
        self.model_name_or_path = model_name_or_path
        
        try:
            logger.info(f"Loading embedding model: {model_name_or_path}...")
            # If the model isn't downloaded, this will automatically fetch it from HuggingFace
            # and cache it (default cache or cache_folder).
            self.model = SentenceTransformer(model_name_or_path, cache_folder=cache_folder)
            logger.info(f"Successfully loaded embedding model: {model_name_or_path}")
        except Exception as e:
            logger.error(f"Failed to load embedding model {model_name_or_path}. Error: {e}")
            raise RuntimeError(f"Embedding model initialization failed: {e}")
            
    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []
        
        try:
            embeddings = self.model.encode(texts, convert_to_numpy=True)
            return embeddings.tolist()
        except Exception as e:
            logger.error(f"Failed to encode texts using embedding model. Error: {e}")
            raise RuntimeError(f"Embedding generation failed: {e}")
            
    def get_dimension(self) -> int:
        return self.model.get_embedding_dimension()
        
    def get_name(self) -> str:
        return self.model_name_or_path


_provider_instance = None

def get_embedding_provider() -> BaseEmbeddingProvider:
    """
    Factory function that acts as a singleton for the embedding provider.
    This prevents the model from being re-downloaded/re-loaded into memory 
    every time we need an embedding.
    """
    global _provider_instance
    if _provider_instance is None:
        settings = get_settings()
        
        # We can configure this in .env using SAW_NEURAL_MODEL_NAME
        model_name = settings.neural_model_name 
        
        # If the user explicitly downloaded it to a folder, we can point to it
        # Otherwise, the SentenceTransformer handles downloading it automatically.
        # We'll point it to settings.models_dir as the cache_folder.
        cache_folder = str(settings.models_dir)
        
        _provider_instance = LocalHuggingFaceEmbeddingProvider(
            model_name_or_path=model_name,
            cache_folder=cache_folder
        )
        
    return _provider_instance
