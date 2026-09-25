import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import ChatScreen from './screens/ChatScreen.jsx'
import KnowledgeScreen from './screens/KnowledgeScreen.jsx'
import CodeScreen from './screens/CodeScreen.jsx'
import ModelsScreen from './screens/ModelsScreen.jsx'
import LogsScreen from './screens/LogsScreen.jsx'
import Sidebar from './components/Sidebar.jsx'

const ROUTE_MAP = {
  chat: '/chat',
  kb: '/knowledge',
  knowledge: '/knowledge',
  code: '/code',
  models: '/models',
  logs: '/logs',
}

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()

  const handleNavigate = (target) => {
    const destination = ROUTE_MAP[target] || (target.startsWith('/') ? target : `/${target}`)
    navigate(destination)
  }

  const activeId = Object.keys(ROUTE_MAP).find(k => ROUTE_MAP[k] === location.pathname) || location.pathname.replace('/', '')

  return (
    <AnimatePresence mode="wait">
      <div className="flex w-full h-full">
        <Sidebar active={activeId} onSelect={handleNavigate} />
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="flex-1 w-full h-full relative"
        >
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Navigate to="/chat" replace />} />
          <Route path="/chat" element={<ChatScreen onNavigate={handleNavigate} />} />
          <Route path="/knowledge" element={<KnowledgeScreen onNavigate={handleNavigate} />} />
          <Route path="/kb" element={<Navigate to="/knowledge" replace />} />
          <Route path="/code" element={<CodeScreen onNavigate={handleNavigate} />} />
          <Route path="/models" element={<ModelsScreen onNavigate={handleNavigate} />} />
          <Route path="/logs" element={<LogsScreen onNavigate={handleNavigate} />} />
          <Route path="*" element={<Navigate to="/chat" replace />} />
        </Routes>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

