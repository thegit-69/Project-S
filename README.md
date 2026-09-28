# 🛡️ Project-S — Sovereign AI Workbench

> **SIH 2026 · Problem ID 26117**  
> *Sovereign On-Premise Agentic AI Workbench using Open-Weight Multimodal LLMs for Confidential Industrial Work*  
> **Organisation:** Mangalore Refinery and Petrochemicals Limited (MRPL)

---

## 📌 What Is This?

Project-S is a **fully self-hosted, air-gapped AI workbench** built for industrial organisations (PSUs, defence, refineries) that cannot send sensitive data to cloud AI services. It runs entirely on a local GPU server — no internet required, no external API calls, zero data leakage.

**Key Capabilities:**
- 🤖 **Agentic AI** — plan, reason, and execute multi-step tasks autonomously
- 📄 **Document Intelligence** — ingest PDFs, DOCX, scanned images, and ask questions
- 🔍 **RAG Pipeline** — local knowledge base grounded in your organisation's own documents
- 💻 **Secure Code Sandbox** — generate and execute Python in an ephemeral Docker container
- 🔒 **Sovereignty Proof** — audit logs + network monitor prove zero external data transmission

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  React Frontend (Vite)                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │   Chat   │ │Knowledge │ │   Code   │ │  Models  │      │
│  │ (Agent)  │ │  (RAG)   │ │ (Sandbox)│ │ (CRUD)   │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│  ┌──────────┐ ┌──────────┐                                 │
│  │   Logs   │ │ Library  │                                 │
│  │ (Audit)  │ │ (Files)  │                                 │
│  └──────────┘ └──────────┘                                 │
└────────────────────┬────────────────────────────────────────┘
           REST / SSE / WebSocket
           http://localhost:5173 ↔ http://localhost:8000
┌────────────────────▼────────────────────────────────────────┐
│                  FastAPI Backend                             │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │               Agent Orchestrator                    │   │
│  │  TaskRouter → TaskPlanner → AgentExecutor →         │   │
│  │  VerifierRegistry → LLM → OrchestratorResult        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Document    │  │  Knowledge   │  │    Security      │  │
│  │  Processor   │  │  RAG Service │  │  Audit + Monitor │  │
│  │ PDF/DOCX/OCR │  │ (see below)  │  │  (JSON-lines)    │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Model       │  │  Code        │  │  Export          │  │
│  │  Registry    │  │  Execution   │  │  Service         │  │
│  │ (multi-model)│  │  (Docker WS) │  │  (DOCX/PDF)      │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │ OpenAI-compatible HTTP API
┌────────────────────▼────────────────────────────────────────┐
│               llama.cpp Server (local GPU)                  │
│  Model: Qwen3-4B-GGUF (coding) / Gemma-3-4B-GGUF (general) │
│  Port: 9090  — 100% air-gapped, no internet access          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 RAG Pipeline (Knowledge Grounding)

The RAG (Retrieval-Augmented Generation) pipeline lets the AI answer questions based on **your organisation's own documents** — entirely offline.

```
Document Upload (PDF / DOCX / TXT)
         │
         ▼
  ┌─────────────────┐
  │  Parser Layer   │  ← pypdf, python-docx, pytesseract (OCR)
  └────────┬────────┘
           │  raw text + metadata
           ▼
  ┌─────────────────┐
  │ Chunking Service│  ← sliding window, configurable overlap
  └────────┬────────┘
           │  text chunks
           ▼
  ┌─────────────────┐
  │ Embedding Layer │  ← TF-IDF (default, air-gap safe)
  │                 │     OR MiniLM neural (GPU optional)
  └────────┬────────┘
           │  dense vectors
           ▼
  ┌─────────────────┐
  │  Qdrant Vector  │  ← local, persistent (no cloud)
  │     Store       │     fallback: NumPy file-based store
  └────────┬────────┘
           │
  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ Query Time ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
           │
    User Question
           │
           ▼
  ┌─────────────────┐
  │ Retrieval Svc   │  ← cosine similarity search, top-k chunks
  └────────┬────────┘
           │  relevant context
           ▼
  ┌─────────────────┐
  │  Context Builder│  ← assembles prompt with citations
  └────────┬────────┘
           │  grounded prompt
           ▼
  ┌─────────────────┐
  │  Local LLM      │  ← Qwen3 / Gemma via llama.cpp
  └────────┬────────┘
           │  answer + source citations
           ▼
      User Response
```

**Flagship Workflow** (PRD §5 — end-to-end demo):
```
Upload Inspection Report (PDF)
    → Ingest → Embed → Store in Qdrant
    → Retrieve relevant findings
    → LLM extracts key observations
    → LLM drafts formal Approval Note
    → Export as Word (.docx) file
```

---

## 📁 Project Structure

```
project-s/
├── launch.ps1               # One-shot dev launcher (3 Windows Terminal tabs)
├── frontend/                # React + Vite + TailwindCSS
│   └── src/
│       ├── screens/         # ChatScreen, CodeScreen, KnowledgeScreen, etc.
│       ├── components/      # Sidebar, MarkdownMessage, CitationDrawer, etc.
│       └── services/        # API client layer
└── backend/                 # FastAPI (Python)
    └── app/
        ├── main.py          # App factory, lifespan, router wiring
        ├── agents/          # Orchestrator, Planner, Router, Executor, Verifier
        ├── api/             # REST endpoints (chat, agent, codegen, execution, etc.)
        ├── documents/       # PDF/DOCX/OCR processors
        ├── knowledge/       # Chunking, embeddings, vector store, RAG service
        ├── models/          # Model registry, catalog, selector, llama.cpp provider
        ├── services/        # Approval workflow, export, ingestion, retrieval
        ├── security/        # AuditService, NetworkMonitor
        ├── tools/           # Calculator, FileReader, KnowledgeSearch tools
        └── db/              # SQLAlchemy models, migrations
```

