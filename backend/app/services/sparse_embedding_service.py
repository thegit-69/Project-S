import pickle
import os
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from typing import List, Dict
import logging
from app.config import get_settings

logger = logging.getLogger(__name__)

class SparseEmbeddingProvider:
    """
    Generates sparse vectors (TF-IDF approximation) for Qdrant Hybrid Search.
    Saves/Loads the fitted vocabulary to disk so it persists across restarts.
    """
    def __init__(self, vocab_path: str = None):
        settings = get_settings()
        self.vocab_path = vocab_path or str(settings.data_dir / "sparse_vocab.pkl")
        # Increase max_features to 50000 so the vocabulary size stays fixed 
        # and doesn't invalidate old vectors when new words are added
        self.vectorizer = TfidfVectorizer(token_pattern=r"(?u)\b\w+\b", lowercase=True, max_features=50000)
        self.fitted = False
        self._load()

    def _load(self):
        if os.path.exists(self.vocab_path):
            try:
                with open(self.vocab_path, "rb") as f:
                    self.vectorizer = pickle.load(f)
                self.fitted = True
                logger.info("Loaded sparse vectorizer vocabulary.")
            except Exception as e:
                logger.warning(f"Failed to load sparse vocab: {e}")

    def _save(self):
        try:
            with open(self.vocab_path, "wb") as f:
                pickle.dump(self.vectorizer, f)
        except Exception as e:
            logger.error(f"Failed to save sparse vocab: {e}")

    def fit_or_update(self, texts: List[str]):
        if not texts:
            return
        # We fit on texts and save. 
        self.vectorizer.fit(texts)
        self.fitted = True
        self._save()

    def embed_texts(self, texts: List[str]) -> List[Dict[str, List]]:
        """Returns a list of dictionaries with 'indices' and 'values' for Qdrant"""
        if not texts:
            return []
        
        # Auto-fit on first batch if not fitted
        if not self.fitted:
            self.fit_or_update(texts)

        sparse_matrix = self.vectorizer.transform(texts)
        result = []
        for i in range(sparse_matrix.shape[0]):
            row = sparse_matrix.getrow(i)
            # Qdrant expects Python lists
            indices = row.indices.tolist()
            values = row.data.tolist()
            result.append({"indices": indices, "values": values})
            
        return result
        
_sparse_provider_instance = None

def get_sparse_embedding_provider() -> SparseEmbeddingProvider:
    global _sparse_provider_instance
    if _sparse_provider_instance is None:
        _sparse_provider_instance = SparseEmbeddingProvider()
    return _sparse_provider_instance
