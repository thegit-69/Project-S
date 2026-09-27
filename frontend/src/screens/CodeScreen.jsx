import { useState, useRef, useCallback, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, Loader2, Terminal, Sparkles, Send, FileCode2,
  ChevronDown, ChevronRight, Trash2, Sun, Moon,
  Cpu, Wifi, WifiOff, BotMessageSquare, Check, X,
  Activity, GitBranch, Layers, AlertCircle
} from 'lucide-react'
import '@xterm/xterm/css/xterm.css'

const API_BASE = 'http://127.0.0.1:8000'
const WS_BASE  = 'ws://127.0.0.1:8000'

// ─── Initial demo messages ─────────────────────────────────────────────────────
const DEMO_CODE = `import statistics

def analyse_sensor_readings(readings: list[float]) -> dict:
    """Analyse sensor readings and flag outliers beyond 3σ threshold."""
    mean  = statistics.mean(readings)
    stdev = statistics.stdev(readings)
    threshold = 3 * stdev
    outliers = [
        {"index": i, "value": v, "deviation": round(abs(v - mean) / stdev, 2)}
        for i, v in enumerate(readings)
        if abs(v - mean) > threshold
    ]
    return {
        "mean": round(mean, 4), "stdev": round(stdev, 4),
        "threshold_3sigma": round(threshold, 4), "outliers": outliers,
        "total_readings": len(readings), "flagged_count": len(outliers),
    }

sensor_data = [
    102.3, 101.8, 103.1, 102.7, 101.5, 102.9, 103.4, 101.2,
    102.6, 145.8,  # ← spike anomaly
    103.0, 102.4, 101.9, 102.8, 103.2, 102.1, 101.7, 102.5,
    103.3, 55.1,   # ← drop anomaly
    102.0, 101.6, 103.5, 102.2, 101.4, 102.3, 103.1, 101.8,
]

results = analyse_sensor_readings(sensor_data)
print(f"=== Sensor Analysis Report ===")
print(f"Total Readings : {results['total_readings']}")
print(f"Mean           : {results['mean']} units")
print(f"Std Deviation  : {results['stdev']} units")
print(f"3\u03c3 Threshold   : \xb1{results['threshold_3sigma']} units")
print(f"Flagged        : {results['flagged_count']} anomaly/anomalies")
print()
if results['outliers']:
    print("\u26a0  ANOMALIES DETECTED:")
    for item in results['outliers']:
        print(f"   Index {item['index']:>3}: {item['value']} units  ({item['deviation']}\u03c3 from mean)")
else:
    print("\u2713 All readings within normal range.")
`

const INITIAL_MESSAGES = [
  { role: 'user', content: 'Write a Python script that calculates the standard deviation of a list of sensor readings and flags any value that exceeds 3\u03c3.' },
  { role: 'agent', summary: 'Computes mean and 3\u03c3 threshold, flags anomalies in industrial sensor dataset. 2 spike anomalies detected at indices 9 and 19.' },
]

// ─── xterm themes ─────────────────────────────────────────────────────────────
const XTERM_DARK = {
  background: '#0d1117', foreground: '#c9d1d9', cursor: '#58a6ff',
  black: '#0d1117', red: '#ff7b72', green: '#3fb950', yellow: '#d29922',
  blue: '#58a6ff', magenta: '#bc8cff', cyan: '#39c5cf', white: '#b1bac4',
  brightBlack: '#6e7681', brightRed: '#ffa198', brightGreen: '#56d364',
  brightYellow: '#e3b341', brightBlue: '#79c0ff', brightMagenta: '#d2a8ff',
  brightCyan: '#56d4dd', brightWhite: '#f0f6fc',
}
const XTERM_LIGHT = {
  background: '#F7F6F3', foreground: '#1a1a2e', cursor: '#176B5B',
  black: '#F7F6F3', red: '#cc3300', green: '#176B5B', yellow: '#b45309',
  blue: '#1d4ed8', magenta: '#7c3aed', cyan: '#0d7490', white: '#4a4a4a',
  brightBlack: '#8c8c8c', brightRed: '#ef4444', brightGreen: '#10b981',
  brightYellow: '#f59e0b', brightBlue: '#3b82f6', brightMagenta: '#8b5cf6',
  brightCyan: '#06b6d4', brightWhite: '#1a1a2e',
}

