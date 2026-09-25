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
  return (
    <>
      <div style={{ display: screen === 'chat' ? 'block' : 'none' }}><ChatScreen onNavigate={setScreen} /></div>
      <div style={{ display: screen === 'kb' ? 'block' : 'none' }}><KnowledgeScreen onNavigate={setScreen} /></div>
      <div style={{ display: screen === 'code' ? 'block' : 'none' }}><CodeScreen onNavigate={setScreen} /></div>
      <div style={{ display: screen === 'models' ? 'block' : 'none' }}><ModelsScreen onNavigate={setScreen} /></div>
      <div style={{ display: screen === 'logs' ? 'block' : 'none' }}><LogsScreen onNavigate={setScreen} /></div>
    </>
  )
}
