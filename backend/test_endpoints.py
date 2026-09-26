import time
import httpx
from pathlib import Path
import json

BASE_URL = "http://127.0.0.1:8000"
TEST_FILES_DIR = Path("../test_files")
DOCX_FILE = TEST_FILES_DIR / "CONCURRENCY MANAGEMENT.docx"
CSV_FILE = TEST_FILES_DIR / "Credits – My Billing Account.csv"

def upload_and_wait(file_path: Path) -> str:
    print(f"Uploading {file_path.name}...")
    with open(file_path, "rb") as f:
        response = httpx.post(f"{BASE_URL}/files/upload", files={"file": (file_path.name, f)})
    
    if response.status_code != 200:
        print(f"Upload failed: {response.text}")
        return None
        
    data = response.json()
    document_id = data["document_id"]
    job_id = data["job_id"]
    print(f"Uploaded! Document ID: {document_id}, Job ID: {job_id}")
    
    print("Polling for completion...")
    while True:
        res = httpx.get(f"{BASE_URL}/files/{document_id}")
        doc_data = res.json()
        status = doc_data["job_status"]
        print(f"Status: {status}")
        if status in ["READY", "FAILED"]:
            break
        time.sleep(2)
        
    return document_id

def test_chat():
    print("\nTesting chat API (RAG enabled)...")
    payload = {
        "messages": [
            {"role": "user", "content": "What is Concurrency Management?"}
        ],
        "stream": True,
        "rag_options": {
            "enabled": True,
            "top_k": 3
        }
    }
    
    with httpx.stream("POST", f"{BASE_URL}/chat", json=payload, timeout=120.0) as r:
        for line in r.iter_lines():
            if line:
                if line.startswith("data: "):
                    data_str = line[6:]
                    if data_str == "[DONE]":
                        break
                    try:
                        data = json.loads(data_str)
                        if "choices" in data:
                            content = data["choices"][0].get("delta", {}).get("content", "")
                            print(content, end="", flush=True)
                        elif "sources" in data:
                            print("\n\n--- SOURCES USED ---")
                            for s in data["sources"]:
                                print(f"- {s.get('filename')} (Page {s.get('page')})")
                    except Exception as e:
                        print(f"\n[Raw data: {data_str}]")
    print("\n")

def main():
    print("Waiting for server to start...")
    max_retries = 30
    server_up = False
    for i in range(max_retries):
        try:
            httpx.get(f"{BASE_URL}/files/")
            server_up = True
            break
        except Exception:
            time.sleep(2)
            
    if not server_up:
        print("Server is not up at http://127.0.0.1:8000. Start it first.")
        return

    docx_id = upload_and_wait(DOCX_FILE)
    csv_id = upload_and_wait(CSV_FILE)
    
    if docx_id or csv_id:
        test_chat()

if __name__ == "__main__":
    main()
