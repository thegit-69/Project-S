import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Copy, Trash2, Edit3, Save, X, Download, Pin,
  ChevronDown, ChevronUp, FileText, FileDown,
} from 'lucide-react'
import MarkdownMessage from './MarkdownMessage.jsx'
import NotebookLMCitations from './NotebookLMCitations.jsx'
import { exportStudioNote } from '../services/api.js'

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function safeName(title) {
  return title.replace(/[^a-z0-9\s_-]/gi, '').replace(/\s+/g, '_').toLowerCase() || 'note'
}

/**
 * StudioNote — a single, fully self-contained Studio Notebook card.
 *
 * Props:
 *   note            { id, title, content, citations, ts, source }
 *   onDelete        (id) => void
 *   onUpdate        (id, newContent) => void
 *   onCitationClick (citation, index) => void
 */
export default function StudioNote({ note, onDelete, onUpdate, onCitationClick }) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [exportMenuOpen, setExportMenuOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [copied, setCopied] = useState(false)
  const exportMenuRef = useRef(null)
  const textareaRef = useRef(null)

  // Close export menu on outside click
  useEffect(() => {
    if (!exportMenuOpen) return
    const handler = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setExportMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [exportMenuOpen])

  // Focus textarea when entering edit mode
  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.selectionStart = textareaRef.current.value.length
    }
  }, [editing])

  const startEdit = () => {
    setEditContent(note.content)
    setEditing(true)
    if (!expanded) setExpanded(true)
  }

  const saveEdit = () => {
    if (editContent.trim() !== note.content) {
      onUpdate(note.id, editContent.trim())
    }
    setEditing(false)
  }

  const cancelEdit = () => {
    setEditing(false)
    setEditContent('')
  }

  const handleCopy = () => {
    navigator.clipboard?.writeText(note.content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  const handleExport = async (format) => {
    setExportMenuOpen(false)
    if (format === 'md') {
      const blob = new Blob([note.content], { type: 'text/markdown' })
      downloadBlob(blob, `${safeName(note.title)}.md`)
      return
    }
    if (format === 'txt') {
      const blob = new Blob([note.content], { type: 'text/plain' })
      downloadBlob(blob, `${safeName(note.title)}.txt`)
      return
    }
    if (format === 'docx') {
      setExporting(true)
      try {
        const blob = await exportStudioNote(note)
        downloadBlob(blob, `${safeName(note.title)}.docx`)
      } catch (err) {
        console.error('[StudioNote] DOCX export failed:', err)
      } finally {
        setExporting(false)
      }
    }
  }

  const previewText = note.content.slice(0, 180).replace(/#+\s/g, '').replace(/\*\*/g, '')

  return (
    <div className="group rounded-xl border border-[#E2DED5] dark:border-[#2A2E27] bg-[#FAF9F5] dark:bg-[#161A14] overflow-hidden transition-colors">
      {/* Header */}
      <div className="flex items-start gap-2 px-3 pt-3 pb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            {note.source === 'pin' && (
              <Pin className="w-2.5 h-2.5 text-[#176B5B] dark:text-[#4AF626] shrink-0" />
            )}
            <p className="text-[12.5px] font-semibold truncate text-[#20211F] dark:text-[#E0E0E0]">
              {note.title}
            </p>
          </div>
          <p className="text-[10px] font-mono text-[#A09E96] dark:text-[#666860]">{note.ts}</p>
        </div>

        {/* Action buttons — always visible on hover */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={handleCopy}
            title="Copy content"
            className="p-1 rounded-md text-[#A09E96] hover:text-[#176B5B] dark:hover:text-[#4AF626] transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={startEdit}
            title="Edit note"
            className="p-1 rounded-md text-[#A09E96] hover:text-[#176B5B] dark:hover:text-[#4AF626] transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          {/* Export dropdown */}
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setExportMenuOpen((v) => !v)}
              title="Export"
              disabled={exporting}
              className="p-1 rounded-md text-[#A09E96] hover:text-[#176B5B] dark:hover:text-[#4AF626] transition-colors disabled:opacity-40"
            >
              <FileDown className="w-3.5 h-3.5" />
            </button>
            <AnimatePresence>
              {exportMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.96 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full mt-1 z-30 w-36 rounded-xl border border-[#E2DED5] dark:border-[#2A2E27] bg-white dark:bg-[#0D0D0D] shadow-xl overflow-hidden"
                >
                  {[
                    { fmt: 'md', label: 'Markdown (.md)', Icon: FileText },
                    { fmt: 'txt', label: 'Plain text (.txt)', Icon: FileText },
                    { fmt: 'docx', label: 'Word (.docx)', Icon: FileDown },
                  ].map(({ fmt, label, Icon }) => (
                    <button
                      key={fmt}
                      onClick={() => handleExport(fmt)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[11.5px] text-[#20211F] dark:text-[#C7C6BE] hover:bg-[#F1F7F5] dark:hover:bg-[#16211D] transition-colors"
                    >
                      <Icon className="w-3.5 h-3.5 text-[#176B5B] dark:text-[#4AF626]" />
                      {label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => onDelete(note.id)}
            title="Delete note"
            className="p-1 rounded-md text-[#A09E96] hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Copy feedback */}
      {copied && (
        <p className="px-3 text-[10px] font-mono text-[#176B5B] dark:text-[#4AF626] -mt-1 mb-1">
          Copied
        </p>
      )}

      {/* Content */}
      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3">
              {editing ? (
                <>
                  <textarea
                    ref={textareaRef}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full min-h-[200px] max-h-[50vh] resize-y rounded-lg border border-[#E2DED5] dark:border-[#2A2E27] bg-white dark:bg-[#0D0D0D] px-3 py-2.5 text-[13px] font-mono leading-relaxed text-[#20211F] dark:text-[#E0E0E0] outline-none focus:border-[#176B5B] dark:focus:border-[#38A18C] transition-colors"
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={saveEdit}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#176B5B] hover:bg-[#13584B] text-white text-[12px] font-medium transition-colors"
                    >
                      <Save className="w-3.5 h-3.5" /> Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2DED5] dark:border-[#2A2E27] text-[#77766F] dark:text-[#888888] text-[12px] transition-colors hover:border-[#A09E96]"
                    >
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-[13px] leading-relaxed knowledge-prose">
                    <MarkdownMessage content={note.content} />
                  </div>
                  {note.citations?.length > 0 && (
                    <NotebookLMCitations
                      citations={note.citations}
                      onSelectCitation={(c, i) => onCitationClick?.(c, i)}
                    />
                  )}
                </>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          >
            <p className="px-3 pb-3 text-[11.5px] leading-relaxed text-[#4A4B47] dark:text-[#888880] line-clamp-3">
              {previewText}
              {note.content.length > 180 && '...'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expand / collapse toggle */}
      <button
        onClick={() => {
          if (expanded && editing) return
          setExpanded((v) => !v)
        }}
        className="w-full flex items-center justify-center gap-1 py-1.5 border-t border-[#E2DED5] dark:border-[#2A2E27] text-[10px] font-mono text-[#A09E96] dark:text-[#666860] hover:text-[#176B5B] dark:hover:text-[#4AF626] hover:bg-[#F1F7F5] dark:hover:bg-[#16211D] transition-colors"
      >
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {expanded ? 'Collapse' : 'Expand'}
      </button>
    </div>
  )
}
