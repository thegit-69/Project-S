import json
import logging
from datetime import datetime, timezone
import numpy as np
from typing import Any

from sqlalchemy import text
from app.db.session import engine
from app.documents.models import Document, DocumentMetadata, DocumentPage, ExtractionStatus, FileType
from app.knowledge.models import KnowledgeDocument, KnowledgeChunk, IngestionStatus, EmbeddingConfig
from app.knowledge.vector_store import VectorStore, VectorStoreResult

logger = logging.getLogger(__name__)

class PgDocumentMetadataStore:
    def __init__(self, database_url: str):
        self._engine = engine
        # self._initialize_schema()  # Disabled: Schema is managed externally via schema.sql

    def _initialize_schema(self):
        with self._engine.begin() as conn:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS documents (
                    document_id        VARCHAR PRIMARY KEY,
                    filename           VARCHAR NOT NULL,
                    file_type          VARCHAR NOT NULL,
                    file_size          INTEGER NOT NULL DEFAULT 0,
                    page_count         INTEGER NOT NULL DEFAULT 0,
                    extraction_status  VARCHAR NOT NULL DEFAULT 'FAILED',
                    text_length        INTEGER NOT NULL DEFAULT 0,
                    created_at         VARCHAR NOT NULL,
                    stored_path        VARCHAR NOT NULL DEFAULT '',
                    content_hash       VARCHAR NOT NULL DEFAULT '',
                    original_filename  VARCHAR NOT NULL DEFAULT '',
                    stored_filename    VARCHAR NOT NULL DEFAULT '',
                    mime_type          VARCHAR NOT NULL DEFAULT '',
                    encoding           VARCHAR,
                    author             VARCHAR,
                    title              VARCHAR,
                    metadata_extra     TEXT NOT NULL DEFAULT '{}'
                );
            """))

    def save_document(self, document: Document, stored_path: str = "", content_hash: str = ""):
        meta = document.metadata
        with self._engine.begin() as conn:
            conn.execute(text("""
                INSERT INTO documents (
                    document_id, filename, file_type, file_size,
                    page_count, extraction_status, text_length,
                    created_at, stored_path, content_hash,
                    original_filename, stored_filename,
                    mime_type, encoding, author, title, metadata_extra
                ) VALUES (
                    :doc_id, :filename, :file_type, :file_size,
                    :page_count, :extraction_status, :text_length,
                    :created_at, :stored_path, :content_hash,
                    :orig_name, :stored_name, :mime_type, :encoding, :author, :title, :meta_extra
                )
                ON CONFLICT (document_id) DO UPDATE SET
                    filename=EXCLUDED.filename, file_type=EXCLUDED.file_type, file_size=EXCLUDED.file_size,
                    page_count=EXCLUDED.page_count, extraction_status=EXCLUDED.extraction_status, text_length=EXCLUDED.text_length,
                    created_at=EXCLUDED.created_at, stored_path=EXCLUDED.stored_path, content_hash=EXCLUDED.content_hash,
                    original_filename=EXCLUDED.original_filename, stored_filename=EXCLUDED.stored_filename,
                    mime_type=EXCLUDED.mime_type, encoding=EXCLUDED.encoding, author=EXCLUDED.author, title=EXCLUDED.title, metadata_extra=EXCLUDED.metadata_extra
            """), {
                "doc_id": document.document_id, "filename": document.filename, "file_type": document.file_type.value,
                "file_size": document.file_size, "page_count": document.page_count, "extraction_status": document.extraction_status.value,
                "text_length": len(document.text), "created_at": document.created_at, "stored_path": stored_path,
                "content_hash": content_hash, "orig_name": meta.original_filename, "stored_name": meta.stored_filename,
                "mime_type": meta.mime_type, "encoding": meta.encoding, "author": meta.author, "title": meta.title,
                "meta_extra": json.dumps(meta.extra)
            })

    def get_document(self, document_id: str) -> dict | None:
        with self._engine.connect() as conn:
            row = conn.execute(text("SELECT * FROM documents WHERE document_id = :id"), {"id": document_id}).mappings().fetchone()
            return dict(row) if row else None

    def list_documents(self) -> list[dict]:
        with self._engine.connect() as conn:
            rows = conn.execute(text("SELECT * FROM documents ORDER BY created_at DESC")).mappings().fetchall()
            return [dict(r) for r in rows]

    def delete_document(self, document_id: str) -> bool:
        with self._engine.begin() as conn:
            res = conn.execute(text("DELETE FROM documents WHERE document_id = :id"), {"id": document_id})
            return res.rowcount > 0

    def update_stored_path(self, document_id: str, stored_path: str):
        with self._engine.begin() as conn:
            conn.execute(text("UPDATE documents SET stored_path = :path WHERE document_id = :id"), {"path": stored_path, "id": document_id})

    def document_count(self) -> int:
        with self._engine.connect() as conn:
            return conn.execute(text("SELECT COUNT(*) FROM documents")).scalar() or 0

    def close(self): pass

    def reconstruct_document(self, row_dict: dict, text_content: str = "", pages: list[DocumentPage] | None = None) -> Document:
        return Document(
            document_id=row_dict["document_id"],
            filename=row_dict["filename"],
            file_type=FileType(row_dict["file_type"]),
            file_size=row_dict["file_size"],
            page_count=row_dict["page_count"],
            extraction_status=ExtractionStatus(row_dict["extraction_status"]),
            text=text_content,
            pages=pages or [],
            metadata=DocumentMetadata(
                original_filename=row_dict.get("original_filename", ""),
                stored_filename=row_dict.get("stored_filename", ""),
                mime_type=row_dict.get("mime_type", ""),
                encoding=row_dict.get("encoding"),
                author=row_dict.get("author"),
                title=row_dict.get("title"),
                extra=json.loads(row_dict.get("metadata_extra", "{}")),
            ),
            created_at=row_dict["created_at"],
        )


class PgKnowledgeMetadataStore:
    def __init__(self, database_url: str):
        self._engine = engine
        # self._initialize_schema()  # Disabled: Schema is managed externally via schema.sql

    def _initialize_schema(self):
        with self._engine.begin() as conn:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS knowledge_documents (
                    document_id        VARCHAR PRIMARY KEY,
                    filename           VARCHAR NOT NULL,
                    file_type          VARCHAR NOT NULL,
                    content_hash       VARCHAR NOT NULL DEFAULT '',
                    chunk_count        INTEGER NOT NULL DEFAULT 0,
                    ingestion_status   VARCHAR NOT NULL DEFAULT 'pending',
                    embedding_provider VARCHAR NOT NULL DEFAULT '',
                    embedding_version  INTEGER NOT NULL DEFAULT 0,
                    chunking_version   INTEGER NOT NULL DEFAULT 1,
                    ingested_at        VARCHAR,
                    updated_at         VARCHAR,
                    ingestion_time_ms  REAL NOT NULL DEFAULT 0.0,
                    embedding_time_ms  REAL NOT NULL DEFAULT 0.0,
                    error_info         TEXT,
                    metadata_json      TEXT NOT NULL DEFAULT '{}'
                );
                
                CREATE TABLE IF NOT EXISTS knowledge_chunks (
                    chunk_id           VARCHAR PRIMARY KEY,
                    document_id        VARCHAR NOT NULL,
                    chunk_index        INTEGER NOT NULL DEFAULT 0,
                    text               TEXT NOT NULL,
                    page_number        INTEGER,
                    section            VARCHAR,
                    source             VARCHAR NOT NULL DEFAULT '',
                    start_char         INTEGER NOT NULL DEFAULT 0,
                    end_char           INTEGER NOT NULL DEFAULT 0,
                    chunk_hash         VARCHAR NOT NULL DEFAULT '',
                    vector_id          VARCHAR NOT NULL DEFAULT '',
                    created_at         VARCHAR NOT NULL,
                    metadata_json      TEXT NOT NULL DEFAULT '{}',
                    CONSTRAINT fk_kd_docs FOREIGN KEY(document_id) REFERENCES knowledge_documents(document_id) ON DELETE CASCADE
                );
                
                CREATE TABLE IF NOT EXISTS embedding_meta (
                    key   VARCHAR PRIMARY KEY,
                    value VARCHAR NOT NULL
                );
            """))

    def save_embedding_config(self, config: EmbeddingConfig):
        with self._engine.begin() as conn:
            for k, v in [("embedding_fingerprint", config.fingerprint()), ("embedding_provider", config.provider), ("embedding_version", str(config.version)), ("embedding_dimension", str(config.dimension)), ("embedding_model_name", config.model_name)]:
                conn.execute(text("INSERT INTO embedding_meta (key, value) VALUES (:k, :v) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value"), {"k": k, "v": v})

    def load_embedding_fingerprint(self) -> str | None:
        with self._engine.connect() as conn:
            return conn.execute(text("SELECT value FROM embedding_meta WHERE key = 'embedding_fingerprint'")).scalar()

    def is_embedding_compatible(self, config: EmbeddingConfig) -> bool:
        stored = self.load_embedding_fingerprint()
        if stored is None: return True
        return stored == config.fingerprint()

    def save_document(self, doc: KnowledgeDocument):
        with self._engine.begin() as conn:
            conn.execute(text("""
                INSERT INTO knowledge_documents (
                    document_id, filename, file_type, content_hash,
                    chunk_count, ingestion_status,
                    embedding_provider, embedding_version, chunking_version,
                    ingested_at, updated_at,
                    ingestion_time_ms, embedding_time_ms,
                    error_info, metadata_json
                ) VALUES (
                    :doc_id, :filename, :file_type, :content_hash,
                    :chunk_count, :status,
                    :embed_prov, :embed_ver, :chunk_ver,
                    :ingest_at, :update_at,
                    :ingest_time, :embed_time,
                    :error_info, :meta_json
                ) ON CONFLICT (document_id) DO UPDATE SET
                    filename=EXCLUDED.filename, file_type=EXCLUDED.file_type, content_hash=EXCLUDED.content_hash,
                    chunk_count=EXCLUDED.chunk_count, ingestion_status=EXCLUDED.ingestion_status,
                    embedding_provider=EXCLUDED.embedding_provider, embedding_version=EXCLUDED.embedding_version, chunking_version=EXCLUDED.chunking_version,
                    ingested_at=EXCLUDED.ingested_at, updated_at=EXCLUDED.updated_at,
                    ingestion_time_ms=EXCLUDED.ingestion_time_ms, embedding_time_ms=EXCLUDED.embedding_time_ms,
                    error_info=EXCLUDED.error_info, metadata_json=EXCLUDED.metadata_json
            """), {
                "doc_id": doc.document_id, "filename": doc.filename, "file_type": doc.file_type, "content_hash": doc.content_hash,
                "chunk_count": doc.chunk_count, "status": doc.ingestion_status.value,
                "embed_prov": doc.embedding_provider, "embed_ver": doc.embedding_version, "chunk_ver": doc.chunking_version,
                "ingest_at": doc.ingested_at, "update_at": doc.updated_at or datetime.now(timezone.utc).isoformat(),
                "ingest_time": doc.ingestion_time_ms, "embed_time": doc.embedding_time_ms,
                "error_info": doc.error_info, "meta_json": json.dumps(doc.metadata)
            })

    def _row_to_document(self, row) -> KnowledgeDocument:
        return KnowledgeDocument(
            document_id=row["document_id"], filename=row["filename"], file_type=row["file_type"], content_hash=row["content_hash"],
            chunk_count=row["chunk_count"], ingestion_status=IngestionStatus(row["ingestion_status"]),
            embedding_provider=row["embedding_provider"], embedding_version=row["embedding_version"], chunking_version=row["chunking_version"],
            ingested_at=row["ingested_at"], updated_at=row["updated_at"], ingestion_time_ms=row["ingestion_time_ms"], embedding_time_ms=row["embedding_time_ms"],
            error_info=row["error_info"], metadata=json.loads(row["metadata_json"]),
        )
        
    def _row_to_chunk(self, row) -> KnowledgeChunk:
        return KnowledgeChunk(
            chunk_id=row["chunk_id"], document_id=row["document_id"], chunk_index=row["chunk_index"], text=row["text"],
            page_number=row["page_number"], section=row["section"], source=row["source"], start_char=row["start_char"],
            end_char=row["end_char"], chunk_hash=row["chunk_hash"], vector_id=row["vector_id"], created_at=row["created_at"], metadata=json.loads(row["metadata_json"])
        )

    def get_document(self, document_id: str) -> KnowledgeDocument | None:
        with self._engine.connect() as conn:
            row = conn.execute(text("SELECT * FROM knowledge_documents WHERE document_id = :id"), {"id": document_id}).mappings().fetchone()
            return self._row_to_document(row) if row else None

    def get_document_by_hash(self, content_hash: str) -> KnowledgeDocument | None:
        with self._engine.connect() as conn:
            row = conn.execute(text("SELECT * FROM knowledge_documents WHERE content_hash = :h LIMIT 1"), {"h": content_hash}).mappings().fetchone()
            return self._row_to_document(row) if row else None
            
    def find_by_content_hash(self, content_hash: str): return self.get_document_by_hash(content_hash)

    def list_documents(self) -> list[KnowledgeDocument]:
        with self._engine.connect() as conn:
            rows = conn.execute(text("SELECT * FROM knowledge_documents ORDER BY ingested_at DESC")).mappings().fetchall()
            return [self._row_to_document(r) for r in rows]

    def delete_document(self, document_id: str) -> bool:
        with self._engine.begin() as conn:
            res = conn.execute(text("DELETE FROM knowledge_documents WHERE document_id = :id"), {"id": document_id})
            return res.rowcount > 0

    def update_document_status(self, document_id: str, status: IngestionStatus, *, error_info: str = None, chunk_count: int = None, ingestion_time_ms: float = None, embedding_time_ms: float = None) -> None:
        updates = ["ingestion_status = :status", "updated_at = :updated_at"]
        params = {"status": status.value, "updated_at": datetime.now(timezone.utc).isoformat(), "id": document_id}
        if error_info is not None: updates.append("error_info = :err"); params["err"] = error_info
        if chunk_count is not None: updates.append("chunk_count = :cc"); params["cc"] = chunk_count
        if ingestion_time_ms is not None: updates.append("ingestion_time_ms = :it"); params["it"] = ingestion_time_ms
        if embedding_time_ms is not None: updates.append("embedding_time_ms = :et"); params["et"] = embedding_time_ms
        if status == IngestionStatus.INDEXED: updates.append("ingested_at = :ia"); params["ia"] = datetime.now(timezone.utc).isoformat()
        
        with self._engine.begin() as conn:
            conn.execute(text(f"UPDATE knowledge_documents SET {', '.join(updates)} WHERE document_id = :id"), params)

    def mark_all_stale(self) -> int:
        with self._engine.begin() as conn:
            res = conn.execute(text("UPDATE knowledge_documents SET ingestion_status = :ns, updated_at = :uat WHERE ingestion_status = :os"),
                               {"ns": IngestionStatus.STALE.value, "uat": datetime.now(timezone.utc).isoformat(), "os": IngestionStatus.INDEXED.value})
            return res.rowcount

    def save_chunks(self, chunks: list[KnowledgeChunk]):
        with self._engine.begin() as conn:
            for c in chunks:
                conn.execute(text("""
                    INSERT INTO knowledge_chunks (
                        chunk_id, document_id, chunk_index, text,
                        page_number, section, source,
                        start_char, end_char, chunk_hash, vector_id,
                        created_at, metadata_json
                    ) VALUES (
                        :cid, :did, :cidx, :text, :pnum, :sec, :src, :sc, :ec, :ch, :vid, :cat, :mjson
                    ) ON CONFLICT (chunk_id) DO UPDATE SET
                        document_id=EXCLUDED.document_id, chunk_index=EXCLUDED.chunk_index, text=EXCLUDED.text,
                        page_number=EXCLUDED.page_number, section=EXCLUDED.section, source=EXCLUDED.source,
                        start_char=EXCLUDED.start_char, end_char=EXCLUDED.end_char, chunk_hash=EXCLUDED.chunk_hash,
                        vector_id=EXCLUDED.vector_id, created_at=EXCLUDED.created_at, metadata_json=EXCLUDED.metadata_json
                """), {
                    "cid": c.chunk_id, "did": c.document_id, "cidx": c.chunk_index, "text": c.text, "pnum": c.page_number,
                    "sec": c.section, "src": c.source, "sc": c.start_char, "ec": c.end_char, "ch": c.chunk_hash,
                    "vid": c.vector_id, "cat": c.created_at, "mjson": json.dumps(c.metadata)
                })

    def get_chunk(self, chunk_id: str) -> KnowledgeChunk | None:
        with self._engine.connect() as conn:
            row = conn.execute(text("SELECT * FROM knowledge_chunks WHERE chunk_id = :id"), {"id": chunk_id}).mappings().fetchone()
            return self._row_to_chunk(row) if row else None

    def get_chunks_by_document(self, document_id: str) -> list[KnowledgeChunk]:
        with self._engine.connect() as conn:
            rows = conn.execute(text("SELECT * FROM knowledge_chunks WHERE document_id = :id ORDER BY chunk_index"), {"id": document_id}).mappings().fetchall()
            return [self._row_to_chunk(r) for r in rows]

    def delete_chunks_by_document(self, document_id: str) -> int:
        with self._engine.begin() as conn:
            return conn.execute(text("DELETE FROM knowledge_chunks WHERE document_id = :id"), {"id": document_id}).rowcount

    def chunk_count(self) -> int:
        with self._engine.connect() as conn:
            return conn.execute(text("SELECT COUNT(*) FROM knowledge_chunks")).scalar() or 0

    def close(self): pass


