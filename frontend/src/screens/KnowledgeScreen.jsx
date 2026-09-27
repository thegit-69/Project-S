import { useState, useEffect, useRef, useCallback, Component } from 'react'
import { AnimatePresence } from 'framer-motion'
import {
  FileText, Plus, X, Check, Loader2, Sparkles, ArrowUp, Download,
  ScrollText, ListChecks, Table2,
  ShieldCheck, Database, BookOpen, UploadCloud, Pin,
} from 'lucide-react'
import {
  listKnowledgeDocuments,
  uploadDocumentFile,
  pollDocumentStatus,
  queryKnowledge,
  generateApprovalNote,
  downloadApprovalNote,
} from '../services/api.js'
import MarkdownMessage from '../components/MarkdownMessage.jsx'
import NotebookLMCitations from '../components/NotebookLMCitations.jsx'
import CitationDrawer from '../components/CitationDrawer.jsx'
import StudioPanel from '../components/StudioPanel.jsx'
import { useStudio } from '../hooks/useStudio.js'
import LibraryFilePicker from '../components/LibraryFilePicker.jsx'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STUDIO_ACTIONS = [
  { key: 'summary',  label: 'Summary',      icon: ScrollText, prompt: 'Write a concise executive summary of the selected sources. Ground every statement in the documents.' },
  { key: 'findings', label: 'Key Findings', icon: ListChecks, prompt: 'List the key findings, anomalies and important data points from the selected sources as bullet points with citations.' },
  { key: 'briefing', label: 'Approval Note', icon: FileText,  prompt: 'Draft a formal approval / briefing note based strictly on the selected sources, including background, findings and a recommendation.' },
  { key: 'table',    label: 'Data Table',   icon: Table2,     prompt: 'Extract the key structured data from the selected sources and present it as a markdown table.' },
]

const SUGGESTED = [
  'What are the shutdown requirements?',
  'Summarize the inspection findings.',
  'List any safety risks mentioned.',
]

// Mirror of the backend intent_router: does this prompt ask for an
// approval-note deliverable? A match routes the chat prompt through the real
// grounded workflow (with the agentic trace + DOCX) instead of plain RAG.
const APPROVAL_NOTE_RE =
  /\b(approval[\s-]+notes?|approval[\s-]+memos?|approval[\s-]+letters?|note[\s-]+for[\s-]+approval|sign[\s-]?off[\s-]+notes?|approval[\s-]+documents?)\b/i

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const normalizeCitations = (raw = []) =>
  raw.map((c) => {
    const name = c.document || c.filename || c.source
    return {
      document: name && String(name).toLowerCase() !== 'unknown' ? name : 'Source Document',
      document_id: c.document_id,
      page: c.page ?? c.page_number ?? null,
      section: c.section || null,
      chunk_id: c.chunk_id,
      relevance_score: c.relevance_score ?? c.score ?? null,
      snippet: c.snippet || c.content || c.text || '',
    }
  })

const fileGlyph = (type = '') => type.replace('.', '').toUpperCase().slice(0, 4) || 'DOC'

// Map the backend job status (UPPERCASE enum on FileInfoResponse.job_status,
// e.g. PENDING | PROCESSING | READY | FAILED) to the UI status the Sources
// checkbox gates on ('indexed' enables selection).
const normalizeDocStatus = (raw = '') => {
  const s = String(raw).toLowerCase()
  if (s === 'ready' || s === 'indexed') return 'indexed'
  if (s === 'failed' || s === 'error') return 'error'
  if (s === 'pending' || s === 'processing') return 'processing'
  return s || 'processing'
}

// Minimum and maximum widths (px) for the Studio panel
const STUDIO_MIN_W = 260
const STUDIO_MAX_W = 560
const STUDIO_DEFAULT_W = 320

// ---------------------------------------------------------------------------
// Error Boundary — catches render crashes and shows the error instead of blank
// ---------------------------------------------------------------------------

class KnowledgeErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  render() {
    if (this.state.error) {
      return (
        <div className="w-full h-screen flex flex-col items-center justify-center gap-4 p-8 bg-[#F7F6F2] dark:bg-[#000000] text-[#20211F] dark:text-[#E0E0E0] font-sans">
          <p className="text-[15px] font-semibold">Knowledge screen error</p>
          <pre className="text-[12px] font-mono bg-white dark:bg-[#0D0D0D] border border-[#E2DED5] dark:border-[#2A2E27] rounded-xl px-4 py-3 max-w-2xl overflow-auto whitespace-pre-wrap text-red-600 dark:text-red-400">
            {this.state.error?.message}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function KnowledgeScreenInner() {
  // ---- Sources ----
  const [sources, setSources] = useState([])
  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const [loadingSources, setLoadingSources] = useState(true)
  const [dragOver, setDragOver] = useState(false)

  // ---- Chat ----
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isQuerying, setIsQuerying] = useState(false)
  const [statusText, setStatusText] = useState('')
  const [activeCitation, setActiveCitation] = useState(null)

  // ---- Studio ----
  const {
    artifacts,
    activeArtifact,
    appendToActive,
    createArtifact,
    setActive,
    renameArtifact,
    updateArtifact,
    deleteArtifact,
    pinMessage,
    clearAll,
  } = useStudio()
  const [studioBusy, setStudioBusy] = useState(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  // Live "agent working" trace shown in the chat stream while a Studio action
  // runs, so the user sees the agent step through the document (retrieve ->
  // read -> extract -> draft) like a hosted assistant would.
  const [agentActivity, setAgentActivity] = useState(null)

  // ---- Resizable pane ----
  const [studioPanelWidth, setStudioPanelWidth] = useState(() => {
    const saved = parseInt(localStorage.getItem('vault_studio_width') || '', 10)
    return !isNaN(saved) ? saved : STUDIO_DEFAULT_W
  })
  const resizingRef = useRef(false)
  const startXRef = useRef(0)
  const startWRef = useRef(STUDIO_DEFAULT_W)
  const containerRef = useRef(null)

  // ---- Refs ----
  const fileInputRef = useRef(null)
  const scrollRef = useRef(null)

  // ---- Derived ----
  const selectedCount = selectedIds.size
  const groundDocId = selectedCount === 1 ? [...selectedIds][0] : null
  const hasSources = sources.length > 0
  const allSelected = hasSources && selectedCount === sources.length

  // ---------------------------------------------------------------------------
  // Data loading
  // ---------------------------------------------------------------------------

  const loadSources = useCallback(async () => {
    setLoadingSources(true)
    try {
      const docs = await listKnowledgeDocuments()
      const mapped = (docs || []).map((d) => ({
        id: d.document_id,
        name: d.filename || d.document_id,
        type: (d.file_type || d.file_extension || 'doc').replace('.', ''),
        chunks: d.chunk_count ?? 0,
        status: normalizeDocStatus(d.job_status || d.status || d.ingestion_status || 'ready'),
      }))
      setSources(mapped)
      // Only auto-select sources that are actually selectable (indexed).
      setSelectedIds(new Set(mapped.filter((m) => m.status === 'indexed').map((m) => m.id)))
    } catch (err) {
      console.warn('[Knowledge] loadSources failed', err)
    } finally {
      setLoadingSources(false)
    }
  }, [])

  useEffect(() => { loadSources() }, [loadSources])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isQuerying, agentActivity])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setActiveCitation(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // ---------------------------------------------------------------------------
  // Resizable pane
  // ---------------------------------------------------------------------------

  const startResize = useCallback((e) => {
    e.preventDefault()
    resizingRef.current = true
    startXRef.current = e.clientX
    startWRef.current = studioPanelWidth

    const onMove = (me) => {
      if (!resizingRef.current) return
      // Drag left increases Studio width, drag right decreases it
      const delta = startXRef.current - me.clientX
      const newW = Math.min(STUDIO_MAX_W, Math.max(STUDIO_MIN_W, startWRef.current + delta))
      setStudioPanelWidth(newW)
    }

    const onUp = () => {
      resizingRef.current = false
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [studioPanelWidth])

  // Persist width after state settles
  useEffect(() => {
    try {
      localStorage.setItem('vault_studio_width', String(studioPanelWidth))
    } catch {
      // localStorage quota exceeded — width preference not saved
    }
  }, [studioPanelWidth])

  // ---------------------------------------------------------------------------
  // Source management
  // ---------------------------------------------------------------------------

  const toggleSelect = (id) => setSelectedIds((prev) => {
    const next = new Set(prev)
    if (next.has(id)) next.delete(id); else next.add(id)
    return next
  })

  const toggleSelectAll = () =>
    setSelectedIds(allSelected ? new Set() : new Set(sources.map((s) => s.id)))

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || [])
    for (const file of files) {
      const tempId = `up-${Date.now()}-${file.name}`
      setSources((prev) => [
        { id: tempId, name: file.name, type: file.name.split('.').pop(), chunks: 0, status: 'uploading' },
        ...prev,
      ])
      try {
        const res = await uploadDocumentFile(file)
        const realId = res.document_id || tempId
        setSources((prev) => prev.map((s) => (s.id === tempId
          ? { id: realId, name: res.filename || file.name, type: (res.file_extension || file.name.split('.').pop()).replace('.', ''), chunks: 0, status: 'uploading' }
          : s)))

        const pollInterval = setInterval(async () => {
          try {
            const statusRes = await pollDocumentStatus(realId)
            // GET /files/{id} carries the ingestion state under `job_status`
            // (UPPERCASE enum, e.g. READY), not `status`.
            const raw = (statusRes.job_status || statusRes.status || '').toLowerCase()
            const uiStatus = normalizeDocStatus(raw)
            setSources((prev) => prev.map((s) => (s.id === realId
              ? { ...s, status: uiStatus, chunks: statusRes.chunk_count ?? s.chunks }
              : s)))
            if (raw === 'ready') {
              clearInterval(pollInterval)
              setSelectedIds((prev) => new Set(prev).add(realId))
            } else if (raw === 'failed') {
              clearInterval(pollInterval)
              setSources((prev) => prev.map((s) => (s.id === realId ? { ...s, status: 'error' } : s)))
            }
          } catch {
            clearInterval(pollInterval)
          }
        }, 2000)
      } catch {
        setSources((prev) => prev.map((s) => (s.id === tempId ? { ...s, status: 'error' } : s)))
      }
    }
  }

  const onDrop = (e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }

  // Remove a source from THIS session's working set only. The file stays in the
  // library (no deleteKnowledgeDocument call) so it can be re-added later.
  const handleRemoveSource = (id) => {
    setSources((prev) => prev.filter((s) => s.id !== id))
    setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n })
  }

