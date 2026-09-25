import { useState } from 'react'
import { logs } from '../data.js'

const tiers = ['ALL', 'INFO', 'WARN', 'ERROR']

export default function Logs() {
  const [tier, setTier] = useState('ALL')
  const rows = logs.filter((l) => tier === 'ALL' || l.tier === tier)
  return (
    <div className="h-full flex flex-col">
      <header className="px-6 h-14 flex items-center justify-between border-b border-hairline bg-panel2">
        <div>
          <h1 className="text-[20px] font-medium tracking-tight">Activity Logs</h1>
          <p className="mono text-[11px] text-muted">TELEMETRY · LOCAL ONLY</p>
        </div>
        <div className="flex gap-1 bg-white border border-hairline rounded p-0.5">
          {tiers.map((t) => (
            <button key={t} onClick={() => setTier(t)}
              className={`h-7 px-2.5 rounded mono text-[11px] tracking-wider transition-colors ${tier === t ? 'bg-petrol-tint text-petrol' : 'text-muted hover:text-ink'}`}>
              {t}
            </button>
          ))}
        </div>
      </header>

      <div className="p-6 overflow-y-auto">
        <div className="panel overflow-hidden">
          {rows.map((l, i) => (
            <div key={l.hash + i} className={`grid grid-cols-[96px_72px_1fr_90px] gap-3 px-4 h-10 items-center mono text-[12px] border-b border-hairline last:border-0 ${i % 2 ? 'bg-panel2/60' : ''}`}>
              <span className="text-muted">{l.t}</span>
              <span className={`chip w-fit ${l.tier === 'ERROR' ? 'text-tertiary border-tertiary/40' : l.tier === 'WARN' ? 'text-tertiary' : 'chip-ok'}`}>{l.tier}</span>
              <span className="truncate">{l.msg}</span>
              <span className="text-faint text-right">{l.hash}</span>
            </div>
          ))}
          {rows.length === 0 && <p className="text-muted text-center py-10">No entries.</p>}
        </div>
      </div>
    </div>
  )
}