class PgVectorStore(VectorStore):
    def __init__(self, database_url: str, expected_dimension: int):
        self._engine = engine
        self.dim = expected_dimension
        # self._initialize_schema()  # Disabled: Schema is managed externally via schema.sql

    def _initialize_schema(self):
        with self._engine.begin() as conn:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
            conn.execute(text(f"""
                CREATE TABLE IF NOT EXISTS pg_vectors (
                    chunk_id VARCHAR PRIMARY KEY,
                    embedding vector({self.dim}),
                    metadata_json TEXT DEFAULT '{{}}'
                );
            """))

    def add(self, chunk_id: str, vector: np.ndarray, metadata: dict[str, Any] | None = None) -> None:
        with self._engine.begin() as conn:
            conn.execute(text("""
                INSERT INTO pg_vectors (chunk_id, embedding, metadata_json)
                VALUES (:cid, :emb, :mjson)
                ON CONFLICT (chunk_id) DO UPDATE SET embedding = EXCLUDED.embedding, metadata_json = EXCLUDED.metadata_json
            """), {"cid": chunk_id, "emb": vector.tolist(), "mjson": json.dumps(metadata or {})})

    def add_batch(self, chunk_ids: list[str], vectors: list[np.ndarray], metadatas: list[dict[str, Any]] | None = None) -> None:
        metadatas = metadatas or [{} for _ in chunk_ids]
        with self._engine.begin() as conn:
            for cid, vec, meta in zip(chunk_ids, vectors, metadatas):
                conn.execute(text("""
                    INSERT INTO pg_vectors (chunk_id, embedding, metadata_json)
                    VALUES (:cid, :emb, :mjson)
                    ON CONFLICT (chunk_id) DO UPDATE SET embedding = EXCLUDED.embedding, metadata_json = EXCLUDED.metadata_json
                """), {"cid": cid, "emb": vec.tolist(), "mjson": json.dumps(meta)})

    def search(self, query_vector: np.ndarray, top_k: int = 5, filters: dict[str, Any] | None = None) -> list[VectorStoreResult]:
        with self._engine.connect() as conn:
            # Using cosine distance operator `<=>` (1 - cosine similarity)
            # We want similarity = 1 - distance
            query_list = query_vector.tolist()
            sql = "SELECT chunk_id, metadata_json, 1 - (embedding <=> :q) AS score FROM pg_vectors"
            params = {"q": query_list, "k": top_k}
            if filters and "document_id" in filters:
                # Poor man's JSON filter
                sql += " WHERE metadata_json LIKE :doc_id_filter"
                params["doc_id_filter"] = f'%"{filters["document_id"]}"%'
                
            sql += " ORDER BY embedding <=> :q LIMIT :k"
            rows = conn.execute(text(sql), params).mappings().fetchall()
            return [VectorStoreResult(chunk_id=r["chunk_id"], score=float(r["score"]), metadata=json.loads(r["metadata_json"])) for r in rows]

    def delete(self, chunk_id: str) -> bool:
        with self._engine.begin() as conn:
            return conn.execute(text("DELETE FROM pg_vectors WHERE chunk_id = :cid"), {"cid": chunk_id}).rowcount > 0

    def delete_by_document(self, document_id: str) -> int:
        with self._engine.begin() as conn:
            return conn.execute(text("DELETE FROM pg_vectors WHERE metadata_json LIKE :doc_id_filter"), {"doc_id_filter": f'%"{document_id}"%'}).rowcount

    def count(self) -> int:
        with self._engine.connect() as conn:
            return conn.execute(text("SELECT COUNT(*) FROM pg_vectors")).scalar() or 0

    def clear(self) -> None:
        with self._engine.begin() as conn:
            conn.execute(text("DELETE FROM pg_vectors"))

    def has(self, chunk_id: str) -> bool:
        with self._engine.connect() as conn:
            return conn.execute(text("SELECT 1 FROM pg_vectors WHERE chunk_id = :cid LIMIT 1"), {"cid": chunk_id}).scalar() is not None

    def get_metadata(self, chunk_id: str) -> dict[str, Any] | None:
        with self._engine.connect() as conn:
            res = conn.execute(text("SELECT metadata_json FROM pg_vectors WHERE chunk_id = :cid"), {"cid": chunk_id}).scalar()
            return json.loads(res) if res else None

    def get_health_info(self) -> dict[str, Any]:
        return {"status": "healthy", "type": "postgres_pgvector", "vector_count": self.count(), "dimension": self.dim}
