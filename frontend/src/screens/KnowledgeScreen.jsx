import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Plus, Trash2, Check, Loader2, Sparkles, ArrowUp,
  ScrollText, ListChecks, GraduationCap, Network, Clock, Table2,
  HelpCircle, ShieldCheck, X, Copy, Database, BookOpen, UploadCloud,
} from 'lucide-react'
import {
  listKnowledgeDocuments,
  deleteKnowledgeDocument,
  uploadAndIngestDocument,
  queryKnowledge,
} from '../services/api.js'
import MarkdownMessage from '../components/MarkdownMessage.jsx'
import NotebookLMCitations from '../components/NotebookLMCitations.jsx'
import CitationDrawer from '../components/CitationDrawer.jsx'

// Grounded generation shortcuts shown in the Studio panel. Each sends a
// templated prompt through the local RAG pipeline and saves the result.
const STUDIO_ACTIONS = [
  { key: 'summary', label: 'Summary', icon: ScrollText, prompt: 'Write a concise executive summary of the selected sources. Ground every statement in the documents.' },
  { key: 'findings', label: 'Key Findings', icon: ListChecks, prompt: 'List the key findings, anomalies and important data points from the selected sources as bullet points with citations.' },
  { key: 'briefing', label: 'Approval Note', icon: FileText, prompt: 'Draft a formal approval / briefing note based strictly on the selected sources, including background, findings and a recommendation.' },
  { key: 'faq', label: 'Study Guide', icon: GraduationCap, prompt: 'Create a study guide with the most important questions and answers derived from the selected sources.' },
  { key: 'mindmap', label: 'Mind Map', icon: Network, prompt: 'Produce a hierarchical outline / mind map of the main topics and sub-topics covered by the selected sources.' },
  { key: 'timeline', label: 'Timeline', icon: Clock, prompt: 'Extract a chronological timeline of events, dates and milestones mentioned in the selected sources.' },
  { key: 'table', label: 'Data Table', icon: Table2, prompt: 'Extract the key structured data from the selected sources and present it as a markdown table.' },
  { key: 'quiz', label: 'Quiz', icon: HelpCircle, prompt: 'Generate a short quiz (5 questions with answers) that tests understanding of the selected sources.' },
]

const SUGGESTED = [
  'What are the shutdown requirements?',
  'Summarize the inspection findings.',
  'List any safety risks mentioned.',
]

const normalizeCitations = (raw = []) =>
  raw.map((c) => ({
    document: c.document || c.filename || c.source || 'Source Document',
    document_id: c.document_id,
    page: c.page ?? c.page_number ?? null,
    section: c.section || null,
    chunk_id: c.chunk_id,
    relevance_score: c.relevance_score ?? c.score ?? null,
    snippet: c.snippet || c.content || c.text || '',
  }))

const fileGlyph = (type = '') => type.replace('.', '').toUpperCase().slice(0, 4) || 'DOC'

