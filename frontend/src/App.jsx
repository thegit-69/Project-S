import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ChatScreen from './screens/ChatScreen.jsx'
import KnowledgeScreen from './screens/KnowledgeScreen.jsx'
import CodeScreen from './screens/CodeScreen.jsx'
import ModelsScreen from './screens/ModelsScreen.jsx'
import LogsScreen from './screens/LogsScreen.jsx'

const SCREENS = { chat: ChatScreen, kb: KnowledgeScreen, code: CodeScreen, models: ModelsScreen, logs: LogsScreen }

export default function App() {
  const [screen, setScreen] = useState('chat')
  const Screen = SCREENS[screen]
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={screen}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      >
        <Screen onNavigate={setScreen} />
      </motion.div>
    </AnimatePresence>
  )
}