---

## ⚙️ Setup & Installation

### Prerequisites

| Requirement | Notes |
|-------------|-------|
| Python 3.11+ | `python --version` |
| Node.js 18+ | `node --version` |
| `uv` (Python package manager) | `pip install uv` |
| `llama-server.exe` | Download from [llama.cpp releases](https://github.com/ggerganov/llama.cpp/releases) — add to `PATH` |
| Docker Desktop | Required for sandboxed code execution |
| Windows Terminal (`wt`) | Optional but recommended for `launch.ps1` |

### 1. Clone & Install

```powershell
# Clone the repository
git clone <repo-url>
cd project-s

# Install backend dependencies
cd backend
uv venv .venv
.venv\Scripts\Activate.ps1
uv pip install -r requirements.txt
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Configure Environment

```powershell
# Backend — copy and edit .env
Copy-Item backend\.env.example backend\.env
# Edit backend\.env:
#   SAW_LLM_BASE_URL=http://localhost:9090
#   SAW_LLM_MODEL_ID=Qwen/Qwen3-4B-GGUF:Q4_K_M
#   SAW_LLM_ENABLED=true

# Frontend — copy and edit .env
Copy-Item frontend\.env.example frontend\.env
# VITE_API_BASE_URL=http://127.0.0.1:8000 (default, usually no change needed)
```

### 3. Download the AI Model

```powershell
# Option A: Qwen3-4B (recommended for coding tasks)
llama-server.exe -hf Qwen/Qwen3-4B-GGUF:Q4_K_M -ngl 99 -c 8192 --port 9090

# Option B: Gemma-3-4B (good general reasoning)
llama-server.exe -hf ggml-org/gemma-3-4b-it-GGUF:Q4_K_M -ngl 99 -c 8192 --port 9090
```

> Models are downloaded automatically from Hugging Face on first run and cached locally. No internet is needed after the initial download.

### 4. Launch (One Command)

```powershell
# From the project root — opens 3 Windows Terminal tabs automatically
.\launch.ps1

# With a specific model:
.\launch.ps1 -AiModel "ggml-org/gemma-3-4b-it-GGUF:Q4_K_M"
```

This starts:
- 🌐 **Frontend** → http://localhost:5173
- ⚙️ **Backend** → http://localhost:8000
- 🤖 **AI Model** → http://localhost:9090

### 5. Verify Everything Is Running

```powershell
# Backend health check (shows all subsystems)
curl http://localhost:8000/health

# llama.cpp health
curl http://localhost:9090/health

# Frontend — open in browser
start http://localhost:5173
```

---

## 🎬 Demo Walkthrough (SIH Video)

1. **Chat → Agentic Task:** Ask *"Summarise the key risks in our refinery SOP and create a checklist"* — watch the agent plan, retrieve documents, and respond with citations.

2. **Knowledge → RAG:** Upload an inspection report PDF, then ask *"What were the non-conformances found?"* — see grounded answers with source page citations.

3. **Code → Sandbox:** Click **AI Coder**, type *"Write a script to detect pressure anomalies in sensor readings"* — watch Qwen3 stream code into the Monaco editor, accept it, then hit **Run** to execute in the Docker sandbox with the live terminal.

4. **Workflow → Approval Note:** Upload an inspection report → the system automatically generates a formal approval note → download as `.docx`.

5. **Logs → Sovereignty Proof:** Open the Logs screen — every action is audited, and the Network Monitor shows **zero external connections**.

---

## 🔐 Security & Sovereignty

- **Air-gapped by design** — the entire stack runs on localhost with no external API calls
- **Network Monitor** tracks all outbound connections; violations are flagged in audit logs
- **Append-only Audit Log** (`security/audit.py`) — every agent execution is recorded with timestamp, model used, and status
- **Sandboxed Code Execution** — Docker with `--rm` (ephemeral) and `--network none` (no network access inside container)

---

## 🧪 Running Tests

```powershell
cd backend
.venv\Scripts\Activate.ps1
pytest tests/ -v

# Quick endpoint smoke-test (requires running backend)
python test_endpoints.py
```

---

## 📄 Documentation

| File | Description |
|------|-------------|
| [`docs/prd.md`](docs/prd.md) | Product Requirements Document |
| [`docs/system_architecture.md`](docs/system_architecture.md) | Architecture deep-dive |
| [`APPROVAL_WORKFLOW_PLAN.md`](APPROVAL_WORKFLOW_PLAN.md) | Approval note workflow design |
| [`rag_plan.md`](rag_plan.md) | RAG pipeline design notes |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, TailwindCSS 4, Framer Motion |
| Editor | Monaco Editor (@monaco-editor/react) |
| Terminal | xterm.js + FitAddon |
| Backend | FastAPI, Python 3.11, Uvicorn |
| LLM Interface | llama.cpp (OpenAI-compatible API) |
| Models | Qwen3-4B-GGUF, Gemma-3-4B-GGUF |
| Vector DB | Qdrant (local) + NumPy fallback |
| Embeddings | sentence-transformers MiniLM / TF-IDF |
| Document Parsing | pypdf, python-docx, pytesseract |
| Code Sandbox | Docker (`python:3.11-alpine`, `--network none`) |
| Database | SQLAlchemy + SQLite |

---

*Built for SIH 2026 — Problem Statement 26117 — MRPL*
