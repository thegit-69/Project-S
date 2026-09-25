import { useState } from 'react'
import { motion } from 'framer-motion'
import { models as initial } from '../data.js'

export default function Models() {
  const [models, setModels] = useState(initial)
  const toggle = (id) =>
    setModels((ms) => ms.map((m) => (m.id === id ? { ...m, status: m.status === 'Loaded' ? 'Idle' : 'Loaded' } : m)))

  return (
    <div className="h-full flex flex-col">
      <header className="px-6 h-14 flex items-center justify-between border-b border-hairline bg-panel2">
        <div>
          <h1 className="text-[20px] font-medium tracking-tight">Models Registry</h1>
          <p className="mono text-[11px] text-muted">{models.length} WEIGHTS REGISTERED · AUTO-ROUTING ON</p>
        </div>
        <span className="chip chip-ok">Verified · local</span>
      </header>

      <div className="p-6 overflow-y-auto grid gap-3 content-start">
        {models.map((m, i) => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="panel px-5 py-4 grid grid-cols-[1fr_auto] items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{m.name}</span>
                <span className={`chip ${m.status === 'Loaded' ? 'chip-ok' : ''}`}>{m.status}</span>
              </div>
              <p className="mono text-[12px] text-muted mt-1">{m.params} params · ctx {m.ctx}</p>
              <div className="flex gap-1.5 mt-2">
                {m.tasks.map((t) => <span key={t} className="chip">{t}</span>)}
              </div>
            </div>
            <button onClick={() => toggle(m.id)} className="btn-ghost border border-hairline bg-white">
              {m.status === 'Loaded' ? 'Unload' : 'Load'}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