// ─── Diff viewer for Accept/Reject ────────────────────────────────────────────
function DiffBanner({ pendingCode, onAccept, onReject, isDark }) {
  const lines = pendingCode.split('\n').length
  const d = isDark
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`mx-0 px-4 py-2.5 flex items-center gap-3 border-b text-[12px] ${
        d ? 'bg-emerald-950/60 border-emerald-800/50' : 'bg-[#EAF4F1] border-[#B2D8D0]'
      }`}
    >
      <Sparkles className={`w-3.5 h-3.5 shrink-0 ${d ? 'text-emerald-400' : 'text-[#176B5B]'}`} />
      <span className={`flex-1 font-medium ${d ? 'text-emerald-200' : 'text-[#176B5B]'}`}>
        Qwen generated {lines} lines — accept or reject?
      </span>
      <button
        onClick={onReject}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium transition-colors ${
          d ? 'bg-[#161b22] border-[#30363d] text-[#8b949e] hover:border-red-700/50 hover:text-red-400'
            : 'bg-white border-[#E2DED5] text-[#77766F] hover:border-red-300 hover:text-red-500'
        }`}
      >
        <X className="w-3 h-3" /> Reject
      </button>
      <button
        onClick={onAccept}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold transition-colors ${
          d ? 'bg-emerald-700 border-emerald-600 text-white hover:bg-emerald-600'
            : 'bg-[#176B5B] border-[#176B5B] text-white hover:bg-[#145748]'
        }`}
      >
        <Check className="w-3 h-3" /> Accept
      </button>
    </motion.div>
  )
}

