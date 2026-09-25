-- Sovereign AI Workbench PostgreSQL Schema Setup
-- IMPORTANT: This requires the 'pgvector' extension to be installed on your Postgres server.
-- E.g., via Docker: docker run -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d pgvector/pgvector:pg16

CREATE EXTENSION IF NOT EXISTS vector;

-- ==========================================
-- 1. Document Metadata Store
-- ==========================================
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

-- ==========================================
-- 2. Knowledge Base Metadata Store
-- ==========================================
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

-- ==========================================
-- 3. pgvector Storage
-- ==========================================
-- NOTE: The vector dimension here is set to 384 (typical for HuggingFace embeddings). 
-- If your neural embedding model outputs a different size, change 384 to that size.
CREATE TABLE IF NOT EXISTS pg_vectors (
    chunk_id VARCHAR PRIMARY KEY,
    embedding vector(384),
    metadata_json TEXT DEFAULT '{}'
);
