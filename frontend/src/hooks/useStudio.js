import { useState, useEffect, useCallback, useMemo } from 'react'

const STORAGE_KEY = 'vault_studio_notes'      // reused: now holds the artifacts array
const ACTIVE_KEY = 'vault_studio_active_id'

const nowTs = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
const newId = () => `art-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

// Merge citation arrays, de-duplicating on chunk_id (falling back to document_id + snippet).
function mergeCitations(a = [], b = []) {
  const seen = new Set()
  const out = []
  for (const c of [...a, ...b]) {
    if (!c) continue
    const key = c.chunk_id || `${c.document_id || c.document || ''}::${(c.snippet || '').slice(0, 40)}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(c)
  }
  return out
}

/**
 * useStudio — state + persistence for the Studio panel, modelled as a set of
 * editable "artifacts" with one active artifact in focus.
 *
 * Artifact shape:
 *   { id, title, content /* markdown *\/, citations, source, ts, updatedAt }
 * Legacy notes (same shape, minus updatedAt) migrate transparently.
 */
export function useStudio() {
  const [artifacts, setArtifacts] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      return Array.isArray(raw)
        ? raw.map((n) => ({ updatedAt: n.ts || nowTs(), citations: [], source: 'action', ...n }))
        : []
    } catch {
      return []
    }
  })

  const [activeId, setActiveId] = useState(() => {
    try {
      return localStorage.getItem(ACTIVE_KEY) || null
    } catch {
      return null
    }
  })

  // Persist artifacts, evicting oldest on quota errors.
  useEffect(() => {
    let toSave = artifacts
    while (toSave.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
        break
      } catch {
        toSave = toSave.slice(0, -1)
      }
    }
    if (toSave.length === 0) {
      try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
    }
  }, [artifacts])

  // Keep activeId valid + persisted. Default to the first artifact.
  useEffect(() => {
    const valid = activeId && artifacts.some((a) => a.id === activeId)
    const next = valid ? activeId : (artifacts[0]?.id || null)
    if (next !== activeId) setActiveId(next)
    try {
      if (next) localStorage.setItem(ACTIVE_KEY, next)
      else localStorage.removeItem(ACTIVE_KEY)
    } catch { /* ignore */ }
  }, [artifacts, activeId])

  const activeArtifact = useMemo(
    () => artifacts.find((a) => a.id === activeId) || null,
    [artifacts, activeId]
  )

  const createArtifact = useCallback((title = 'Untitled artifact', content = '', citations = [], source = 'manual') => {
    const art = { id: newId(), title, content, citations, source, ts: nowTs(), updatedAt: nowTs() }
    setArtifacts((prev) => [art, ...prev])
    setActiveId(art.id)
    return art
  }, [])

  const setActive = useCallback((id) => setActiveId(id), [])

  const renameArtifact = useCallback((id, title) => {
    setArtifacts((prev) => prev.map((a) => (a.id === id ? { ...a, title, updatedAt: nowTs() } : a)))
  }, [])

  // Patch = { content?, citations?, title? }
  const updateArtifact = useCallback((id, patch) => {
    setArtifacts((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch, updatedAt: nowTs() } : a)))
  }, [])

  const deleteArtifact = useCallback((id) => {
    setArtifacts((prev) => prev.filter((a) => a.id !== id))
    setActiveId((cur) => (cur === id ? null : cur))
  }, [])

  const clearAll = useCallback(() => {
    setArtifacts([])
    setActiveId(null)
  }, [])

  /**
   * Append a block of output into the active artifact, creating one if none is
   * active. Blocks are separated by a rule + heading so the document reads as a
   * built-up dossier.
   */
  const appendToActive = useCallback((title, content, citations = [], source = 'action') => {
    const block = `### ${title}\n\n${content || ''}`
    let createdId = null
    setArtifacts((prev) => {
      const idx = prev.findIndex((a) => a.id === activeId)
      if (idx === -1) {
        // No active artifact — start a fresh one.
        const art = { id: newId(), title, content: content || '', citations, source, ts: nowTs(), updatedAt: nowTs() }
        createdId = art.id
        return [art, ...prev]
      }
      const cur = prev[idx]
      const merged = {
        ...cur,
        content: cur.content ? `${cur.content}\n\n---\n\n${block}` : block,
        citations: mergeCitations(cur.citations, citations),
        updatedAt: nowTs(),
      }
      const next = [...prev]
      next[idx] = merged
      return next
    })
    if (createdId) setActiveId(createdId)
  }, [activeId])

  const pinMessage = useCallback(
    (msg) => appendToActive(`Pinned - ${nowTs()}`, msg.text, msg.citations || [], 'pin'),
    [appendToActive]
  )

  return {
    artifacts,
    activeId,
    activeArtifact,
    createArtifact,
    setActive,
    renameArtifact,
    updateArtifact,
    deleteArtifact,
    appendToActive,
    pinMessage,
    clearAll,
  }
}