  // ---------------------------------------------------------------------------
  // Chat / RAG
  // ---------------------------------------------------------------------------

  const runQuery = async (text) => {
    const q = (text ?? input).trim()
    if (!q || isQuerying || agentActivity) return
    setInput('')
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', text: q }])

    // Approval-note request typed in chat -> run the real grounded workflow
    // (same agentic trace + DOCX as the Studio "Approval Note" button).
    if (APPROVAL_NOTE_RE.test(q)) {
      if (!groundDocId) {
        setMessages((prev) => [...prev, {
          id: `a-${Date.now()}`, role: 'assistant', isError: true,
          text: 'Select exactly one source to draft its approval note (the note is grounded in a single document).',
        }])
        return
      }
      setIsQuerying(true)
      try {
        const result = await runWithAgentSteps(
          'Drafting approval note',
          [
            'Reading the selected document',
            'Retrieving the most relevant sections',
            'Extracting key findings',
            'Drafting the approval note',
            'Exporting a Word (.docx) deliverable',
          ],
          () => generateApprovalNote(groundDocId, { instructions: q }),
        )
        const cites = normalizeCitations(result.citations)
        appendToActive('Approval Note', result.note_markdown || 'No note was generated.', cites, 'action')
        setMessages((prev) => [...prev, {
          id: `a-${Date.now()}`,
          role: 'assistant',
          mode: 'approval note',
          text: 'Approval note drafted from the selected source and added to Studio.',
          citations: cites,
          documentId: result.document_id,
        }])
      } catch (err) {
        setMessages((prev) => [...prev, {
          id: `a-${Date.now()}`, role: 'assistant', isError: true,
          text: `The agent could not draft the approval note. (${err.message || 'unavailable'})`,
        }])
      } finally {
        setIsQuerying(false)
      }
      return
    }

    // Normal grounded RAG — shown with the same agentic trace.
    setIsQuerying(true)
    try {
      const res = await runWithAgentSteps(
        'Answering from sources',
        [
          'Searching the local vector store',
          'Reading the grounded passages',
          'Synthesizing a grounded answer',
        ],
        () => queryKnowledge(q, 6, groundDocId),
      )
      setMessages((prev) => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: res.answer || 'No grounded answer was produced.',
        citations: normalizeCitations(res.citations),
        evidenceQuality: res.evidence_quality,
        model: res.model_used,
        durationMs: res.total_time_ms,
        tokensUsed: res.tokens_used,
      }])
    } catch (err) {
      setMessages((prev) => [...prev, {
        id: `a-${Date.now()}`, role: 'assistant', isError: true,
        text: `Could not reach the local knowledge engine. (${err.message || 'unavailable'})`,
      }])
    } finally {
      setIsQuerying(false)
      setStatusText('')
    }
  }

  // ---------------------------------------------------------------------------
  // Studio actions (agentic)
  // ---------------------------------------------------------------------------

  // Drive a visible step trace while `work` (a real backend call) runs. Steps
  // advance on a timer up to the last one, which stays "active" until the work
  // resolves — mirroring how the pipeline actually progresses without faking a
  // result. The trace is torn down shortly after completion.
  const runWithAgentSteps = useCallback(async (title, stepLabels, work) => {
    let steps = stepLabels.map((label, i) => ({ label, status: i === 0 ? 'active' : 'pending' }))
    setAgentActivity({ title, steps })
    let idx = 0
    const timer = setInterval(() => {
      if (idx >= steps.length - 1) return
      idx += 1
      steps = steps.map((s, i) => (
        i < idx ? { ...s, status: 'done' } : i === idx ? { ...s, status: 'active' } : s
      ))
      setAgentActivity({ title, steps: [...steps] })
    }, 1100)
    try {
      return await work()
    } finally {
      clearInterval(timer)
      setAgentActivity({ title, steps: steps.map((s) => ({ ...s, status: 'done' })) })
      setTimeout(() => setAgentActivity(null), 700)
    }
  }, [])

  const handleDownloadNote = useCallback(async (documentId) => {
    try {
      const blob = await downloadApprovalNote(documentId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'approval_note.docx'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      setMessages((prev) => [...prev, {
        id: `a-${Date.now()}`, role: 'assistant', isError: true,
        text: `Could not download the approval note. (${err.message || 'unavailable'})`,
      }])
    }
  }, [])

  const handleStudio = async (action) => {
    if (studioBusy || !hasSources || agentActivity) return
    setStudioBusy(action.key)
    try {
      if (action.key === 'briefing') {
        // Real approval-note workflow: grounded, cited, and exports a DOCX.
        if (!groundDocId) {
          setMessages((prev) => [...prev, {
            id: `a-${Date.now()}`, role: 'assistant', isError: true,
            text: 'Select exactly one source to draft its approval note (the note is grounded in a single document).',
          }])
          return
        }
        const result = await runWithAgentSteps(
          'Drafting approval note',
          [
            'Reading the selected document',
            'Retrieving the most relevant sections',
            'Extracting key findings',
            'Drafting the approval note',
            'Exporting a Word (.docx) deliverable',
          ],
          () => generateApprovalNote(groundDocId, { instructions: action.prompt }),
        )
        const cites = normalizeCitations(result.citations)
        appendToActive(action.label, result.note_markdown || 'No note was generated.', cites, 'action')
        setMessages((prev) => [...prev, {
          id: `a-${Date.now()}`,
          role: 'assistant',
          mode: 'approval note',
          text: 'Approval note drafted from the selected source and added to Studio.',
          citations: cites,
          documentId: result.document_id,
        }])
      } else {
        const res = await runWithAgentSteps(
          action.label,
          [
            'Searching the local vector store',
            'Reading the grounded passages',
            `Composing the ${action.label.toLowerCase()}`,
          ],
          () => queryKnowledge(action.prompt, 8, groundDocId),
        )
        appendToActive(action.label, res.answer || 'No output generated.', normalizeCitations(res.citations), 'action')
      }
    } catch (err) {
      setMessages((prev) => [...prev, {
        id: `a-${Date.now()}`, role: 'assistant', isError: true,
        text: `The agent could not complete "${action.label}". (${err.message || 'unavailable'})`,
      }])
    } finally {
      setStudioBusy(null)
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="w-full h-screen flex gap-3 p-3 bg-[#F7F6F2] dark:bg-[#000000] text-[#20211F] dark:text-[#E0E0E0] font-sans overflow-hidden">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.txt,.md,.csv,.xlsx"
        className="hidden"
        onChange={(e) => { handleFiles(e.target.files); e.target.value = '' }}
      />

      {/* ---- SOURCES PANEL ---- */}
      <section
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`w-[280px] shrink-0 flex flex-col rounded-2xl bg-white dark:bg-[#0D0D0D] border overflow-hidden transition-colors ${dragOver ? 'border-[#176B5B] dark:border-[#38A18C] ring-2 ring-[#176B5B]/30' : 'border-[#E2DED5] dark:border-[#30332B]'}`}
      >
        <div className="px-4 pt-4 pb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#176B5B] dark:text-[#4AF626]" />
            Sources
          </h2>
          <span className="text-[11px] font-mono text-[#A09E96] dark:text-[#888888]">{sources.length}</span>
        </div>

        <div className="px-4 pb-3">
          <button
            onClick={() => setPickerOpen(true)}
            className="w-full h-9 rounded-full bg-[#176B5B] hover:bg-[#13584B] text-white text-[13px] font-medium flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add sources
          </button>
        </div>

        {hasSources && (
          <div className="px-4 pb-2 flex items-center justify-between text-[11px]">
            <button
              onClick={toggleSelectAll}
              className="font-mono uppercase tracking-wider text-[#77766F] dark:text-[#888888] hover:text-[#176B5B] dark:hover:text-[#4AF626] transition-colors"
            >
              {allSelected ? 'Deselect all' : 'Select all'}
            </button>
            <span className="font-mono text-[#A09E96] dark:text-[#888888]">{selectedCount} selected</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5">
          {loadingSources && (
            <div className="flex items-center justify-center py-10 text-[#A09E96]">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          )}
          {!loadingSources && !hasSources && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full mt-2 rounded-xl border-2 border-dashed border-[#E2DED5] dark:border-[#333333] px-4 py-8 flex flex-col items-center gap-2 text-center hover:border-[#176B5B]/50 transition-colors"
            >
              <UploadCloud className="w-7 h-7 text-[#A09E96] dark:text-[#888888]" />
              <span className="text-[12px] text-[#77766F] dark:text-[#888888]">
                Drop PDFs, DOCX or TXT here<br />to ground your answers
              </span>
            </button>
          )}
          {sources.map((s) => {
            const selected = selectedIds.has(s.id)
            return (
              <div
                key={s.id}
                className={`group flex items-center gap-2.5 px-2.5 py-2 rounded-xl border transition-colors ${selected ? 'bg-[#F1F7F5] dark:bg-[#16211D] border-[#CDE5DD] dark:border-[#333333]' : 'bg-transparent border-transparent hover:bg-[#F7F6F2] dark:hover:bg-[#1A1A1A]'}`}
              >
                <button
                  onClick={() => toggleSelect(s.id)}
                  disabled={s.status !== 'indexed'}
                  className={`w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0 transition-colors ${selected ? 'bg-[#176B5B] border-[#176B5B]' : 'border-[#C7C3B9] dark:border-[#4a4d43]'} disabled:opacity-40`}
                >
                  {selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </button>
                <span className="w-7 h-7 rounded-md bg-[#176B5B]/10 dark:bg-[#176B5B]/25 text-[#176B5B] dark:text-[#4AF626] text-[8px] font-mono font-bold flex items-center justify-center shrink-0">
                  {fileGlyph(s.type)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-medium truncate">{s.name}</p>
                  <p className="text-[10px] font-mono text-[#A09E96] dark:text-[#888888]">
                    {s.status === 'uploading' ? 'Indexing...' : s.status === 'error' ? 'Failed' : `${s.chunks} chunks`}
                  </p>
                </div>
                {s.status === 'uploading' || s.status === 'pending' || s.status === 'processing'
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#176B5B] shrink-0" />
                  : (
                    <button
                      onClick={() => handleRemoveSource(s.id)}
                      className="opacity-0 group-hover:opacity-100 text-[#A09E96] hover:text-[#176B5B] dark:hover:text-[#4AF626] transition-all shrink-0"
                      title="Remove from this session (keeps it in the library)"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
              </div>
            )
          })}
        </div>

        <div className="px-4 py-2.5 border-t border-[#E2DED5] dark:border-[#30332B] flex items-center gap-1.5 text-[10px] font-mono text-[#A09E96] dark:text-[#888888]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#176B5B] dark:text-[#4AF626]" />
          Local enclave - Zero egress
        </div>
      </section>

      {/* ---- CHAT + STUDIO (resizable) ---- */}
      <div ref={containerRef} className="flex flex-1 min-w-0 gap-0 relative">

        {/* ---- CHAT PANEL ---- */}
        <section className="flex-1 min-w-0 flex flex-col rounded-2xl bg-white dark:bg-[#0D0D0D] border border-[#E2DED5] dark:border-[#30332B] overflow-hidden">
          <div className="px-6 h-14 flex items-center justify-between border-b border-[#E2DED5] dark:border-[#30332B] shrink-0">
            <div>
              <h1 className="text-[16px] font-semibold tracking-tight">Knowledge Base</h1>
              <p className="text-[11px] font-mono text-[#77766F] dark:text-[#888888]">
                Grounded RAG - {selectedCount || 'all'} source{selectedCount === 1 ? '' : 's'} - Air-gapped
              </p>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#176B5B]/10 text-[#176B5B] dark:text-[#4AF626] border border-[#176B5B]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#176B5B] dark:bg-[#38A18C] pulse-dot" />
              Local
            </span>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6">
            <div className="max-w-[720px] mx-auto flex flex-col gap-6">
              {messages.length === 0 && !isQuerying && (
                <div className="flex flex-col items-center text-center pt-16 pb-8">
                  <div className="w-14 h-14 rounded-2xl bg-[#176B5B]/10 dark:bg-[#176B5B]/25 flex items-center justify-center mb-4">
                    <Database className="w-7 h-7 text-[#176B5B] dark:text-[#4AF626]" />
                  </div>
                  <h3 className="text-[20px] font-semibold mb-1">
                    {hasSources ? 'Ask your sources anything' : 'Add a source to get started'}
                  </h3>
                  <p className="text-[13px] text-[#77766F] dark:text-[#888888] max-w-sm">
                    {hasSources
                      ? 'Answers are grounded in your selected documents and cited back to the exact page.'
                      : 'Upload manuals, SOPs or reports on the left. Everything is embedded and stored locally.'}
                  </p>
                </div>
              )}

              {messages.map((m) =>
                m.role === 'user' ? (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl rounded-br-md bg-[#176B5B] text-white px-4 py-2.5 text-[14px] leading-relaxed">
                      {m.text}
                    </div>
                  </div>
                ) : (
                  <div
                    key={m.id}
                    className={`rounded-2xl px-4 py-3.5 border ${m.isError
                      ? 'bg-[#FEF2F2] dark:bg-[#2A1A1A] border-[#F3C9C9] dark:border-[#5A2A2A] text-[#BA1A1A] dark:text-[#F3A9A9]'
                      : 'bg-[#FAF9F5] dark:bg-[#20221E] border-[#E2DED5] dark:border-[#30332B]'}`}
                  >
                    {!m.isError && (
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-[#176B5B] dark:text-[#4AF626]" />
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#176B5B] dark:text-[#4AF626] font-semibold">
                          Vault Synthesis
                        </span>
                        {m.evidenceQuality && (
                          <span className="text-[10px] font-mono text-[#A09E96] dark:text-[#888888]">
                            - {m.evidenceQuality} evidence
                          </span>
                        )}
                      </div>
                    )}

                    <div className="text-[14px] leading-relaxed knowledge-prose">
                      <MarkdownMessage content={m.text} />
                    </div>

                    {m.citations?.length > 0 && (
                      <NotebookLMCitations
                        citations={m.citations}
                        onSelectCitation={(c, i) => setActiveCitation({ citation: c, index: i })}
                      />
                    )}

                    {m.mode === 'approval note' && m.documentId && (
                      <button
                        onClick={() => handleDownloadNote(m.documentId)}
                        className="mt-3 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#176B5B] hover:bg-[#13584B] text-white text-[12.5px] font-medium transition-colors shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download approval note (.docx)
                      </button>
                    )}

                    {!m.isError && (m.model || m.durationMs != null) && (
                      <div className="mt-2.5 pt-2 border-t border-[#E2DED5] dark:border-[#30332B] flex items-center gap-3 text-[10px] font-mono text-[#A09E96] dark:text-[#888888]">
                        {m.model && <span>{m.model}</span>}
                        {m.durationMs != null && <span>{Math.round(m.durationMs)} ms</span>}
                        {m.tokensUsed != null && <span>{m.tokensUsed} tok</span>}
                        {/* Pin to Studio */}
                        <button
                          onClick={() => pinMessage(m)}
                          className="ml-auto flex items-center gap-1 text-[#A09E96] hover:text-[#176B5B] dark:hover:text-[#4AF626] transition-colors"
                          title="Pin this response to the Studio panel"
                        >
                          <Pin className="w-3 h-3" />
                          Pin to Studio
                        </button>
                      </div>
                    )}
                  </div>
                )
              )}

              {agentActivity && (
                <div className="rounded-2xl px-4 py-3.5 border bg-[#FAF9F5] dark:bg-[#20221E] border-[#E2DED5] dark:border-[#30332B]">
                  <div className="flex items-center gap-2 mb-2.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#176B5B] dark:text-[#4AF626]" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#176B5B] dark:text-[#4AF626] font-semibold">
                      Agent - {agentActivity.title}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {agentActivity.steps.map((s, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-[12.5px]">
                        {s.status === 'done' ? (
                          <Check className="w-3.5 h-3.5 text-[#176B5B] dark:text-[#4AF626] shrink-0" strokeWidth={3} />
                        ) : s.status === 'active' ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#176B5B] dark:text-[#4AF626] shrink-0" />
                        ) : (
                          <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C7C3B9] dark:bg-[#4a4d43]" />
                          </span>
                        )}
                        <span className={
                          s.status === 'pending'
                            ? 'text-[#A09E96] dark:text-[#777970]'
                            : s.status === 'active'
                            ? 'text-[#20211F] dark:text-[#E0E0E0] font-medium'
                            : 'text-[#77766F] dark:text-[#888888]'
                        }>
                          {s.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isQuerying && !agentActivity && (
                <div className="rounded-2xl px-4 py-3.5 border bg-[#FAF9F5] dark:bg-[#20221E] border-[#E2DED5] dark:border-[#30332B]">
                  <div className="flex items-center gap-2 text-[13px] text-[#77766F] dark:text-[#888888]">
                    <Loader2 className="w-4 h-4 animate-spin text-[#176B5B] dark:text-[#4AF626]" />
                    {statusText || 'Synthesizing grounded answer...'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chat input */}
          <div className="px-6 pb-5 pt-2 shrink-0">
            <div className="max-w-[720px] mx-auto">
              {messages.length === 0 && hasSources && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {SUGGESTED.map((s) => (
                    <button
                      key={s}
                      onClick={() => runQuery(s)}
                      disabled={isQuerying}
                      className="text-[12px] px-3 py-1.5 rounded-full border border-[#E2DED5] dark:border-[#30332B] text-[#77766F] dark:text-[#888888] hover:border-[#176B5B] hover:text-[#176B5B] dark:hover:text-[#4AF626] transition-colors disabled:opacity-40"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              <form
                onSubmit={(e) => { e.preventDefault(); runQuery() }}
                className="flex items-end gap-2 rounded-2xl border border-[#E2DED5] dark:border-[#30332B] bg-[#FAF9F5] dark:bg-[#20221E] px-2 py-2 focus-within:border-[#176B5B] dark:focus-within:border-[#38A18C] transition-colors"
              >
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-[#77766F] dark:text-[#888888] hover:bg-[#176B5B]/10 hover:text-[#176B5B] dark:hover:text-[#4AF626] transition-colors"
                  title="Add source"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); runQuery() } }}
                  rows={1}
                  placeholder={hasSources ? 'Ask anything about your sources...' : 'Add a source to start asking...'}
                  disabled={!hasSources || isQuerying}
                  className="flex-1 resize-none bg-transparent outline-none text-[14px] leading-relaxed py-2 max-h-32 placeholder:text-[#A09E96] dark:placeholder:text-[#777970] disabled:opacity-50"
                />
                <span className="text-[10px] font-mono text-[#A09E96] dark:text-[#888888] pb-2.5 shrink-0 hidden sm:block">
                  {selectedCount || sources.length} src
                </span>
                <button
                  type="submit"
                  disabled={!input.trim() || isQuerying}
                  className="w-9 h-9 shrink-0 rounded-xl bg-[#176B5B] hover:bg-[#13584B] text-white flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isQuerying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUp className="w-5 h-5" />}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* ---- RESIZE HANDLE ---- */}
        <div
          onMouseDown={startResize}
          className="w-3 shrink-0 flex items-center justify-center cursor-col-resize group"
          title="Drag to resize"
        >
          <div className="w-0.5 h-12 rounded-full bg-[#E2DED5] dark:bg-[#2A2E27] group-hover:bg-[#176B5B]/50 dark:group-hover:bg-[#4AF626]/30 transition-colors" />
        </div>

        {/* ---- STUDIO PANEL ---- */}
        <StudioPanel
          artifacts={artifacts}
          activeArtifact={activeArtifact}
          hasSources={hasSources}
          studioBusy={studioBusy}
          studioActions={STUDIO_ACTIONS}
          onAction={handleStudio}
          onCreate={() => createArtifact()}
          onSelectArtifact={setActive}
          onRenameArtifact={renameArtifact}
          onUpdateArtifact={updateArtifact}
          onDeleteArtifact={deleteArtifact}
          onCitationClick={(c, i) => setActiveCitation({ citation: c, index: i })}
          onClearAll={clearAll}
          style={{ width: studioPanelWidth }}
        />
      </div>

      {/* ---- CITATION DRAWER ---- */}
      <AnimatePresence>
        {activeCitation && (
          <CitationDrawer
            citation={activeCitation.citation}
            citationIndex={activeCitation.index}
            onClose={() => setActiveCitation(null)}
          />
        )}
      </AnimatePresence>

      {/* Library File Picker */}
      <LibraryFilePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        source="knowledge"
        onSelect={(files) => {
          files.forEach((f) => {
            if (f.already_indexed) {
              // Reuse without re-embedding
              setSources((prev) => {
                if (prev.some((s) => s.id === f.document_id)) return prev
                return [...prev, {
                  id: f.document_id,
                  name: f.filename,
                  type: f.file_type || 'doc',
                  chunks: f.chunk_count || 0,
                  status: 'indexed',
                }]
              })
              setSelectedIds((prev) => new Set(prev).add(f.document_id))
            } else if (f.file) {
              handleFiles([f.file])
            }
          })
        }}
      />
    </div>
  )
}

export default function KnowledgeScreen(props) {
  return (
    <KnowledgeErrorBoundary>
      <KnowledgeScreenInner {...props} />
    </KnowledgeErrorBoundary>
  )
}
