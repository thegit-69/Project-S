import urllib.request
import urllib.parse
import json
import os
import mimetypes

BASE_URL = 'http://127.0.0.1:8000'
TEST_DIR = r'e:\Hackathon\SIH 2026\sovereign-ai-workbench\test data'

files = [
    'image_file_test_data.jpg',
    'md_file_test_data.md',
    'pdf_file_test_data.pdf',
    'text_file_test_data.txt',
    'word_file_test_data.docx'
]

def upload_file(filepath):
    filename = os.path.basename(filepath)
    with open(filepath, 'rb') as f:
        file_data = f.read()

    boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
    import io
    body = io.BytesIO()
    
    body.write(f'--{boundary}\r\n'.encode('utf-8'))
    body.write(f'Content-Disposition: form-data; name=\"file\"; filename=\"{filename}\"\r\n'.encode('utf-8'))
    mtype, _ = mimetypes.guess_type(filename)
    if not mtype:
        mtype = 'application/octet-stream'
    body.write(f'Content-Type: {mtype}\r\n\r\n'.encode('utf-8'))
    body.write(file_data)
    body.write(b'\r\n')
    body.write(f'--{boundary}--\r\n'.encode('utf-8'))
    
    req = urllib.request.Request(f'{BASE_URL}/files/upload', data=body.getvalue())
    req.add_header('Content-Type', f'multipart/form-data; boundary={boundary}')
    
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return {'error': True, 'status': e.code, 'detail': e.read().decode('utf-8')}
    except Exception as e:
        return {'error': True, 'detail': str(e)}

def analyze_document(doc_id):
    req = urllib.request.Request(f'{BASE_URL}/documents/{doc_id}/analyze', method='POST')
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return {'error': True, 'status': e.code, 'detail': e.read().decode('utf-8')}
    except Exception as e:
        return {'error': True, 'detail': str(e)}

results = {}
for file in files:
    filepath = os.path.join(TEST_DIR, file)
    print(f'Testing {file}...')
    upload_res = upload_file(filepath)
    if upload_res.get('error'):
        results[file] = {'upload_status': 'Failed', 'upload_response': upload_res}
        print(f'  Upload failed: {upload_res}')
    else:
        doc_id = upload_res.get('document_id')
        print(f'  Upload successful! Document ID: {doc_id}')
        print(f'  Extraction Status: {upload_res.get("extraction_status")}')
        
        print(f'  Running analysis for {file}...')
        analysis_res = analyze_document(doc_id)
        if analysis_res.get('error'):
            print(f'  Analysis failed: {analysis_res}')
            results[file] = {
                'upload_status': 'Success', 
                'extraction_status': upload_res.get('extraction_status'),
                'analysis_status': 'Failed', 
                'analysis_response': analysis_res
            }
        else:
            print(f'  Analysis successful!')
            results[file] = {
                'upload_status': 'Success', 
                'extraction_status': upload_res.get('extraction_status'),
                'analysis_status': 'Success', 
                'analysis_response': analysis_res
            }

with open('test_results.json', 'w') as f:
    json.dump(results, f, indent=2)
print('Done. Results saved to test_results.json.')
