import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Library, Search, LayoutGrid, List, UploadCloud, Plus,
  Download, Trash2, X, Loader2, FileText, RefreshCw,
  ExternalLink, ChevronRight,
} from 'lucide-react'
import {
  listLibraryFiles,
  uploadToLibrary,
  downloadLibraryFile,
  deleteLibraryFile,
  pollDocumentStatus,
} from '../services/api.js'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TYPE_FILTERS = ['All', 'PDF', 'DOCX', 'TXT', 'CSV']

const FILE_STYLES = {
  pdf:  { bg: 'bg-red-500/10',   text: 'text-red-500',   border: 'border-red-500/20',   label: 'PDF'  },
  docx: { bg: 'bg-blue-500/10',  text: 'text-blue-500',  border: 'border-blue-500/20',  label: 'DOCX' },
  txt:  { bg: 'bg-[#176B5B]/10', text: 'text-[#176B5B] dark:text-[#4AF626]', border: 'border-[#176B5B]/20', label: 'TXT' },
  csv:  { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20', label: 'CSV'  },
}

const STATUS_PILL = {
  READY:      { cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  PROCESSING: { cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',       dot: 'bg-amber-500 animate-pulse' },
  PENDING:    { cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',       dot: 'bg-amber-500 animate-pulse' },
  FAILED:     { cls: 'bg-red-500/10 text-red-600 dark:text-red-400',             dot: 'bg-red-500' },
  UNKNOWN:    { cls: 'bg-[#A09E96]/10 text-[#A09E96]',                           dot: 'bg-[#A09E96]' },
}

const SOURCE_BADGE = {
  library:    'bg-[#176B5B]/10 text-[#176B5B] dark:text-[#4AF626]',
  knowledge:  'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  chat:       'bg-blue-500/10 text-blue-600 dark:text-blue-400',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fileStyle(type = '') {
  return FILE_STYLES[type.toLowerCase()] || { bg: 'bg-[#176B5B]/10', text: 'text-[#176B5B] dark:text-[#4AF626]', border: 'border-[#176B5B]/20', label: (type.toUpperCase().slice(0, 4) || 'DOC') }
}

function formatBytes(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso = '') {
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch { return iso }
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatusPill({ status }) {
  const s = STATUS_PILL[status] || STATUS_PILL.UNKNOWN
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  )
}

function FileTypeIcon({ type, size = 'md' }) {
  const st = fileStyle(type)
  const sz = size === 'lg' ? 'w-12 h-12 text-[11px]' : 'w-8 h-8 text-[9px]'
  return (
    <span className={`${sz} rounded-xl ${st.bg} ${st.text} border ${st.border} font-mono font-bold flex items-center justify-center shrink-0`}>
      {st.label}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Slide-over Detail Panel
// ---------------------------------------------------------------------------

function DetailPanel({ file, onClose, onDelete, onNavigate }) {
  const [downloading, setDownloading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const blob = await downloadLibraryFile(file.document_id)
      triggerDownload(blob, file.filename)
    } finally {
      setDownloading(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteLibraryFile(file.document_id)
      onDelete(file.document_id)
      onClose()
    } catch {
      setDeleting(false)
    }
  }

  return (
    <motion.aside
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 36 }}
      className="fixed top-0 right-0 h-full w-[340px] z-40 flex flex-col bg-white dark:bg-[#0D0D0D] border-l border-[#E2DED5] dark:border-[#2A2E27] shadow-2xl"
    >
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#E2DED5] dark:border-[#2A2E27]">
        <h3 className="text-[14px] font-semibold text-[#20211F] dark:text-[#E0E0E0] truncate pr-2">{file.filename}</h3>
        <button onClick={onClose} className="p-1.5 rounded-lg text-[#A09E96] hover:text-[#20211F] dark:hover:text-[#E0E0E0] hover:bg-[#F7F6F2] dark:hover:bg-[#1A1A1A] transition-colors shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {/* Icon + status */}
        <div className="flex items-center gap-4 mb-6">
          <FileTypeIcon type={file.file_type} size="lg" />
          <div>
            <StatusPill status={file.job_status} />
            {file.source && (
              <span className={`ml-2 text-[10px] font-mono px-2 py-0.5 rounded-full ${SOURCE_BADGE[file.source] || SOURCE_BADGE.library}`}>
                {file.source}
              </span>
            )}
          </div>
        </div>

        {/* Metadata table */}
        <div className="space-y-3 text-[13px]">
          {[
            ['Filename',   file.filename],
            ['Type',       file.file_type?.toUpperCase() || '—'],
            ['Size',       formatBytes(file.file_size)],
            ['Pages',      file.page_count || '—'],
            ['Chunks',     file.chunk_count ?? '—'],
            ['Uploaded',   formatDate(file.created_at)],
            ['Document ID', file.document_id],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-2">
              <span className="text-[#A09E96] dark:text-[#666860] shrink-0">{label}</span>
              <span className="text-[#20211F] dark:text-[#E0E0E0] text-right font-mono text-[11px] break-all">{value}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-5 border-t border-[#E2DED5] dark:border-[#2A2E27] flex flex-col gap-2">
          {/* Use in Knowledge Base shortcut */}
          {file.job_status === 'READY' && (
            <button
              onClick={() => onNavigate?.('kb', file)}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#176B5B]/10 hover:bg-[#176B5B]/20 text-[#176B5B] dark:text-[#4AF626] text-[13px] font-medium transition-colors"
            >
              Use in Knowledge Base
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#E2DED5] dark:border-[#2A2E27] text-[13px] text-[#20211F] dark:text-[#E0E0E0] hover:bg-[#F7F6F2] dark:hover:bg-[#1A1A1A] transition-colors disabled:opacity-50"
          >
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Download
          </button>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 text-[13px] transition-colors disabled:opacity-50"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete file
          </button>
        </div>
      </div>
    </motion.aside>
  )
}

// ---------------------------------------------------------------------------
// Grid Card
// ---------------------------------------------------------------------------

function GridCard({ file, onClick, onDownload, onDelete }) {
  const [downloading, setDownloading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      onClick={onClick}
      className="group relative rounded-2xl border border-[#E2DED5] dark:border-[#2A2E27] bg-white dark:bg-[#0D0D0D] p-4 cursor-pointer hover:border-[#176B5B]/40 dark:hover:border-[#38A18C]/40 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <FileTypeIcon type={file.file_type} />
        <StatusPill status={file.job_status} />
      </div>

      <p className="text-[13px] font-semibold truncate text-[#20211F] dark:text-[#E0E0E0] mb-1" title={file.filename}>
        {file.filename}
      </p>
      <p className="text-[10px] font-mono text-[#A09E96] dark:text-[#666860]">
        {formatBytes(file.file_size)} · {formatDate(file.created_at)}
      </p>

      {/* Source badge */}
      {file.source && (
        <span className={`mt-2 inline-block text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-full ${SOURCE_BADGE[file.source] || SOURCE_BADGE.library}`}>
          {file.source}
        </span>
      )}

      {/* Hover action overlay */}
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={async (e) => {
            e.stopPropagation()
            setDownloading(true)
            try {
              const blob = await downloadLibraryFile(file.document_id)
              triggerDownload(blob, file.filename)
            } finally { setDownloading(false) }
          }}
          disabled={downloading}
          className="p-1.5 rounded-lg bg-white dark:bg-[#1A1A1A] border border-[#E2DED5] dark:border-[#2A2E27] text-[#77766F] hover:text-[#176B5B] dark:hover:text-[#4AF626] transition-colors shadow-sm disabled:opacity-50"
          title="Download"
        >
          {downloading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
        </button>
        <button
          onClick={async (e) => {
            e.stopPropagation()
            setDeleting(true)
            try {
              await deleteLibraryFile(file.document_id)
              onDelete(file.document_id)
            } catch { setDeleting(false) }
          }}
          disabled={deleting}
          className="p-1.5 rounded-lg bg-white dark:bg-[#1A1A1A] border border-[#E2DED5] dark:border-[#2A2E27] text-[#77766F] hover:text-red-500 transition-colors shadow-sm disabled:opacity-50"
          title="Delete"
        >
          {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
        </button>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// List Row
// ---------------------------------------------------------------------------

function ListRow({ file, onClick, onDelete }) {
  const [deleting, setDeleting] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      onClick={onClick}
      className="group flex items-center gap-3 px-4 py-3 rounded-xl border border-transparent hover:border-[#E2DED5] dark:hover:border-[#2A2E27] hover:bg-[#FAF9F5] dark:hover:bg-[#0D0D0D] cursor-pointer transition-colors"
    >
      <FileTypeIcon type={file.file_type} />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium truncate text-[#20211F] dark:text-[#E0E0E0]">{file.filename}</p>
        <p className="text-[10px] font-mono text-[#A09E96] dark:text-[#666860]">{formatBytes(file.file_size)} · {file.chunk_count ?? 0} chunks</p>
      </div>
      <StatusPill status={file.job_status} />
      <span className="text-[11px] font-mono text-[#A09E96] dark:text-[#666860] shrink-0 hidden md:block">{formatDate(file.created_at)}</span>
      <button
        onClick={async (e) => {
          e.stopPropagation()
          setDeleting(true)
          try {
            await deleteLibraryFile(file.document_id)
            onDelete(file.document_id)
          } catch { setDeleting(false) }
        }}
        disabled={deleting}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-[#A09E96] hover:text-red-500 transition-all disabled:opacity-40 shrink-0"
        title="Delete"
      >
        {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
      </button>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------

export default function LibraryScreen({ onNavigate }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('vault_lib_view') || 'grid')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [activeFile, setActiveFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const setView = (v) => { setViewMode(v); try { localStorage.setItem('vault_lib_view', v) } catch {} }

  const loadFiles = useCallback(async () => {
    setLoading(true)
    try {
      const res = await listLibraryFiles({
        fileType: typeFilter !== 'All' ? typeFilter.toLowerCase() : '',
        search,
      })
      setFiles(res.files || [])
    } finally {
      setLoading(false)
    }
  }, [typeFilter, search])

  useEffect(() => { loadFiles() }, [loadFiles])

  // Poll PROCESSING files until READY
  useEffect(() => {
    const processing = files.filter((f) => f.job_status === 'PROCESSING' || f.job_status === 'PENDING')
    if (processing.length === 0) return
    const timer = setInterval(async () => {
      try {
        const res = await listLibraryFiles({
          fileType: typeFilter !== 'All' ? typeFilter.toLowerCase() : '',
          search,
        })
        const updated = res.files || []
        setFiles(updated)
        const stillProcessing = updated.some((f) => f.job_status === 'PROCESSING' || f.job_status === 'PENDING')
        if (!stillProcessing) clearInterval(timer)
      } catch {}
    }, 3000)
    return () => clearInterval(timer)
  }, [files, typeFilter, search])

  const handleUpload = async (fileList) => {
    const items = Array.from(fileList || [])
    if (items.length === 0) return
    setUploading(true)
    try {
      await Promise.all(items.map((f) => uploadToLibrary(f, 'library')))
      await loadFiles()
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = (id) => setFiles((prev) => prev.filter((f) => f.document_id !== id))

  const handleNavigate = (target, file) => {
    setActiveFile(null)
    onNavigate?.(target)
  }

  return (
    <div
      className="w-full h-screen flex flex-col bg-[#F7F6F2] dark:bg-[#000000] text-[#20211F] dark:text-[#E0E0E0] font-sans overflow-hidden"
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(false) }}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files) }}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.txt,.csv,.xlsx"
        className="hidden"
        onChange={(e) => { handleUpload(e.target.files); e.target.value = '' }}
      />

      {/* Drag-over overlay */}
      <AnimatePresence>
        {dragOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#176B5B]/20 backdrop-blur-sm pointer-events-none"
          >
            <div className="rounded-2xl border-2 border-dashed border-[#176B5B] px-12 py-10 flex flex-col items-center gap-3 bg-white/80 dark:bg-black/80">
              <UploadCloud className="w-10 h-10 text-[#176B5B] dark:text-[#4AF626]" />
              <p className="text-[15px] font-semibold text-[#176B5B] dark:text-[#4AF626]">Drop to upload</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="px-6 pt-6 pb-4 bg-[#F7F6F2] dark:bg-[#000000] shrink-0">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Library className="w-5 h-5 text-[#176B5B] dark:text-[#4AF626]" />
            <h1 className="text-[22px] font-semibold tracking-tight">Library</h1>
            {!loading && (
              <span className="text-[11px] font-mono bg-[#176B5B]/10 text-[#176B5B] dark:text-[#4AF626] px-2 py-0.5 rounded-full">
                {files.length} file{files.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Refresh */}
            <button
              onClick={loadFiles}
              disabled={loading}
              className="p-2 rounded-xl border border-[#E2DED5] dark:border-[#2A2E27] text-[#77766F] hover:text-[#176B5B] dark:hover:text-[#4AF626] hover:border-[#176B5B]/40 transition-colors disabled:opacity-40"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* View toggle */}
            <div className="flex rounded-xl border border-[#E2DED5] dark:border-[#2A2E27] overflow-hidden">
              {[['grid', LayoutGrid], ['list', List]].map(([v, Icon]) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`p-2 transition-colors ${viewMode === v ? 'bg-[#176B5B] text-white' : 'text-[#77766F] dark:text-[#888888] hover:bg-[#F7F6F2] dark:hover:bg-[#1A1A1A]'}`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>

            {/* Upload button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#176B5B] hover:bg-[#13584B] text-white text-[13px] font-medium transition-colors disabled:opacity-50 shadow-sm"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Upload
            </button>
          </div>
        </div>

        {/* Search + filter row */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A09E96]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files..."
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#E2DED5] dark:border-[#2A2E27] bg-white dark:bg-[#0D0D0D] text-[13px] outline-none focus:border-[#176B5B] dark:focus:border-[#38A18C] transition-colors placeholder:text-[#A09E96]"
            />
          </div>

          <div className="flex gap-1">
            {TYPE_FILTERS.map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-2 rounded-xl text-[12px] font-medium transition-colors ${
                  typeFilter === t
                    ? 'bg-[#176B5B] text-white shadow-sm'
                    : 'text-[#77766F] dark:text-[#888888] border border-[#E2DED5] dark:border-[#2A2E27] hover:border-[#176B5B]/40'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-[#A09E96]">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Library className="w-12 h-12 text-[#A09E96] dark:text-[#888888] mb-4" />
            <h3 className="text-[16px] font-semibold mb-1">
              {search || typeFilter !== 'All' ? 'No matching files' : 'Library is empty'}
            </h3>
            <p className="text-[13px] text-[#77766F] dark:text-[#888888] max-w-sm">
              {search || typeFilter !== 'All'
                ? 'Try a different search or filter.'
                : 'Upload PDFs, DOCX, TXT or CSV files. They will be indexed and available across all screens.'}
            </p>
            {!search && typeFilter === 'All' && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-[#176B5B] text-white text-[13px] font-medium hover:bg-[#13584B] transition-colors"
              >
                <Plus className="w-4 h-4" /> Upload your first file
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 mt-2">
            <AnimatePresence>
              {files.map((f) => (
                <GridCard
                  key={f.document_id}
                  file={f}
                  onClick={() => setActiveFile(f)}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col mt-2 rounded-2xl border border-[#E2DED5] dark:border-[#2A2E27] bg-white dark:bg-[#0D0D0D] divide-y divide-[#F0EDE7] dark:divide-[#1E1E1E] overflow-hidden">
            {/* List header */}
            <div className="flex items-center gap-3 px-4 py-2.5 text-[10px] font-mono uppercase tracking-wider text-[#A09E96] dark:text-[#666860]">
              <span className="w-8" />
              <span className="flex-1">Name</span>
              <span className="w-24 text-center">Status</span>
              <span className="w-20 text-right hidden md:block">Date</span>
              <span className="w-8" />
            </div>
            <AnimatePresence>
              {files.map((f) => (
                <ListRow
                  key={f.document_id}
                  file={f}
                  onClick={() => setActiveFile(f)}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Slide-over detail panel */}
      <AnimatePresence>
        {activeFile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/20 dark:bg-black/40"
              onClick={() => setActiveFile(null)}
            />
            <DetailPanel
              file={activeFile}
              onClose={() => setActiveFile(null)}
              onDelete={handleDelete}
              onNavigate={handleNavigate}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
