import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, BookOpen, Code2, Cpu, Terminal, Settings } from 'lucide-react'

export const NAV = [
  { id: 'chat', label: 'Workbench Chat', icon: MessageSquare },
  { id: 'kb', label: 'Knowledge Base', icon: BookOpen },
  { id: 'code', label: 'Code Studio', icon: Code2 },
  { id: 'models', label: 'Models Registry', icon: Cpu },
  { id: 'logs', label: 'Activity Logs', icon: Terminal },
]

export default function Sidebar({ active, onSelect }) {
  const [hover, setHover] = useState(false)
  return (
    <motion.aside
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      animate={{ width: hover ? 216 : 64 }}
      transition={{ type: 'spring', stiffness: 380, damping: 34 }}
      className="h-full bg-panel2 border-r border-hairline flex flex-col py-4 px-2 overflow-hidden shrink-0 z-20"
    >
      <div className="h-8 flex items-center px-2 mb-4 text-petrol">
        <Cpu size={20} strokeWidth={1.75} />
        {hover && <span className="ml-3 font-semibold tracking-tight whitespace-nowrap">VAULT</span>}
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map(({ id, label, icon: Icon }) => {
          const on = active === id
          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className={`relative h-10 flex items-center px-3 rounded text-left transition-colors
                ${on ? 'bg-white text-petrol shadow-[inset_0_0_0_1px_#E5E7E1]' : 'text-muted hover:bg-white/70 hover:text-ink'}`}
            >
              {on && <motion.span layoutId="nav-bar" className="absolute left-0 top-2 bottom-2 w-[2px] bg-petrol rounded" />}
              <Icon size={18} strokeWidth={1.75} className="shrink-0" />
              <motion.span
                animate={{ opacity: hover ? 1 : 0 }}
                className="ml-3 whitespace-nowrap text-[13px]"
              >
                {label}
              </motion.span>
            </button>
          )
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-2">
        <div className="h-8 flex items-center px-3 text-petrol">
          <span className="w-1.5 h-1.5 rounded-full bg-petrol" />
          {hover && <span className="ml-3 font-mono text-[11px] text-muted whitespace-nowrap">Enclave active</span>}
        </div>
        <button className="h-9 flex items-center px-3 rounded text-muted hover:bg-white hover:text-ink">
          <Settings size={18} strokeWidth={1.75} className="shrink-0" />
          {hover && <span className="ml-3 text-[13px] whitespace-nowrap">Settings</span>}
        </button>
        <div className="h-9 flex items-center px-2">
          <span className="w-8 h-8 rounded bg-white border border-hairline flex items-center justify-center font-mono text-[11px] text-muted shrink-0">AK</span>
          {hover && <span className="ml-3 text-[13px] whitespace-nowrap">Operator</span>}
        </div>
      </div>
    </motion.aside>
  )
}
