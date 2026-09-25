import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, FileText } from 'lucide-react'
import { documents } from '../data.js'

export default function Knowledge() {
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(documents[1])
  const list = useMemo(
    () => documents.filter((d) => (d.name + d.excerpt).toLowerCase().includes(q.toLowerCase())),
    [q]
  )
  return (
    <div className="h-full flex flex-col">
      <header className="px-6 h-14 flex items-center justify-between border-b border-hairline bg-panel2">
        <div>
          <h1 className="text-[20px] font-medium tracking-tight">Knowledge Base</h1>
          <p className="mono text-[11px] text-muted">LOCAL INDEX · {documents.length} DOCUMENTS · 0 EXTERNAL</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-faint" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search SOPs, manuals, correspondence" className="input pl-8 w-72" />
        </div>
      </header>

      <div className="flex-1 grid grid-cols-[minmax(0,1fr)_340px] gap-px bg-hairline min-h-0">
        <div className="bg-canvas overflow-y-auto p-6 space-y-2">
          {list.map((d, i) => (
            <motion.button
              key={d.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setSel(d)}
              className={`w-full text-left panel p-4 flex gap-3 items-start transition-colors hover:border-petrol/50 ${sel?.id === d.id ? 'bg-petrol-subtle border-petrol' : ''}`}
            >
              <FileText size={18} className="text-petrol mt-0.5 shrink-0" strokeWidth={1.75} />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{d.name}</span>
                  <span className="chip">{d.kind}</span>
                </div>
                <p className="text-muted mt-1 line-clamp-2">{d.excerpt}</p>
                <p className="mono text-[11px] text-faint mt-2">{d.pages} pages · updated {d.updated}</p>
              </div>
            </motion.button>
          ))}
          {list.length === 0 && <p className="text-muted text-center py-12">No documents match “{q}”.</p>}
        </div>

        <aside className="bg-white p-6 overflow-y-auto">
          {sel && (
            <motion.div key={sel.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="mono text-[11px] text-muted uppercase tracking-wider mb-2">Selected source</p>
              <h2 className="text-[16px] font-semibold mb-3">{sel.name}</h2>
              <p className="text-[14px] leading-6 border-l-2 border-petrol pl-3 text-ink">{sel.excerpt}</p>
              <div className="mt-6 flex gap-2">
                <span className="chip chip-ok">Indexed</span>
                <span className="chip">{sel.pages} pp.</span>
              </div>
            </motion.div>
          )}
        </aside>
      </div>
    </div>
  )
}