// ─── Agent message bubble ──────────────────────────────────────────────────────
function AgentMessage({ msg, isDark }) {
  const d = isDark
  if (msg.role === 'user') {
    return (
      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end gap-2">
        <div className={`max-w-[85%] px-3 py-2 rounded-xl text-[12px] leading-relaxed border ${
          d ? 'bg-emerald-950/50 border-emerald-800/40 text-emerald-100'
            : 'bg-[#EAF4F1] border-[#B2D8D0] text-[#176B5B]'
        }`}>
          {msg.content}
        </div>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${d ? 'bg-[#30363d]' : 'bg-[#E2DED5]'}`}>
          <span className={`text-[9px] font-bold ${d ? 'text-[#8b949e]' : 'text-[#77766F]'}`}>U</span>
        </div>
      </motion.div>
    )
  }

  // Agent message — summary only
  return (
    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2">
      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shrink-0 mt-0.5">
        <Sparkles className="w-3 h-3 text-white" />
      </div>
      <div className={`max-w-[88%] flex flex-col gap-1`}>
        <div className={`px-3 py-2 rounded-xl text-[12px] leading-relaxed border ${
          d ? 'bg-[#0d1117] border-[#21262d] text-[#c9d1d9]' : 'bg-white border-[#E2DED5] text-[#20211F]'
        }`}>
          {msg.summary || msg.content}
        </div>
        {msg.streaming && (
          <div className={`flex items-center gap-1.5 text-[10px] ${d ? 'text-[#6e7681]' : 'text-[#77766F]'}`}>
            <Loader2 className="w-2.5 h-2.5 animate-spin" />
            <span>Streaming to editor…</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── xterm component ──────────────────────────────────────────────────────────
function SandboxTerminal({ isDark, termRef, fitRef }) {
  const divRef = useRef(null)

  useEffect(() => {
    if (!divRef.current) return
    const term = new XTerm({
      theme: isDark ? XTERM_DARK : XTERM_LIGHT,
      fontFamily: "'JetBrains Mono','Fira Code','Cascadia Code',monospace",
      fontSize: 12, lineHeight: 1.5, cursorBlink: true, cursorStyle: 'bar',
      scrollback: 5000, convertEol: true,
    })
    const fit = new FitAddon()
    term.loadAddon(fit)
    term.open(divRef.current)
    fit.fit()
    termRef.current = term
    fitRef.current  = fit

    term.writeln('\x1b[2m╭──────────────────────────────────────────╮\x1b[0m')
    term.writeln('\x1b[2m│  Sovereign Workbench · Docker Sandbox    │\x1b[0m')
    term.writeln('\x1b[2m╰──────────────────────────────────────────╯\x1b[0m')
    term.writeln('\x1b[2mPress Run ▶ to execute in sandbox.\x1b[0m\n')

    const ro = new ResizeObserver(() => fit.fit())
    ro.observe(divRef.current)
    return () => { ro.disconnect(); term.dispose(); termRef.current = null; fitRef.current = null }
  }, [])

  useEffect(() => {
    if (termRef.current) termRef.current.options.theme = isDark ? XTERM_DARK : XTERM_LIGHT
  }, [isDark])

  return <div ref={divRef} className="w-full h-full" style={{ padding: '6px' }} />
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function CodeScreen() {
  const [isDark, setIsDark]           = useState(true)
  const [code, setCode]               = useState(DEMO_CODE)
  const [pendingCode, setPendingCode] = useState(null)   // code waiting for accept/reject
  const [messages, setMessages]       = useState(INITIAL_MESSAGES)
  const [userInput, setUserInput]     = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRunning, setIsRunning]     = useState(false)
  const [dockerOk, setDockerOk]       = useState(null)
  const [qwenOk, setQwenOk]           = useState(null)
  const [outputOpen, setOutputOpen]   = useState(false)
  // Resizable chat panel
  const [chatWidth, setChatWidth]     = useState(320)
  const isResizing                    = useRef(false)
  const chatEndRef  = useRef(null)
  const termRef     = useRef(null)
  const fitRef      = useRef(null)
  const wsRef       = useRef(null)
  const abortRef    = useRef(null)

  // Drag-to-resize handler for the chat panel
  const startResize = useCallback((e) => {
    e.preventDefault()
    isResizing.current = true
    const startX = e.clientX
    const startW = chatWidth
    const onMove = (mv) => {
      if (!isResizing.current) return
      const delta = startX - mv.clientX
      const next  = Math.min(520, Math.max(220, startW + delta))
      setChatWidth(next)
    }
    const onUp = () => {
      isResizing.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [chatWidth])


  // ── Health checks ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API_BASE}/api/execute/health`)
      .then(r => r.json()).then(d => setDockerOk(d.docker_available)).catch(() => setDockerOk(false))
    fetch(`${API_BASE}/api/codegen/health`)
      .then(r => r.json()).then(d => setQwenOk(d.status === 'ok')).catch(() => setQwenOk(false))
  }, [])

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isGenerating])

  // ── Generate code from Qwen via SSE, stream tokens to PENDING state ───────
  const handleSend = useCallback(async () => {
    if (!userInput.trim() || isGenerating) return
    const prompt = userInput.trim()
    setUserInput('')
    setMessages(prev => [...prev, { role: 'user', content: prompt }])
    setIsGenerating(true)

    // Placeholder agent message
    const agentIdx = Date.now()
    setMessages(prev => [...prev, { role: 'agent', id: agentIdx, summary: '…', streaming: true }])

    abortRef.current = new AbortController()
    let accCode = ''
    let summaryText = ''

    try {
      const res = await fetch(`${API_BASE}/api/codegen/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, max_tokens: 1500 }),
        signal: abortRef.current.signal,
      })

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })

        // Parse SSE events from buffer
        const parts = buf.split('\n\n')
        buf = parts.pop() || ''

        for (const part of parts) {
          const eventLine = part.split('\n').find(l => l.startsWith('event: '))
          const dataLine  = part.split('\n').find(l => l.startsWith('data: '))
          if (!eventLine || !dataLine) continue

          const eventType = eventLine.slice(7).trim()
          const data = JSON.parse(dataLine.slice(6))

          if (eventType === 'summary') {
            summaryText = data
            // Update the placeholder message with real summary
            setMessages(prev => prev.map(m =>
              m.id === agentIdx ? { ...m, summary: summaryText } : m
            ))
          } else if (eventType === 'token') {
            accCode += data
            // Stream token to PENDING editor (shown dimmed in Monaco)
            setPendingCode(prev => (prev || '') + data)
          } else if (eventType === 'done') {
            break
          } else if (eventType === 'error') {
            setMessages(prev => prev.map(m =>
              m.id === agentIdx
                ? { ...m, summary: `⚠ Error: ${data}`, streaming: false }
                : m
            ))
            setPendingCode(null)
            break
          }
        }
      }

      // Mark streaming done
      setMessages(prev => prev.map(m =>
        m.id === agentIdx ? { ...m, streaming: false } : m
      ))

    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages(prev => prev.map(m =>
          m.id === agentIdx
            ? { ...m, summary: `⚠ Failed to reach Qwen. Is llama-server running on port 9090?`, streaming: false }
            : m
        ))
        setPendingCode(null)
      }
    } finally {
      setIsGenerating(false)
    }
  }, [userInput, isGenerating])

  // Accept pending code → replaces editor content
  const handleAccept = useCallback(() => {
    if (pendingCode) setCode(pendingCode)
    setPendingCode(null)
  }, [pendingCode])

  // Reject pending code → discard, editor stays the same
  const handleReject = useCallback(() => {
    setPendingCode(null)
    setMessages(prev => {
      const copy = [...prev]
      const last = copy[copy.length - 1]
      if (last?.role === 'agent') copy[copy.length - 1] = { ...last, summary: last.summary + ' (rejected)' }
      return copy
    })
  }, [])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  // ── Run via WebSocket → xterm.js ──────────────────────────────────────────
  const handleRun = useCallback(() => {
    if (isRunning || !code.trim()) return
    setIsRunning(true)
    setOutputOpen(true)
    const term = termRef.current
    if (term) {
      term.write('\r\n\x1b[2m────────────────────────────────────\x1b[0m\r\n')
      term.writeln(`\x1b[33m[System] Starting — ${new Date().toLocaleTimeString()}\x1b[0m`)
    }
    if (wsRef.current) wsRef.current.close()
    const ws = new WebSocket(`${WS_BASE}/api/execute/stream`)
    wsRef.current = ws
    ws.onopen  = () => ws.send(JSON.stringify({ code, timeout: 20 }))
    ws.onmessage = e => { if (term) term.write(e.data) }
    ws.onclose = () => { setIsRunning(false); wsRef.current = null }
    ws.onerror = () => {
      if (term) term.writeln('\r\n\x1b[31m[Error] WebSocket failed. Is the backend running?\x1b[0m')
      setIsRunning(false)
    }
  }, [code, isRunning])

  const handleStop = () => { wsRef.current?.close(); setIsRunning(false) }
  const handleClear = () => termRef.current?.clear()

  // ── Theme ─────────────────────────────────────────────────────────────────
  const d   = isDark
  const bg  = d ? 'bg-[#0d1117]'  : 'bg-[#F7F6F3]'
  const srf = d ? 'bg-[#010409]'  : 'bg-white'
  const bdr = d ? 'border-[#21262d]' : 'border-[#E2DED5]'
  const txt = d ? 'text-[#c9d1d9]' : 'text-[#20211F]'
  const sub = d ? 'text-[#6e7681]' : 'text-[#77766F]'

  return (
    <div className={`flex w-full h-full ${bg} overflow-hidden transition-colors duration-200`}>

      {/* ── LEFT: Editor + Terminal ──────────────────────────────────── */}
      <div className={`flex-1 flex flex-col min-w-0 h-full border-r ${bdr}`}>

        {/* Toolbar */}
        <div className={`flex items-center justify-between px-3 py-2 border-b ${bdr} ${srf} shrink-0`}>
          <div className="flex items-center gap-2">
            {/* File tab */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${bdr} ${d ? 'bg-[#0d1117]' : 'bg-[#F1F0EB]'}`}>
              <FileCode2 className={`w-3 h-3 ${sub}`} />
              <span className={`text-[11px] font-mono ${txt}`}>main.py</span>
            </div>

            {/* Status badges */}
            <div className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded border font-mono ${
              dockerOk ? (d ? 'bg-emerald-900/20 border-emerald-800/40 text-emerald-400' : 'bg-[#EAF4F1] border-[#B2D8D0] text-[#176B5B]')
                       : (d ? 'bg-yellow-900/20 border-yellow-800/30 text-yellow-400' : 'bg-amber-50 border-amber-200 text-amber-600')
            }`}>
              {dockerOk ? <Wifi className="w-2.5 h-2.5" /> : <WifiOff className="w-2.5 h-2.5" />}
              {dockerOk === null ? '…' : dockerOk ? 'Docker' : 'Local'}
            </div>
            <div className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded border font-mono ${
              d ? 'bg-blue-900/20 border-blue-800/30 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-600'
            }`}>
              <Layers className="w-2.5 h-2.5" />Python
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Theme toggle */}
            <button onClick={() => setIsDark(v => !v)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-colors ${
                d ? 'bg-[#161b22] border-[#30363d] text-[#8b949e] hover:text-[#c9d1d9]'
                  : 'bg-[#F1F0EB] border-[#E2DED5] text-[#77766F] hover:text-[#20211F]'
              }`}>
              {d ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
            <button onClick={handleClear}
              className={`flex items-center gap-1 px-2 py-1.5 text-[11px] rounded-lg transition-colors ${sub} ${
                d ? 'hover:bg-[#161b22] hover:text-[#c9d1d9]' : 'hover:bg-[#EEE] hover:text-[#20211F]'
              }`}>
              <Trash2 className="w-3 h-3" /> Clear
            </button>
            {isRunning ? (
              <button onClick={handleStop}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-red-700 hover:bg-red-600 text-white transition-colors">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Stop
              </button>
            ) : (
              <button onClick={handleRun} disabled={!code.trim()} id="run-code-btn"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-emerald-700 hover:bg-emerald-600 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-emerald-900/20">
                <Play className="w-3.5 h-3.5 fill-white" /> Run
              </button>
            )}
          </div>
        </div>

        {/* Accept/Reject banner — shown when pending code exists */}
        <AnimatePresence>
          {pendingCode && (
            <DiffBanner
              pendingCode={pendingCode}
              onAccept={handleAccept}
              onReject={handleReject}
              isDark={isDark}
            />
          )}
        </AnimatePresence>

        {/* Monaco Editor */}
        <div className={`transition-all duration-300 ${outputOpen ? 'flex-[3]' : 'flex-1'} min-h-0`}>
          <Editor
            height="100%"
            defaultLanguage="python"
            /* Show pending code dimmed while streaming; committed code otherwise */
            value={pendingCode !== null ? pendingCode : code}
            onChange={val => { if (pendingCode === null) setCode(val || '') }}
            theme={d ? 'vs-dark' : 'vs'}
            options={{
              fontSize: 13,
              fontFamily: "'JetBrains Mono','Fira Code',monospace",
              fontLigatures: true,
              minimap: { enabled: true, scale: 0.7 },
              scrollBeyondLastLine: false,
              lineHeight: 22,
              padding: { top: 14, bottom: 14 },
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              renderLineHighlight: 'gutter',
              bracketPairColorization: { enabled: true },
              guides: { bracketPairs: true, indentation: true },
              scrollbar: { verticalScrollbarSize: 5, horizontalScrollbarSize: 5 },
              overviewRulerBorder: false,
              wordWrap: 'off',
              // Read-only while pending so user can't accidentally edit
              readOnly: pendingCode !== null,
            }}
            loading={
              <div className={`w-full h-full flex items-center justify-center ${d ? 'bg-[#1e1e1e]' : 'bg-white'}`}>
                <Loader2 className={`w-4 h-4 animate-spin ${sub}`} />
              </div>
            }
          />
        </div>

        {/* xterm.js output panel */}
        <div className={`border-t ${bdr} flex flex-col shrink-0 transition-all duration-300 ${outputOpen ? 'h-[220px]' : 'h-8'}`}>
          <button onClick={() => setOutputOpen(v => !v)}
            className={`flex items-center gap-2 px-3 py-1.5 w-full text-left shrink-0 transition-colors ${
              d ? 'bg-[#010409] hover:bg-[#0d1117]' : 'bg-white hover:bg-[#F1F0EB]'
            }`}>
            <Terminal className={`w-3.5 h-3.5 ${sub}`} />
            <span className={`text-[11px] font-mono uppercase tracking-wider ${sub}`}>Terminal</span>
            {isRunning && <span className="flex items-center gap-1 text-[10px] text-yellow-400"><Activity className="w-2.5 h-2.5 animate-pulse" />Running</span>}
            <div className="ml-auto">
              {outputOpen ? <ChevronDown className={`w-3.5 h-3.5 ${sub}`} /> : <ChevronRight className={`w-3.5 h-3.5 ${sub}`} />}
            </div>
          </button>
          {outputOpen && (
            <div className={`flex-1 min-h-0 overflow-hidden ${d ? 'bg-[#0d1117]' : 'bg-[#F7F6F3]'}`}>
              <SandboxTerminal isDark={isDark} termRef={termRef} fitRef={fitRef} />
            </div>
          )}
        </div>

        {/* Status bar */}
        <div className={`h-6 border-t ${bdr} flex items-center px-3 gap-4 text-[10px] font-mono shrink-0 ${d ? 'bg-[#010409]' : 'bg-white'} ${sub}`}>
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-yellow-400 animate-pulse' : 'bg-emerald-400'}`} />
            {isRunning ? 'Executing…' : 'Ready'}
          </div>
          <div className="flex items-center gap-1"><GitBranch className="w-2.5 h-2.5" />main</div>
          <div className="ml-auto flex items-center gap-1">
            <Cpu className="w-2.5 h-2.5" />python:3.11-alpine · --network none
          </div>
        </div>
      </div>

      {/* ── RESIZE HANDLE ─────────────────────────────────────────────── */}
      <div
        onMouseDown={startResize}
        className={`w-1 shrink-0 cursor-col-resize transition-colors ${
          d ? 'bg-[#21262d] hover:bg-emerald-700/50' : 'bg-[#E2DED5] hover:bg-[#176B5B]/30'
        }`}
        title="Drag to resize"
      />

      {/* ── RIGHT: AI Coder chat panel ───────────────────────────────── */}
      <div
        className={`shrink-0 flex flex-col h-full ${srf} transition-none`}
        style={{ width: `${chatWidth}px` }}
      >

        {/* Header */}
        <div className={`px-4 py-3 border-b ${bdr} flex items-center gap-2.5 shrink-0`}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-md">
            <BotMessageSquare className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-[13px] font-semibold ${txt}`}>AI Coder</p>
            <p className={`text-[10px] font-mono ${d ? 'text-emerald-400' : 'text-[#176B5B]'}`}>Qwen3-4B · llama.cpp :9090</p>
          </div>
          {/* Qwen status dot */}
          <div className="flex flex-col items-end gap-0.5">
            <div className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${qwenOk ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
              <span className={`text-[9px] font-mono ${sub}`}>{qwenOk === null ? '…' : qwenOk ? 'Online' : 'Offline'}</span>
            </div>
            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${d ? 'bg-[#161b22] text-[#6e7681]' : 'bg-[#F1F0EB] text-[#77766F]'}`}>
              AIR-GAPPED
            </span>
          </div>
        </div>

        {/* Qwen info pill */}
        <div className={`mx-3 mt-2 mb-1 p-2 rounded-xl border ${d ? 'bg-[#0d1117] border-[#21262d]' : 'bg-[#F1F0EB] border-[#E2DED5]'}`}>
          <div className="flex items-center gap-2 mb-0.5">
            <Cpu className={`w-3 h-3 ${d ? 'text-emerald-400' : 'text-[#176B5B]'}`} />
            <span className={`text-[10px] font-mono font-semibold ${d ? 'text-emerald-400' : 'text-[#176B5B]'}`}>
              Qwen3-4B-GGUF Q4_K_M
            </span>
          </div>
          <p className={`text-[10px] ${sub} leading-snug`}>
            Code appears directly in the editor. Accept or reject changes.
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-2.5 min-h-0">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <AgentMessage key={i} msg={msg} isDark={isDark} />
            ))}
          </AnimatePresence>
          {isGenerating && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border w-fit ${d ? 'bg-[#0d1117] border-[#21262d]' : 'bg-[#F1F0EB] border-[#E2DED5]'}`}>
              <Loader2 className={`w-3 h-3 animate-spin ${d ? 'text-emerald-400' : 'text-[#176B5B]'}`} />
              <span className={`text-[11px] ${sub}`}>Qwen is thinking…</span>
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className={`p-3 border-t ${bdr} shrink-0`}>
          <div className={`flex items-end gap-2 border rounded-xl px-3 py-2 transition-colors ${
            d ? 'bg-[#161b22] border-[#30363d] focus-within:border-emerald-700/70'
              : 'bg-[#F1F0EB] border-[#E2DED5] focus-within:border-[#176B5B]'
          }`}>
            <textarea
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Qwen to write code…"
              rows={2}
              className={`flex-1 bg-transparent text-[12px] resize-none outline-none leading-relaxed ${txt}`}
              style={{ color: d ? '#c9d1d9' : '#20211F' }}
            />
            <button onClick={handleSend} disabled={!userInput.trim() || isGenerating} id="send-message-btn"
              className="w-7 h-7 rounded-lg bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shrink-0 transition-colors shadow-md">
              <Send className="w-3 h-3 text-white" />
            </button>
          </div>
          {!qwenOk && qwenOk !== null && (
            <p className="flex items-center gap-1 text-[10px] text-red-400 mt-1.5 font-mono">
              <AlertCircle className="w-2.5 h-2.5" />
              Qwen offline. Start: llama-server --port 9090
            </p>
          )}
          {pendingCode && (
            <p className={`text-[10px] mt-1.5 text-center font-mono ${d ? 'text-yellow-400' : 'text-amber-600'}`}>
              ↑ Review code in editor — Accept or Reject
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
