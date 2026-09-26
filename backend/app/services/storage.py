import os
import shutil
from abc import ABC, abstractmethod
from pathlib import Path
from typing import BinaryIO

class StorageProvider(ABC):
    @abstractmethod
    def save_file(self, file_obj: BinaryIO, storage_key: str) -> str:
        """Save a file object to the storage backend and return the absolute/relative URI or path."""
        pass

    @abstractmethod
    def read_file(self, storage_key: str) -> bytes:
        """Read a file's contents from the storage backend."""
        pass
    
    @abstractmethod
    def delete_file(self, storage_key: str) -> bool:
        """Delete a file from the storage backend."""
        pass

class LocalFilesystemStorage(StorageProvider):
    def __init__(self, base_path: str):
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)

    def _get_absolute_path(self, storage_key: str) -> Path:
        # Prevent directory traversal
        full_path = (self.base_path / storage_key).resolve()
        if not str(full_path).startswith(str(self.base_path.resolve())):
            raise ValueError("Invalid storage key: directory traversal attempt")
        return full_path

    def save_file(self, file_obj: BinaryIO, storage_key: str) -> str:
        target_path = self._get_absolute_path(storage_key)
        target_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(target_path, "wb") as f:
            shutil.copyfileobj(file_obj, f)
            
        return str(target_path)

    def read_file(self, storage_key: str) -> bytes:
        target_path = self._get_absolute_path(storage_key)
        if not target_path.exists():
            raise FileNotFoundError(f"File not found: {storage_key}")
            
        with open(target_path, "rb") as f:
            return f.read()

    def delete_file(self, storage_key: str) -> bool:
        target_path = self._get_absolute_path(storage_key)
        if target_path.exists():
            target_path.unlink()
            return True
        return False
