import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp, Paperclip, Copy, Download } from 'lucide-react'

const seed = [
  { role: 'user', time: '14:28', text: 'Review the inspection report and identify the findings that require immediate action.' },
  {
    role: 'ai', time: '14:28:12', text: 'Three findings require immediate attention.',
    items: [
      ['Pressure anomaly detected', 'on Feedwater Pump 2B casing during cycle transition. Ultrasonic readings exceed baseline thresholds by 18.4%.', 'p.14'],
      ['Corrosion identified', 'in Secondary Heat Exchanger bypass flange weld seam. Wall thickness 3.2mm vs 4.0mm required.', 'p.22'],
      ['Inspection interval exceeded', 'for Turbine Isolation Relief Valve VR-408 by 42 days. Re-calibration required before high-load startup.', 'p.31'],
    ],
    note: 'Recommendation: issue maintenance work orders for Pump 2B and Valve VR-408 before cycle 08 commencement.',
  },
]

const quick = ['Analyze document', 'Search knowledge', 'Write code']

export default function Chat() {
  const [messages, setMessages] = useState(seed)
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const endRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, busy])

  const send = (text) => {
    const q = (text ?? input).trim()
    if (!q || busy) return
    setInput('')
    setMessages((m) => [...m, { role: 'user', time: now(), text: q }])
    setBusy(true)
    setTimeout(() => {
      setMessages((m) => [...m, {
        role: 'ai', time: now(),
        text: 'Request processed on the local enclave. Output is ready for review; no external calls were made.',
      }])
      setBusy(false)
    }, 1400)
  }

  return (
    <div className="h-full flex flex-col">
      <header className="h-11 flex items-center justify-center border-b border-hairline bg-canvas">
        <span className="mono text-[11px] tracking-wider text-muted">SESSION #4821-C · AIR-GAPPED ENCLAVE · LLAMA-3-70B-SOVEREIGN</span>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[760px] mx-auto px-6 py-8 space-y-8">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                <div className="mono text-[11px] text-muted mb-2 uppercase tracking-wider">
                  {m.role === 'user' ? 'Operator' : 'Vault'} <span className="ml-1 text-faint">{m.time}</span>
                </div>
                {m.role === 'user' ? (
                  <p className="text-[15px] leading-6">{m.text}</p>
                ) : (
                  <div className="space-y-3">
                    <p className="text-[15px] font-semibold leading-6">{m.text}</p>
                    {m.items && (
                      <ol className="space-y-3">
                        {m.items.map(([head, body, page], j) => (
                          <li key={j} className="flex gap-3 text-[15px] leading-6">
                            <span className="mono text-[12px] text-muted pt-1 w-4">{j + 1}.</span>
                            <div>
                              <b className="font-semibold">{head}</b> {body}
                              <span className="ml-2 chip chip-ok normal-case tracking-normal">Inspection_Report.pdf · {page}</span>
                            </div>
                          </li>
                        ))}
                      </ol>
                    )}
                    {m.note && <p className="text-muted border-t border-hairline pt-3">{m.note}</p>}
                    <div className="flex gap-1 pt-1">
                      <button className="btn-ghost h-6 px-1.5"><Copy size={13} /></button>
                      <button className="btn-ghost h-6 px-1.5"><Download size={13} /></button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {busy && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mono text-[12px] text-muted flex items-center gap-2">
              <motion.span className="w-2 h-2 rounded-full bg-petrol" animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1 }} />
              Reading inspection_report.pdf · Searching local knowledge · Preparing response
            </motion.div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      <div className="px-6 pb-5 pt-2 bg-canvas">
        <div className="max-w-[760px] mx-auto panel p-3 shadow-[0_1px_3px_rgba(32,35,31,0.04),0_8px_16px_-4px_rgba(32,35,31,0.06)]">
          <div className="flex items-center gap-2 mb-3 text-[12px] text-muted">
            Quick actions:
            {quick.map((q) => (
              <button key={q} onClick={() => send(q)} className="hover:text-petrol transition-colors">{q}</button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Ask Vault…"
              className="input flex-1 h-10 text-[14px]"
            />
            <button className="btn-ghost h-10 w-10 justify-center"><Paperclip size={16} /></button>
            <button onClick={() => send()} disabled={!input.trim() || busy} className="btn-primary h-10 w-10 justify-center p-0 rounded-full">
              <ArrowUp size={16} />
            </button>
          </div>
        </div>
        <p className="text-center mono text-[11px] text-faint mt-3">Sovereign on-premise execution · Zero external telemetry</p>
      </div>
    </div>
  )
}

const now = () => new Date().toTimeString().slice(0, 8)
