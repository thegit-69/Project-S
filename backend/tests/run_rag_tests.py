import os
import time
import httpx

BASE_URL = "http://127.0.0.1:8000"
TEST_FILES_DIR = r"E:\Hackathon\SIH 2026\project-s\test_files"

def main():
    print("Starting RAG Pipeline E2E Test...")
    files_to_upload = [
        f for f in os.listdir(TEST_FILES_DIR) 
        if os.path.isfile(os.path.join(TEST_FILES_DIR, f))
    ]
    
    document_ids = []
    
    # 1. Upload Files
    for filename in files_to_upload:
        filepath = os.path.join(TEST_FILES_DIR, filename)
        print(f"Uploading {filename}...")
        
        with open(filepath, "rb") as f:
            response = httpx.post(
                f"{BASE_URL}/files/upload",
                files={"file": (filename, f, "application/octet-stream")},
                params={"source": "library"},
                timeout=60.0
            )
            
        if response.status_code == 200:
            doc_id = response.json()["document_id"]
            document_ids.append((doc_id, filename))
            print(f"  -> Uploaded successfully. ID: {doc_id}")
        else:
            print(f"  -> Failed to upload {filename}: {response.text}")

    # 2. Wait for Processing
    print("\nWaiting for ingestion to complete...")
    ready_docs = []
    
    for doc_id, filename in document_ids:
        print(f"Checking {filename}...", end=" ", flush=True)
        retries = 0
        # Wait longer for VLM to process images
        while retries < 180:
            resp = httpx.get(f"{BASE_URL}/files/{doc_id}", timeout=10.0)
            if resp.status_code == 200:
                status = resp.json()["job_status"]
                if status == "READY":
                    print("READY!")
                    ready_docs.append(doc_id)
                    break
                elif status == "FAILED":
                    print("FAILED!")
                    break
                else:
                    time.sleep(1)
                    retries += 1
            else:
                print(f"Error checking status: {resp.status_code}")
                break
        if retries == 180:
            print("TIMEOUT!")

    if not ready_docs:
        print("\nNo documents were processed successfully. Exiting.")
        return

    # 3. Test Hybrid Search + Hierarchical Chunking
    print("\nTesting Hybrid Search & RAG Retrieval...")
    test_queries = [
        "concurrency management", 
        "MRPL", 
        "engine models",
        "guns and roses",
        "ZBQNYIEJ"
    ]
    
    for query in test_queries:
        print(f"\nQuery: '{query}'")
        resp = httpx.post(
            f"{BASE_URL}/retrieval/search",
            json={"query": query, "top_k": 3},
            timeout=30.0
        )
        
        if resp.status_code == 200:
            data = resp.json()
            sources = data.get("sources", [])
            print(f"  -> Found {len(sources)} unique source chunks.")
            for idx, source in enumerate(sources):
                print(f"    Source {idx+1}: {source['filename']} (Type: {source['block_type']}) - Context Length: {len(source['content'])}")
        else:
            print(f"  -> Search failed: {resp.text}")
            
    print("\nE2E Tests completed successfully!")

if __name__ == "__main__":
    main()
