import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, RotateCcw } from 'lucide-react'

const START = `def pump_margin(wall_mm, required_mm=4.0):
    return round(wall_mm - required_mm, 2)

print(pump_margin(3.2))`

export default function Code() {
  const [code, setCode] = useState(START)
  const [out, setOut] = useState([])
  const [running, setRunning] = useState(false)

  const run = () => {
    setRunning(true)
    setOut([])
    const lines = ['$ python sandbox.py', '-0.8', 'exit 0 · 38 ms']
    lines.forEach((l, i) => setTimeout(() => {
      setOut((o) => [...o, l])
      if (i === lines.length - 1) setRunning(false)
    }, 400 * (i + 1)))
  }

  return (
    <div className="h-full flex flex-col">
      <header className="px-6 h-14 flex items-center justify-between border-b border-hairline bg-panel2">
        <div>
          <h1 className="text-[20px] font-medium tracking-tight">Code Studio</h1>
          <p className="mono text-[11px] text-muted">SANDBOX · PYTHON 3.11 · NO NETWORK</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost" onClick={() => { setCode(START); setOut([]) }}><RotateCcw size={14} /> Reset</button>
          <button className="btn-primary" onClick={run} disabled={running}><Play size={14} /> Run</button>
        </div>
      </header>

      <div className="flex-1 grid grid-rows-[minmax(0,1fr)_200px] gap-2 p-4 min-h-0">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="panel p-4 mono text-[13px] leading-6 resize-none outline-none focus:border-petrol"
        />
        <div className="panel overflow-hidden flex flex-col">
          <div className="h-8 px-3 flex items-center bg-panel2 border-b border-hairline mono text-[11px] text-muted uppercase tracking-wider">Output</div>
          <div className="p-3 mono text-[12px] leading-5 overflow-y-auto">
            <AnimatePresence>
              {out.map((l, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                  className={l.startsWith('exit') ? 'text-petrol' : l.startsWith('$') ? 'text-muted' : ''}>
                  {l}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
