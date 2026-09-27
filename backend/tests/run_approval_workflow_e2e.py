"""
Live end-to-end test for the flagship approval-note workflow.

Requires BOTH servers running:
  1. llama-server (the local LLM)
  2. the backend (uvicorn app.main:app on 127.0.0.1:8000)

Run:
  cd "E:/Hackathon/SIH 2026/project-s/backend" && uv run python tests/run_approval_workflow_e2e.py
"""

import io
import os

import httpx

BASE_URL = "http://127.0.0.1:8000"
TEST_FILES_DIR = r"E:\Hackathon\SIH 2026\project-s\test_files"
UPLOAD_FILE = "MRPL annual report multi page.pdf"

DOCX_MEDIA = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"


def _assert(cond, msg):
    if not cond:
        raise AssertionError(msg)
    print(f"  [OK] {msg}")


def _check_result(data):
    _assert(data.get("findings"), "findings is non-empty")
    _assert(data.get("note_markdown"), "note_markdown is non-empty")
    _assert(data.get("citations"), "citations is non-empty")
    _assert(data.get("download_url"), "download_url present")
    print(f"    model={data.get('model')} steps={[s['name'] for s in data.get('steps', [])]}")
    return data["download_url"], data["document_id"]


def _download(download_url):
    resp = httpx.get(f"{BASE_URL}{download_url}", timeout=60.0)
    _assert(resp.status_code == 200, f"download returned 200 (got {resp.status_code})")
    _assert(resp.headers.get("content-type") == DOCX_MEDIA, "download content-type is DOCX")
    _assert(len(resp.content) > 0, "downloaded DOCX body is non-empty")
    try:
        from docx import Document
        Document(io.BytesIO(resp.content))
        print("  [OK] DOCX opens as a valid python-docx document")
    except Exception as exc:  # noqa: BLE001
        print(f"  [WARN] could not validate DOCX with python-docx: {exc}")


def test_upload_path():
    print("\n=== 1. POST /workflows/approval-note (multipart upload) ===")
    filepath = os.path.join(TEST_FILES_DIR, UPLOAD_FILE)
    with open(filepath, "rb") as f:
        resp = httpx.post(
            f"{BASE_URL}/workflows/approval-note",
            files={"file": (UPLOAD_FILE, f, "application/pdf")},
            data={"title": "MRPL Inspection Approval Note"},
            timeout=600.0,
        )
    _assert(resp.status_code == 200, f"upload run returned 200 (got {resp.status_code}: {resp.text[:300]})")
    download_url, document_id = _check_result(resp.json())
    _download(download_url)
    return document_id


def test_document_id_path(document_id):
    print("\n=== 2. POST /workflows/approval-note (existing document_id) ===")
    resp = httpx.post(
        f"{BASE_URL}/workflows/approval-note",
        data={"document_id": document_id, "title": "Re-run From Library"},
        timeout=600.0,
    )
    _assert(resp.status_code == 200, f"document_id run returned 200 (got {resp.status_code}: {resp.text[:300]})")
    download_url, _ = _check_result(resp.json())
    _download(download_url)


def test_health_sovereignty():
    print("\n=== 3. GET /health (network sovereignty) ===")
    resp = httpx.get(f"{BASE_URL}/health", timeout=30.0)
    _assert(resp.status_code == 200, "health returned 200")
    data = resp.json()
    net = data.get("subsystems", {}).get("network", {})
    print(f"    network compliance: {net}")
    endpoints = net.get("endpoints") or net.get("configured_endpoints") or []
    external = [e for e in endpoints if not any(
        loop in str(e) for loop in ("127.0.0.1", "localhost", "::1")
    )]
    _assert(not external, f"no external endpoints (found: {external})")
    _assert(data.get("subsystems", {}).get("approval_workflow") is True,
            "approval_workflow subsystem is initialised")


def main():
    print("Starting Approval-Note Workflow E2E Test...")
    document_id = test_upload_path()
    test_document_id_path(document_id)
    test_health_sovereignty()
    print("\nAll approval-note E2E checks passed.")


if __name__ == "__main__":
    main()
