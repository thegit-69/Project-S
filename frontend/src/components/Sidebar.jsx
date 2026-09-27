import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, BookOpen, Code2, Cpu, Terminal, Settings, Library } from 'lucide-react'

export const NAV = [
  { id: 'chat',    label: 'Workbench Chat',  icon: MessageSquare },
  { id: 'kb',      label: 'Knowledge Base',  icon: BookOpen },
  { id: 'library', label: 'Library',         icon: Library },
  { id: 'code',    label: 'Code Studio',     icon: Code2 },
  { id: 'models',  label: 'Models Registry', icon: Cpu },
  { id: 'logs',    label: 'Activity Logs',   icon: Terminal },
]

export default function Sidebar({ active, onSelect }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [recentChats, setRecentChats] = useState([])

  const loadChats = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('vault_chats') || '[]')
      // Sort by timestamp descending
      stored.sort((a, b) => b.timestamp - a.timestamp)
      setRecentChats(stored)
    } catch (e) {
      console.error('Failed to load chats', e)
    }
  }

  useEffect(() => {
    loadChats()
    // Listen for custom event from ChatScreen
    const handleUpdate = () => loadChats()
    window.addEventListener('vault_chats_updated', handleUpdate)
    return () => window.removeEventListener('vault_chats_updated', handleUpdate)
  }, [])
  return (
    <motion.aside
      animate={{ width: isExpanded ? 216 : 64 }}
      transition={{ type: 'spring', stiffness: 380, damping: 34 }}
      className="h-full bg-surface border-r border-outline-variant flex flex-col py-4 px-2 overflow-hidden shrink-0 z-20"
    >
      <button 
        onClick={() => setIsExpanded(!isExpanded)} 
        className="h-8 flex items-center px-2 mb-4 text-primary hover:bg-surface-variant rounded transition-colors w-full cursor-pointer"
      >
        <Cpu size={20} strokeWidth={1.75} className="shrink-0" />
        {isExpanded && <span className="ml-3 font-semibold tracking-tight whitespace-nowrap">VAULT</span>}
      </button>

      <nav className="flex flex-col gap-1">
        {NAV.map(({ id, label, icon: Icon }) => {
          const on = active === id
          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className={`relative h-10 flex items-center px-3 rounded text-left transition-colors
                ${on ? 'bg-background text-primary shadow-sm border border-outline-variant' : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'}`}
            >
              {on && <motion.span layoutId="nav-bar" className="absolute left-0 top-2 bottom-2 w-[2px] bg-primary rounded" />}
              <Icon size={18} strokeWidth={1.75} className="shrink-0" />
              <motion.span
                animate={{ opacity: isExpanded ? 1 : 0 }}
                className="ml-3 whitespace-nowrap text-[13px]"
              >
                {label}
              </motion.span>
            </button>
          )
        })}
      </nav>

      {/* Recent Chats Section */}
      <div className="flex-1 overflow-y-auto mt-6 px-1 custom-scrollbar">
        {isExpanded && recentChats.length > 0 && (
          <div className="px-2 mb-2">
            <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider">
              Recent
            </span>
          </div>
        )}
        <nav className="flex flex-col gap-0.5">
          {recentChats.map((chat) => {
            const chatId = `chat/${chat.id}`
            const on = active === chatId
            return (
              <button
                key={chat.id}
                onClick={() => onSelect(chatId)}
                className={`relative h-8 flex items-center px-2 rounded text-left transition-colors
                  ${on ? 'bg-surface-variant text-primary' : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'}`}
              >
                {on && <motion.span layoutId="nav-bar-recent" className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-primary rounded" />}
                <MessageSquare size={14} strokeWidth={1.75} className="shrink-0 ml-1" />
                <motion.span
                  animate={{ opacity: isExpanded ? 1 : 0 }}
                  className="ml-3 whitespace-nowrap text-[12px] truncate max-w-[140px]"
                >
                  {chat.title || 'Untitled Chat'}
                </motion.span>
              </button>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto flex flex-col gap-2">
        <div className="h-8 flex items-center px-3 text-primary cursor-default">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          {isExpanded && <span className="ml-3 font-mono text-[11px] text-on-surface-variant whitespace-nowrap">Enclave active</span>}
        </div>
        <button className="h-9 flex items-center px-3 rounded text-on-surface-variant hover:bg-surface-variant hover:text-on-surface">
          <Settings size={18} strokeWidth={1.75} className="shrink-0" />
          {isExpanded && <span className="ml-3 text-[13px] whitespace-nowrap">Settings</span>}
        </button>
        <div className="h-9 flex items-center px-2 cursor-default">
          <span className="w-8 h-8 rounded bg-background border border-outline-variant flex items-center justify-center font-mono text-[11px] text-on-surface-variant shrink-0">AK</span>
          {isExpanded && <span className="ml-3 text-[13px] whitespace-nowrap text-on-surface">Operator</span>}
        </div>
      </div>
    </motion.aside>
  )
}