export default function KnowledgeScreen() {
  const [sources, setSources] = useState([])
  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const [loadingSources, setLoadingSources] = useState(true)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isQuerying, setIsQuerying] = useState(false)
  const [statusText, setStatusText] = useState('')
  const [activeCitation, setActiveCitation] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [studioNotes, setStudioNotes] = useState([])
  const [studioBusy, setStudioBusy] = useState(null)
  const [expandedNote, setExpandedNote] = useState(null)

  const fileInputRef = useRef(null)
  const scrollRef = useRef(null)

  const selectedCount = selectedIds.size
  const groundDocId = selectedCount === 1 ? [...selectedIds][0] : null
  const hasSources = sources.length > 0
  const allSelected = hasSources && selectedCount === sources.length

  const loadSources = useCallback(async () => {
    setLoadingSources(true)
    try {
      const docs = await listKnowledgeDocuments()
      const mapped = (docs || []).map((d) => ({
        id: d.document_id,
        name: d.filename || d.document_id,
        type: d.file_type || 'doc',
        chunks: d.chunk_count ?? 0,
        status: (d.ingestion_status || 'indexed').toLowerCase(),
      }))
      setSources(mapped)
      setSelectedIds(new Set(mapped.map((m) => m.id)))
    } finally {
      setLoadingSources(false)
    }
  }, [])

  useEffect(() => { loadSources() }, [loadSources])
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isQuerying])
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setActiveCitation(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

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
        const res = await uploadAndIngestDocument(file)
        const realId = res.document_id || tempId
        setSources((prev) => prev.map((s) => (s.id === tempId
          ? { id: realId, name: res.filename || file.name, type: res.file_type || file.name.split('.').pop(), chunks: res.chunks ?? 0, status: 'indexed' }
          : s)))
        setSelectedIds((prev) => new Set(prev).add(realId))
      } catch {
        setSources((prev) => prev.map((s) => (s.id === tempId ? { ...s, status: 'error' } : s)))
      }
    }
  }

  const onDrop = (e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }

  const handleDelete = async (id) => {
    setSources((prev) => prev.filter((s) => s.id !== id))
    setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n })
    await deleteKnowledgeDocument(id)
  }

  const runQuery = async (text) => {
    const q = (text ?? input).trim()
    if (!q || isQuerying) return
    setInput('')
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', text: q }])
    setIsQuerying(true)
    setStatusText('Searching local vectors…')
    try {
      const res = await queryKnowledge(q, 6, groundDocId)
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
        text: `⚠️ Could not reach the local knowledge engine. (${err.message || 'unavailable'})`,
      }])
    } finally {
      setIsQuerying(false)
      setStatusText('')
    }
  }

  const handleStudio = async (action) => {
    if (studioBusy || !hasSources) return
    setStudioBusy(action.key)
    try {
      const res = await queryKnowledge(action.prompt, 8, groundDocId)
      setStudioNotes((prev) => [{
        id: `note-${Date.now()}`,
        title: action.label,
        content: res.answer || 'No output generated.',
        citations: normalizeCitations(res.citations),
        ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }, ...prev])
    } finally {
      setStudioBusy(null)
    }
  }

  const copyText = (t) => navigator.clipboard?.writeText(t)

  return (
    <div className="w-full h-screen flex gap-3 p-3 bg-[#F7F6F2] dark:bg-[#151614] text-[#20211F] dark:text-[#ECEAE3] font-sans overflow-hidden">
      <input ref={fileInputRef} type="file" multiple accept=".pdf,.docx,.txt,.md,.csv" className="hidden"
        onChange={(e) => { handleFiles(e.target.files); e.target.value = '' }} />

      {/* ── SOURCES PANEL ── */}
      <section
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`w-[300px] shrink-0 flex flex-col rounded-2xl bg-white dark:bg-[#1C1E1B] border overflow-hidden transition-colors ${dragOver ? 'border-[#176B5B] dark:border-[#38A18C] ring-2 ring-[#176B5B]/30' : 'border-[#E2DED5] dark:border-[#30332B]'}`}
      >
        <div className="px-4 pt-4 pb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#176B5B] dark:text-[#38A18C]" /> Sources
          </h2>
          <span className="text-[11px] font-mono text-[#A09E96] dark:text-[#777970]">{sources.length}</span>
        </div>

        <div className="px-4 pb-3">
          <button onClick={() => fileInputRef.current?.click()}
            className="w-full h-9 rounded-full bg-[#176B5B] hover:bg-[#13584B] text-white text-[13px] font-medium flex items-center justify-center gap-1.5 transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Add sources
          </button>
        </div>

        {hasSources && (
          <div className="px-4 pb-2 flex items-center justify-between text-[11px]">
            <button onClick={toggleSelectAll} className="font-mono uppercase tracking-wider text-[#77766F] dark:text-[#A6A69D] hover:text-[#176B5B] dark:hover:text-[#38A18C] transition-colors">
              {allSelected ? 'Deselect all' : 'Select all'}
            </button>
            <span className="font-mono text-[#A09E96] dark:text-[#777970]">{selectedCount} selected</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5">
          {loadingSources && (
            <div className="flex items-center justify-center py-10 text-[#A09E96]"><Loader2 className="w-5 h-5 animate-spin" /></div>
          )}
          {!loadingSources && !hasSources && (
            <button onClick={() => fileInputRef.current?.click()} className="w-full mt-2 rounded-xl border-2 border-dashed border-[#E2DED5] dark:border-[#34362F] px-4 py-8 flex flex-col items-center gap-2 text-center hover:border-[#176B5B]/50 transition-colors">
              <UploadCloud className="w-7 h-7 text-[#A09E96] dark:text-[#777970]" />
              <span className="text-[12px] text-[#77766F] dark:text-[#A6A69D]">Drop PDFs, DOCX or TXT here<br />to ground your answers</span>
            </button>
          )}
          {sources.map((s) => {
            const selected = selectedIds.has(s.id)
            return (
              <div key={s.id} className={`group flex items-center gap-2.5 px-2.5 py-2 rounded-xl border transition-colors ${selected ? 'bg-[#F1F7F5] dark:bg-[#16211D] border-[#CDE5DD] dark:border-[#28423C]' : 'bg-transparent border-transparent hover:bg-[#F7F6F2] dark:hover:bg-[#242620]'}`}>
                <button onClick={() => toggleSelect(s.id)} disabled={s.status !== 'indexed'}
                  className={`w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0 transition-colors ${selected ? 'bg-[#176B5B] border-[#176B5B]' : 'border-[#C7C3B9] dark:border-[#4a4d43]'} disabled:opacity-40`}>
                  {selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </button>
                <span className="w-7 h-7 rounded-md bg-[#176B5B]/10 dark:bg-[#176B5B]/25 text-[#176B5B] dark:text-[#38A18C] text-[8px] font-mono font-bold flex items-center justify-center shrink-0">
                  {fileGlyph(s.type)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-medium truncate">{s.name}</p>
                  <p className="text-[10px] font-mono text-[#A09E96] dark:text-[#777970]">
                    {s.status === 'uploading' ? 'Indexing…' : s.status === 'error' ? 'Failed' : `${s.chunks} chunks`}
                  </p>
                </div>
                {s.status === 'uploading'
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#176B5B] shrink-0" />
                  : <button onClick={() => handleDelete(s.id)} className="opacity-0 group-hover:opacity-100 text-[#A09E96] hover:text-[#BA1A1A] transition-all shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>}
              </div>
            )
          })}
        </div>

        <div className="px-4 py-2.5 border-t border-[#E2DED5] dark:border-[#30332B] flex items-center gap-1.5 text-[10px] font-mono text-[#A09E96] dark:text-[#777970]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#176B5B] dark:text-[#38A18C]" />
          Local enclave · Zero egress
        </div>
      </section>

      {/* ── CHAT PANEL ── */}
      <section className="flex-1 min-w-0 flex flex-col rounded-2xl bg-white dark:bg-[#1C1E1B] border border-[#E2DED5] dark:border-[#30332B] overflow-hidden">
        <div className="px-6 h-14 flex items-center justify-between border-b border-[#E2DED5] dark:border-[#30332B] shrink-0">
          <div>
            <h1 className="text-[16px] font-semibold tracking-tight">Knowledge Base</h1>
            <p className="text-[11px] font-mono text-[#77766F] dark:text-[#A6A69D]">
              Grounded RAG · {selectedCount || 'all'} source{selectedCount === 1 ? '' : 's'} · Air-gapped
            </p>
          </div>
          <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#176B5B]/10 text-[#176B5B] dark:text-[#38A18C] border border-[#176B5B]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#176B5B] dark:bg-[#38A18C] pulse-dot" /> Local
          </span>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-[720px] mx-auto flex flex-col gap-6">
            {messages.length === 0 && !isQuerying && (
              <div className="flex flex-col items-center text-center pt-16 pb-8">
                <div className="w-14 h-14 rounded-2xl bg-[#176B5B]/10 dark:bg-[#176B5B]/25 flex items-center justify-center mb-4">
                  <Database className="w-7 h-7 text-[#176B5B] dark:text-[#38A18C]" />
                </div>
                <h3 className="text-[20px] font-semibold mb-1">{hasSources ? 'Ask your sources anything' : 'Add a source to get started'}</h3>
                <p className="text-[13px] text-[#77766F] dark:text-[#A6A69D] max-w-sm">
                  {hasSources ? 'Answers are grounded in your selected documents and cited back to the exact page.' : 'Upload manuals, SOPs or reports on the left. Everything is embedded and stored locally.'}
                </p>
              </div>
            )}
            {messages.map((m) => (
              m.role === 'user' ? (
                <div key={m.id} className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-br-md bg-[#176B5B] text-white px-4 py-2.5 text-[14px] leading-relaxed">{m.text}</div>
                </div>
              ) : (
                <div key={m.id} className={`rounded-2xl px-4 py-3.5 border ${m.isError ? 'bg-[#FEF2F2] dark:bg-[#2A1A1A] border-[#F3C9C9] dark:border-[#5A2A2A] text-[#BA1A1A] dark:text-[#F3A9A9]' : 'bg-[#FAF9F5] dark:bg-[#20221E] border-[#E2DED5] dark:border-[#30332B]'}`}>
                  {!m.isError && (
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#176B5B] dark:text-[#38A18C]" />
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#176B5B] dark:text-[#38A18C] font-semibold">Vault Synthesis</span>
                      {m.evidenceQuality && <span className="text-[10px] font-mono text-[#A09E96] dark:text-[#777970]">· {m.evidenceQuality} evidence</span>}
                    </div>
                  )}
                  <div className="text-[14px] leading-relaxed knowledge-prose"><MarkdownMessage content={m.text} /></div>
                  {m.citations?.length > 0 && (
                    <NotebookLMCitations citations={m.citations} onSelectCitation={(c, i) => setActiveCitation({ citation: c, index: i })} />
                  )}
                  {!m.isError && (m.model || m.durationMs != null) && (
                    <div className="mt-2.5 pt-2 border-t border-[#E2DED5] dark:border-[#30332B] flex items-center gap-3 text-[10px] font-mono text-[#A09E96] dark:text-[#777970]">
                      {m.model && <span>{m.model}</span>}
                      {m.durationMs != null && <span>{Math.round(m.durationMs)} ms</span>}
                      {m.tokensUsed != null && <span>{m.tokensUsed} tok</span>}
                    </div>
                  )}
                </div>
              )
            ))}
            {isQuerying && (
              <div className="rounded-2xl px-4 py-3.5 border bg-[#FAF9F5] dark:bg-[#20221E] border-[#E2DED5] dark:border-[#30332B]">
                <div className="flex items-center gap-2 text-[13px] text-[#77766F] dark:text-[#A6A69D]">
                  <Loader2 className="w-4 h-4 animate-spin text-[#176B5B] dark:text-[#38A18C]" />
                  {statusText || 'Synthesizing grounded answer…'}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 pb-5 pt-2 shrink-0">
          <div className="max-w-[720px] mx-auto">
            {messages.length === 0 && hasSources && (
              <div className="flex flex-wrap gap-2 mb-3">
                {SUGGESTED.map((s) => (
                  <button key={s} onClick={() => runQuery(s)} disabled={isQuerying}
                    className="text-[12px] px-3 py-1.5 rounded-full border border-[#E2DED5] dark:border-[#30332B] text-[#77766F] dark:text-[#A6A69D] hover:border-[#176B5B] hover:text-[#176B5B] dark:hover:text-[#38A18C] transition-colors disabled:opacity-40">
                    {s}
                  </button>
                ))}
              </div>
            )}
            <form onSubmit={(e) => { e.preventDefault(); runQuery() }}
              className="flex items-end gap-2 rounded-2xl border border-[#E2DED5] dark:border-[#30332B] bg-[#FAF9F5] dark:bg-[#20221E] px-2 py-2 focus-within:border-[#176B5B] dark:focus-within:border-[#38A18C] transition-colors">
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-[#77766F] dark:text-[#A6A69D] hover:bg-[#176B5B]/10 hover:text-[#176B5B] dark:hover:text-[#38A18C] transition-colors" title="Add source">
                <Plus className="w-5 h-5" />
              </button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); runQuery() } }}
                rows={1}
                placeholder={hasSources ? 'Ask anything about your sources…' : 'Add a source to start asking…'}
                disabled={!hasSources || isQuerying}
                className="flex-1 resize-none bg-transparent outline-none text-[14px] leading-relaxed py-2 max-h-32 placeholder:text-[#A09E96] dark:placeholder:text-[#777970] disabled:opacity-50"
              />
              <span className="text-[10px] font-mono text-[#A09E96] dark:text-[#777970] pb-2.5 shrink-0 hidden sm:block">
                {selectedCount || sources.length} src
              </span>
              <button type="submit" disabled={!input.trim() || isQuerying}
                className="w-9 h-9 shrink-0 rounded-xl bg-[#176B5B] hover:bg-[#13584B] text-white flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                {isQuerying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUp className="w-5 h-5" />}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── STUDIO PANEL ── */}
      <section className="w-[330px] shrink-0 flex flex-col rounded-2xl bg-white dark:bg-[#1C1E1B] border border-[#E2DED5] dark:border-[#30332B] overflow-hidden">
        <div className="px-4 pt-4 pb-3 flex items-center gap-2 border-b border-[#E2DED5] dark:border-[#30332B]">
          <Sparkles className="w-4 h-4 text-[#176B5B] dark:text-[#38A18C]" />
          <h2 className="text-[15px] font-semibold">Studio</h2>
        </div>

        <div className="px-4 pt-3 pb-2">
          <div className="grid grid-cols-2 gap-2">
            {STUDIO_ACTIONS.map((a) => {
              const Icon = a.icon
              const busy = studioBusy === a.key
              return (
                <button key={a.key} onClick={() => handleStudio(a)} disabled={!hasSources || !!studioBusy}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[#E2DED5] dark:border-[#30332B] text-left hover:border-[#176B5B] dark:hover:border-[#38A18C] hover:bg-[#F1F7F5] dark:hover:bg-[#16211D] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  {busy ? <Loader2 className="w-4 h-4 animate-spin text-[#176B5B] dark:text-[#38A18C] shrink-0" /> : <Icon className="w-4 h-4 text-[#176B5B] dark:text-[#38A18C] shrink-0" />}
                  <span className="text-[12px] font-medium truncate">{a.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 pt-1 space-y-2">
          {studioNotes.length === 0 && (
            <div className="mt-4 rounded-xl border border-dashed border-[#E2DED5] dark:border-[#34362F] px-4 py-8 text-center">
              <p className="text-[12px] text-[#77766F] dark:text-[#A6A69D]">Studio output will be saved here.</p>
              <p className="text-[11px] text-[#A09E96] dark:text-[#777970] mt-1">Generate a summary, timeline or quiz from your sources.</p>
            </div>
          )}
          {studioNotes.map((note) => (
            <div key={note.id} className="group rounded-xl border border-[#E2DED5] dark:border-[#30332B] bg-[#FAF9F5] dark:bg-[#20221E] p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[12px] font-semibold">{note.title}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => copyText(note.content)} className="p-1 rounded-md text-[#A09E96] hover:text-[#176B5B] dark:hover:text-[#38A18C]" title="Copy"><Copy className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setStudioNotes((prev) => prev.filter((n) => n.id !== note.id))} className="p-1 rounded-md text-[#A09E96] hover:text-[#BA1A1A]" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <button onClick={() => setExpandedNote(note)} className="text-left w-full">
                <p className="text-[11.5px] leading-relaxed text-[#4A4B47] dark:text-[#C7C6BE] line-clamp-4 whitespace-pre-wrap">{note.content}</p>
                <span className="text-[10px] font-mono text-[#176B5B] dark:text-[#38A18C] mt-1.5 inline-block">Expand · {note.ts}</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {activeCitation && (
          <CitationDrawer
            citation={activeCitation.citation}
            citationIndex={activeCitation.index}
            onClose={() => setActiveCitation(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {expandedNote && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setExpandedNote(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[80vh] flex flex-col rounded-2xl bg-white dark:bg-[#1C1E1B] border border-[#E2DED5] dark:border-[#30332B] shadow-2xl overflow-hidden"
            >
              <div className="px-5 h-14 flex items-center justify-between border-b border-[#E2DED5] dark:border-[#30332B] shrink-0">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#176B5B] dark:text-[#38A18C]" />
                  <h3 className="text-[15px] font-semibold">{expandedNote.title}</h3>
                  <span className="text-[10px] font-mono text-[#A09E96] dark:text-[#777970]">{expandedNote.ts}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => copyText(expandedNote.content)} className="p-1.5 rounded-lg text-[#A09E96] hover:text-[#176B5B] dark:hover:text-[#38A18C]" title="Copy"><Copy className="w-4 h-4" /></button>
                  <button onClick={() => setExpandedNote(null)} className="p-1.5 rounded-lg text-[#A09E96] hover:text-[#20211F] dark:hover:text-[#ECEAE3]" title="Close"><X className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4 knowledge-prose text-[14px] leading-relaxed">
                <MarkdownMessage content={expandedNote.content} />
                {expandedNote.citations?.length > 0 && (
                  <NotebookLMCitations citations={expandedNote.citations} onSelectCitation={(c, i) => { setExpandedNote(null); setActiveCitation({ citation: c, index: i }) }} />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
