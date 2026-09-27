import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Library, Search, Check, Loader2, FileText, UploadCloud } from 'lucide-react'
import { listLibraryFiles, pollDocumentStatus } from '../services/api.js'

const TYPE_FILTERS = ['All', 'PDF', 'DOCX', 'TXT', 'CSV']

const FILE_ICONS = {
  pdf:  { bg: 'bg-red-500/10 dark:bg-red-500/20',   text: 'text-red-500',   label: 'PDF'  },
  docx: { bg: 'bg-blue-500/10 dark:bg-blue-500/20', text: 'text-blue-500',  label: 'DOCX' },
  txt:  { bg: 'bg-[#176B5B]/10 dark:bg-[#176B5B]/20', text: 'text-[#176B5B] dark:text-[#4AF626]', label: 'TXT' },
  csv:  { bg: 'bg-amber-500/10 dark:bg-amber-500/20', text: 'text-amber-500', label: 'CSV' },
}

function fileIcon(type = '') {
  return FILE_ICONS[type.toLowerCase()] || { bg: 'bg-[#176B5B]/10', text: 'text-[#176B5B] dark:text-[#4AF626]', label: (type.toUpperCase().slice(0, 4) || 'DOC') }
}

function formatBytes(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const STATUS_PILL = {
  READY:      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  PROCESSING: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  PENDING:    'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  FAILED:     'bg-red-500/10 text-red-600 dark:text-red-400',
  UNKNOWN:    'bg-[#A09E96]/10 text-[#A09E96]',
}

/**
 * LibraryFilePicker — two-tab modal for adding documents in /chat and /knowledge.
 *
 * Tab 1: Upload new file (drag-drop / file input)
 * Tab 2: Pick from Library (shows only READY files)
 *
 * onSelect: (items: Array<{ document_id, filename, file_type, chunk_count, file?, already_indexed: boolean }>) => void
 */
export default function LibraryFilePicker({ open, onClose, onSelect, source = 'knowledge' }) {
  const [tab, setTab] = useState('upload')          // 'upload' | 'library'
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [libFiles, setLibFiles] = useState([])
  const [libLoading, setLibLoading] = useState(false)
  const [selected, setSelected] = useState(new Set())
  const [dragOver, setDragOver] = useState(false)
  const [uploadQueue, setUploadQueue] = useState([])  // [{ file, id }] staged for upload-tab
  const fileInputRef = useRef(null)

  // Load library files when the Library tab is opened
  useEffect(() => {
    if (tab !== 'library' || !open) return
    setLibLoading(true)
    listLibraryFiles({
      fileType: typeFilter !== 'All' ? typeFilter.toLowerCase() : '',
      search,
    })
      .then((res) => setLibFiles(res.files || []))
      .catch(() => setLibFiles([]))
      .finally(() => setLibLoading(false))
  }, [tab, open, typeFilter, search])

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setTab('upload')
      setSearch('')
      setTypeFilter('All')
      setSelected(new Set())
      setUploadQueue([])
    }
  }, [open])

  const toggleSelect = (id) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  // Upload tab: add files to queue (they will be submitted when user clicks Use)
  const addToQueue = useCallback((fileList) => {
    const files = Array.from(fileList || [])
    const items = files.map((f) => ({ file: f, id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }))
    setUploadQueue((prev) => [...prev, ...items])
  }, [])

  const removeFromQueue = (id) => setUploadQueue((prev) => prev.filter((i) => i.id !== id))

  // Confirm selection / upload
  const handleConfirm = () => {
    if (tab === 'library') {
      const picks = libFiles
        .filter((f) => selected.has(f.document_id))
        .map((f) => ({
          document_id: f.document_id,
          filename: f.filename,
          file_type: f.file_type,
          chunk_count: f.chunk_count,
          already_indexed: true,
        }))
      onSelect(picks)
      onClose()
    } else {
      // Upload tab — pass raw File objects; caller handles upload
      const picks = uploadQueue.map((item) => ({
        file: item.file,
        filename: item.file.name,
        already_indexed: false,
      }))
      onSelect(picks)
      onClose()
    }
  }

  const readyFiles = libFiles.filter((f) => f.job_status === 'READY')
  const confirmDisabled =
    tab === 'library' ? selected.size === 0 : uploadQueue.length === 0

  if (!open) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-lg rounded-2xl border border-[#E2DED5] dark:border-[#2A2E27] bg-white dark:bg-[#0D0D0D] shadow-2xl overflow-hidden flex flex-col"
          style={{ maxHeight: '80vh' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-4 shrink-0">
            <h2 className="text-[16px] font-semibold text-[#20211F] dark:text-[#E0E0E0]">Add Document</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg text-[#A09E96] hover:text-[#20211F] dark:hover:text-[#E0E0E0] hover:bg-[#F7F6F2] dark:hover:bg-[#1A1A1A] transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 px-5 pb-4 shrink-0">
            {[
              { id: 'upload',  label: 'Upload new',    Icon: Upload },
              { id: 'library', label: 'From Library',  Icon: Library },
            ].map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors ${
                  tab === id
                    ? 'bg-[#176B5B] text-white'
                    : 'text-[#77766F] dark:text-[#888888] hover:bg-[#F7F6F2] dark:hover:bg-[#1A1A1A]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 pb-2 min-h-0">
            {tab === 'upload' ? (
              <div className="flex flex-col gap-3">
                {/* Drop zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); addToQueue(e.dataTransfer.files) }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`rounded-xl border-2 border-dashed px-4 py-8 flex flex-col items-center gap-2 cursor-pointer transition-colors ${
                    dragOver
                      ? 'border-[#176B5B] bg-[#F1F7F5] dark:bg-[#16211D]'
                      : 'border-[#E2DED5] dark:border-[#2A2E27] hover:border-[#176B5B]/60 hover:bg-[#F7F6F2] dark:hover:bg-[#1A1A1A]'
                  }`}
                >
                  <UploadCloud className="w-8 h-8 text-[#A09E96] dark:text-[#888888]" />
                  <p className="text-[13px] text-[#77766F] dark:text-[#888888] text-center">
                    Drop files here or click to browse
                    <br />
                    <span className="text-[11px] font-mono">PDF, DOCX, TXT, CSV up to 50 MB</span>
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.docx,.txt,.csv,.xlsx"
                  className="hidden"
                  onChange={(e) => { addToQueue(e.target.files); e.target.value = '' }}
                />

                {/* Queued files */}
                {uploadQueue.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    {uploadQueue.map((item) => {
                      const ext = item.file.name.split('.').pop()
                      const ic = fileIcon(ext)
                      return (
                        <div key={item.id} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#F7F6F2] dark:bg-[#1A1A1A] border border-[#E2DED5] dark:border-[#2A2E27]">
                          <span className={`w-7 h-7 rounded-md ${ic.bg} ${ic.text} text-[9px] font-mono font-bold flex items-center justify-center shrink-0`}>
                            {ic.label}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12.5px] font-medium truncate text-[#20211F] dark:text-[#E0E0E0]">{item.file.name}</p>
                            <p className="text-[10px] font-mono text-[#A09E96]">{formatBytes(item.file.size)}</p>
                          </div>
                          <button onClick={() => removeFromQueue(item.id)} className="text-[#A09E96] hover:text-red-500 transition-colors shrink-0">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* Library tab */
              <div className="flex flex-col gap-3">
                {/* Search + type filter */}
                <div className="flex flex-col gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A09E96]" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search files..."
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#E2DED5] dark:border-[#2A2E27] bg-[#FAF9F5] dark:bg-[#1A1A1A] text-[13px] outline-none focus:border-[#176B5B] dark:focus:border-[#38A18C] transition-colors text-[#20211F] dark:text-[#E0E0E0] placeholder:text-[#A09E96]"
                    />
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {TYPE_FILTERS.map((t) => (
                      <button
                        key={t}
                        onClick={() => setTypeFilter(t)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                          typeFilter === t
                            ? 'bg-[#176B5B] text-white'
                            : 'text-[#77766F] dark:text-[#888888] border border-[#E2DED5] dark:border-[#2A2E27] hover:border-[#176B5B]/50'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* File list */}
                {libLoading ? (
                  <div className="flex items-center justify-center py-10 text-[#A09E96]">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                ) : readyFiles.length === 0 ? (
                  <div className="flex flex-col items-center py-10 text-center">
                    <Library className="w-8 h-8 text-[#A09E96] dark:text-[#888888] mb-2" />
                    <p className="text-[12px] text-[#77766F] dark:text-[#888888]">
                      {libFiles.length === 0 ? 'No files in library yet.' : 'No indexed files match your search.'}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {readyFiles.map((f) => {
                      const ic = fileIcon(f.file_type)
                      const sel = selected.has(f.document_id)
                      return (
                        <button
                          key={f.document_id}
                          onClick={() => toggleSelect(f.document_id)}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors ${
                            sel
                              ? 'bg-[#F1F7F5] dark:bg-[#16211D] border-[#CDE5DD] dark:border-[#2A4A3A]'
                              : 'bg-transparent border-[#E2DED5] dark:border-[#2A2E27] hover:bg-[#F7F6F2] dark:hover:bg-[#1A1A1A]'
                          }`}
                        >
                          {/* Checkbox */}
                          <span className={`w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0 transition-colors ${
                            sel ? 'bg-[#176B5B] border-[#176B5B]' : 'border-[#C7C3B9] dark:border-[#4A4D43]'
                          }`}>
                            {sel && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                          </span>

                          {/* Icon */}
                          <span className={`w-7 h-7 rounded-md ${ic.bg} ${ic.text} text-[9px] font-mono font-bold flex items-center justify-center shrink-0`}>
                            {ic.label}
                          </span>

                          {/* Name + meta */}
                          <div className="flex-1 min-w-0">
                            <p className="text-[12.5px] font-medium truncate text-[#20211F] dark:text-[#E0E0E0]">{f.filename}</p>
                            <p className="text-[10px] font-mono text-[#A09E96] dark:text-[#666860]">
                              {formatBytes(f.file_size)} · {f.chunk_count} chunks
                            </p>
                          </div>

                          {/* Status */}
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 ${STATUS_PILL[f.job_status] || STATUS_PILL.UNKNOWN}`}>
                            {f.job_status}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 px-5 pt-3 pb-5 shrink-0 border-t border-[#E2DED5] dark:border-[#2A2E27] mt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#E2DED5] dark:border-[#2A2E27] text-[13px] text-[#77766F] dark:text-[#888888] hover:border-[#A09E96] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={confirmDisabled}
              className="px-4 py-2 rounded-xl bg-[#176B5B] hover:bg-[#13584B] text-white text-[13px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {tab === 'library'
                ? selected.size > 0 ? `Use selected (${selected.size})` : 'Use selected'
                : uploadQueue.length > 0 ? `Upload ${uploadQueue.length} file${uploadQueue.length > 1 ? 's' : ''}` : 'Upload'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
