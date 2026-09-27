import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'vault_studio_notes'

/**
 * useStudio — centralised state and persistence for the Studio Notebook panel.
 *
 * Notes survive page refreshes via localStorage.
 * Each note has the shape:
 *   { id, title, content, citations, ts, source }
 * where source is 'action' | 'pin' (pin = manually pinned from chat).
 */
export function useStudio() {
  const [notes, setNotes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
      return []
    }
  })

  // Persist on every change — evict oldest notes if quota is exceeded
  useEffect(() => {
    let toSave = notes
    while (toSave.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
        break
      } catch {
        // Drop the oldest note (last in array = oldest, since we prepend) and retry
        toSave = toSave.slice(0, -1)
      }
    }
    if (toSave.length === 0) {
      // Nothing fits — clear the key to at least free space
      try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
    }
  }, [notes])

  const addNote = useCallback((title, content, citations = [], source = 'action') => {
    const note = {
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      content,
      citations,
      source,
      ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setNotes((prev) => [note, ...prev])
    return note
  }, [])

  const deleteNote = useCallback((id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const updateNote = useCallback((id, content) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, content } : n))
    )
  }, [])

  /**
   * Pin a chat message into the Studio panel as a note.
   * @param {{ text: string, citations?: any[], role: string }} msg
   */
  const pinMessage = useCallback(
    (msg) => {
      const title = `Pinned Note - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      return addNote(title, msg.text, msg.citations || [], 'pin')
    },
    [addNote]
  )

  const clearAll = useCallback(() => setNotes([]), [])

  return { notes, addNote, deleteNote, updateNote, pinMessage, clearAll }
}
