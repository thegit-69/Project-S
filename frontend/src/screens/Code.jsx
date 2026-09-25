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
      <header className="px-6 h-14 flex items-center justify-between border-b border-outline-variant bg-surface">
        <div>
          <h1 className="text-[20px] font-medium tracking-tight">Code Studio</h1>
          <p className="mono text-[11px] text-on-surface-variant">SANDBOX · PYTHON 3.11 · NO NETWORK</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 h-8 px-2.5 rounded text-on-surface-variant text-[13px] hover:bg-surface hover:text-on-surface transition-colors" onClick={() => { setCode(START); setOut([]) }}><RotateCcw size={14} /> Reset</button>
          <button className="flex items-center gap-1.5 h-8 px-3 rounded bg-primary text-white text-[13px] font-medium hover:bg-primary-hover transition-colors disabled:opacity-40" onClick={run} disabled={running}><Play size={14} /> Run</button>
        </div>
      </header>

      <div className="flex-1 grid grid-rows-[minmax(0,1fr)_200px] gap-2 p-4 min-h-0">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="bg-surface border border-outline-variant rounded-lg p-4 mono text-[13px] leading-6 resize-none outline-none focus:border-primary text-on-surface"
        />
        <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden flex flex-col">
          <div className="h-8 px-3 flex items-center bg-background border-b border-outline-variant mono text-[11px] text-on-surface-variant uppercase tracking-wider">Output</div>
          <div className="p-3 mono text-[12px] leading-5 overflow-y-auto bg-surface">
            <AnimatePresence>
              {out.map((l, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                  className={l.startsWith('exit') ? 'text-primary' : l.startsWith('$') ? 'text-on-surface-variant' : 'text-on-surface'}>
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
