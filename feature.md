howing a live terminal in your frontend that streams the output of an executing Docker container is one of the biggest "wow" factors you can add to this hackathon demo. It proves to the judges that your code execution is actually happening in real-time inside a sandbox, rather than just being faked.

To do this within your timeframe, you should use **WebSockets** in FastAPI to stream the logs, and **xterm.js** in your React frontend to render the terminal.

Here is the exact, simplified architecture to build a streaming, read-only terminal for your code execution.

### Step 1: The Frontend Terminal (xterm.js)

`xterm.js` is the exact same library that powers the integrated terminal in VS Code. It is incredibly lightweight.

Install it in your frontend:

```bash
npm install xterm @xterm/addon-fit

```

Create a new React component called `SandboxTerminal.jsx`:

```javascript
import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from '@xterm/addon-fit';
import 'xterm/css/xterm.css';

export default function SandboxTerminal({ codeToRun }) {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);

  useEffect(() => {
    // 1. Initialize the Terminal UI
    const term = new Terminal({ theme: { background: '#1e1e1e' } });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();
    xtermRef.current = term;

    term.writeln('\x1b[33m[System] Connecting to secure Docker enclave...\x1b[0m');

    // 2. Connect to FastAPI WebSocket
    const ws = new WebSocket('ws://127.0.0.1:8000/ws/execute');

    ws.onopen = () => {
      // Send the code to the backend to execute
      ws.send(JSON.stringify({ code: codeToRun }));
    };

    ws.onmessage = (event) => {
      // Stream the Docker output directly into the terminal
      term.write(event.data); 
    };

    ws.onclose = () => {
      term.writeln('\n\x1b[32m[System] Sandbox execution completed & container destroyed.\x1b[0m');
    };

    return () => {
      ws.close();
      term.dispose();
    };
  }, [codeToRun]);

  return <div ref={terminalRef} style={{ height: '300px', width: '100%' }} />;
}

```

### Step 2: The FastAPI Backend (WebSocket + Docker Stream)

In your FastAPI app, you need a WebSocket endpoint that receives the Python code, spins up an Alpine Linux Python container using `subprocess.Popen`, and streams the terminal output (`stdout` and `stderr`) line-by-line back to the React frontend.

```python
from fastapi import FastAPI, WebSocket
import subprocess
import json
import os

app = FastAPI()

@app.websocket("/ws/execute")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    try:
        # 1. Receive the code from the frontend
        data = await websocket.receive_text()
        payload = json.loads(data)
        code = payload.get("code", "")
        
        # Save code to a temporary local file that Docker will mount
        os.makedirs("sandbox_dir", exist_ok=True)
        with open("sandbox_dir/script.py", "w") as f:
            f.write(code)

        await websocket.send_text("\x1b[36m[Docker] Booting python:3.10-alpine container...\x1b[0m\r\n")
        
        # 2. Run Docker and stream the output
        # We mount the sandbox_dir into the container and execute script.py
        process = subprocess.Popen(
            [
                "docker", "run", "--rm", 
                "-v", f"{os.path.abspath('sandbox_dir')}:/app", 
                "-w", "/app", 
                "python:3.10-alpine", 
                "python", "-u", "script.py"  # -u forces unbuffered output for real-time streaming
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT, # Merge errors into standard output
            text=True,
            bufsize=1 # Line buffered
        )

        # 3. Read line by line and send to xterm.js
        for line in iter(process.stdout.readline, ''):
            # xterm.js expects \r\n for line breaks
            formatted_line = line.replace('\n', '\r\n')
            await websocket.send_text(formatted_line)
            
        process.stdout.close()
        process.wait()
        
    except Exception as e:
        await websocket.send_text(f"\r\n\x1b[31m[System Error] {str(e)}\x1b[0m\r\n")
    finally:
        await websocket.close()

```

### Why this is the perfect Hackathon implementation:

1. **It is "Read-Only" Interactive:** Building a fully bidirectional terminal (where the user types `cd ..` and hits enter) requires complex Pseudo-TTY (PTY) libraries. You do not have time for that. This architecture lets the LangGraph agent write the code, sends it to the container, and streams the execution logs in real-time. It looks identical to a real terminal but is 100x easier to code.
2. **Ephemeral Containers:** Notice the `--rm` flag in the Docker command. The container is created, runs the script, and immediately deletes itself. This proves to MRPL judges that your execution environment is stateless and highly secure.
3. **The `-u` Flag Trick:** In the Docker command, `python -u script.py` is critical. By default, Python buffers its print statements, meaning the terminal will stay blank for 5 seconds and then dump all the text at once. The `-u` (unbuffered) flag forces Python to stream it character-by-character, creating that beautiful "hacker movie" scrolling text effect in the UI.
