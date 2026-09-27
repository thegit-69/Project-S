import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Markdown } from 'tiptap-markdown'
import {
  Bold, Italic, Heading1, Heading2, List, ListOrdered, Code, Quote,
  Copy, Check, Trash2, FileDown, FileText,
} from 'lucide-react'
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
  return (title || '').replace(/[^a-z0-9\s_-]/gi, '').replace(/\s+/g, '_').toLowerCase() || 'artifact'
}

/**
 * StudioArtifactEditor — a single focused WYSIWYG editor for the active Studio
 * artifact. Content is stored as markdown so DOCX export and citation handling
 * stay compatible with the rest of the app.
 *
 * Props:
 *   artifact         { id, title, content, citations, ... } | null
 *   onUpdate         (id, { content }) => void
 *   onRename         (id, title) => void
 *   onDelete         (id) => void
 *   onCitationClick  (citation, index) => void
 */
export default function StudioArtifactEditor({ artifact, onUpdate, onRename, onDelete, onCitationClick }) {
  const [exportMenuOpen, setExportMenuOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [copied, setCopied] = useState(false)
  const exportMenuRef = useRef(null)
  const debounceRef = useRef(null)
  // Tracks the last markdown we synced to/from the editor to avoid feedback loops.
  const lastSyncRef = useRef({ id: null, content: null })

  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown.configure({ html: false, transformPastedText: true, breaks: true }),
    ],
    content: artifact?.content || '',
    editorProps: {
      attributes: {
        class:
          'vault-prose focus:outline-none min-h-[200px] text-[13px] leading-relaxed text-[#20211F] dark:text-[#E0E0E0]',
      },
    },
    onUpdate: ({ editor }) => {
      if (!artifact) return
      const md = editor.storage.markdown.getMarkdown()
      lastSyncRef.current = { id: artifact.id, content: md }
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => onUpdate(artifact.id, { content: md }), 400)
    },
  })

  // Push external content changes (artifact switch or appended output) into the
  // editor — but skip changes that originated from our own onUpdate above.
  useEffect(() => {
    if (!editor || !artifact) return
    const { id, content } = lastSyncRef.current
    const isSelfEdit = id === artifact.id && content === artifact.content
    if (!isSelfEdit) {
      editor.commands.setContent(artifact.content || '')
      lastSyncRef.current = { id: artifact.id, content: artifact.content || '' }
    }
  }, [editor, artifact?.id, artifact?.content])

  // Close export menu on outside click.
  useEffect(() => {
    if (!exportMenuOpen) return
    const handler = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) setExportMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [exportMenuOpen])

  const handleCopy = useCallback(() => {
    if (!artifact) return
    navigator.clipboard?.writeText(artifact.content || '').then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }, [artifact])

  const handleExport = async (format) => {
    setExportMenuOpen(false)
    if (!artifact) return
    if (format === 'md' || format === 'txt') {
      const blob = new Blob([artifact.content || ''], {
        type: format === 'md' ? 'text/markdown' : 'text/plain',
      })
      downloadBlob(blob, `${safeName(artifact.title)}.${format}`)
      return
    }
    if (format === 'docx') {
      setExporting(true)
      try {
        const blob = await exportStudioNote({ title: artifact.title, content: artifact.content || '' })
        downloadBlob(blob, `${safeName(artifact.title)}.docx`)
      } catch (err) {
        console.error('[StudioArtifactEditor] DOCX export failed:', err)
      } finally {
        setExporting(false)
      }
    }
  }

  if (!artifact) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 text-center">
        <div>
          <p className="text-[12px] text-[#77766F] dark:text-[#888888]">No artifact open.</p>
          <p className="text-[11px] text-[#A09E96] dark:text-[#666860] mt-1">
            Create one or run a Studio action to start building a document.
          </p>
        </div>
      </div>
    )
  }

  const tbBtn = (active) =>
    `p-1.5 rounded-md transition-colors ${
      active
        ? 'bg-[#176B5B]/12 text-[#176B5B] dark:bg-[#4AF626]/15 dark:text-[#4AF626]'
        : 'text-[#A09E96] hover:text-[#176B5B] dark:hover:text-[#4AF626]'
    }`

  const tools = editor
    ? [
        { Icon: Bold, on: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold'), title: 'Bold' },
        { Icon: Italic, on: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic'), title: 'Italic' },
        { Icon: Heading1, on: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive('heading', { level: 1 }), title: 'Heading 1' },
        { Icon: Heading2, on: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }), title: 'Heading 2' },
        { Icon: List, on: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList'), title: 'Bullet list' },
        { Icon: ListOrdered, on: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList'), title: 'Numbered list' },
        { Icon: Quote, on: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote'), title: 'Quote' },
        { Icon: Code, on: () => editor.chain().focus().toggleCodeBlock().run(), active: editor.isActive('codeBlock'), title: 'Code block' },
      ]
    : []

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Title + actions */}
      <div className="flex items-center gap-2 px-1 pb-2">
        <input
          value={artifact.title}
          onChange={(e) => onRename(artifact.id, e.target.value)}
          placeholder="Untitled artifact"
          className="flex-1 min-w-0 bg-transparent text-[14px] font-semibold text-[#20211F] dark:text-[#E0E0E0] focus:outline-none placeholder:text-[#A09E96]"
        />
        <button onClick={handleCopy} title="Copy markdown" className="p-1 rounded-md text-[#A09E96] hover:text-[#176B5B] dark:hover:text-[#4AF626] transition-colors">
          {copied ? <Check className="w-3.5 h-3.5 text-[#176B5B] dark:text-[#4AF626]" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
        <div className="relative" ref={exportMenuRef}>
          <button onClick={() => setExportMenuOpen((v) => !v)} disabled={exporting} title="Export" className="p-1 rounded-md text-[#A09E96] hover:text-[#176B5B] dark:hover:text-[#4AF626] transition-colors disabled:opacity-40">
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
                  <button key={fmt} onClick={() => handleExport(fmt)} className="w-full flex items-center gap-2 px-3 py-2 text-[11.5px] text-[#20211F] dark:text-[#C7C6BE] hover:bg-[#F1F7F5] dark:hover:bg-[#16211D] transition-colors">
                    <Icon className="w-3.5 h-3.5 text-[#176B5B] dark:text-[#4AF626]" />
                    {label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button onClick={() => onDelete(artifact.id)} title="Delete artifact" className="p-1 rounded-md text-[#A09E96] hover:text-red-500 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-0.5 flex-wrap border-y border-[#E2DED5] dark:border-[#2A2E27] py-1 px-0.5 mb-2">
        {tools.map(({ Icon, on, active, title }) => (
          <button key={title} type="button" onMouseDown={(e) => { e.preventDefault(); on() }} title={title} className={tbBtn(active)}>
            <Icon className="w-3.5 h-3.5" />
          </button>
        ))}
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto min-h-0 px-0.5">
        <EditorContent editor={editor} />
      </div>

      {/* Citations for this artifact */}
      {artifact.citations?.length > 0 && (
        <div className="pt-2 mt-2 border-t border-[#E2DED5] dark:border-[#2A2E27]">
          <NotebookLMCitations citations={artifact.citations} onSelectCitation={onCitationClick} />
        </div>
      )}
    </div>
  )
}

