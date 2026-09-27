import { useState, useRef, useEffect } from 'react'
import { Sparkles, Loader2, Plus, ChevronDown, FileText } from 'lucide-react'
import StudioArtifactEditor from './StudioArtifactEditor.jsx'

/**
 * StudioPanel — the right-side column of the Knowledge screen. Hosts a single
 * focused artifact editor; Studio actions and pinned answers append into the
 * active artifact.
 *
 * Props:
 *   artifacts        Artifact[]
 *   activeArtifact   Artifact | null
 *   hasSources       boolean
 *   studioBusy       string | null  (action key currently running)
 *   studioActions    array of { key, label, icon, prompt }
 *   onAction         (action) => void
 *   onCreate         () => void
 *   onSelectArtifact (id) => void
 *   onRenameArtifact (id, title) => void
 *   onUpdateArtifact (id, patch) => void
 *   onDeleteArtifact (id) => void
 *   onCitationClick  (citation, index) => void
 *   onClearAll       () => void
 *   style            CSSProperties  (for resizable width)
 */
export default function StudioPanel({
  artifacts = [],
  activeArtifact,
  hasSources,
  studioBusy,
  studioActions,
  onAction,
  onCreate,
  onSelectArtifact,
  onRenameArtifact,
  onUpdateArtifact,
  onDeleteArtifact,
  onCitationClick,
  onClearAll,
  style,
}) {
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const switcherRef = useRef(null)

  useEffect(() => {
    if (!switcherOpen) return
    const handler = (e) => {
      if (switcherRef.current && !switcherRef.current.contains(e.target)) setSwitcherOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [switcherOpen])

  return (
    <section
      style={style}
      className="shrink-0 flex flex-col rounded-2xl bg-white dark:bg-[#0D0D0D] border border-[#E2DED5] dark:border-[#30332B] overflow-hidden"
    >
      {/* Panel header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-[#E2DED5] dark:border-[#30332B] shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="w-4 h-4 text-[#176B5B] dark:text-[#4AF626] shrink-0" />
          <h2 className="text-[15px] font-semibold text-[#20211F] dark:text-[#E0E0E0] shrink-0">Studio</h2>

          {/* Artifact switcher */}
          {artifacts.length > 0 && (
            <div className="relative min-w-0" ref={switcherRef}>
              <button
                onClick={() => setSwitcherOpen((v) => !v)}
                className="flex items-center gap-1 max-w-[140px] px-2 py-1 rounded-lg border border-[#E2DED5] dark:border-[#30332B] text-[11px] text-[#20211F] dark:text-[#C7C6BE] hover:border-[#176B5B] dark:hover:border-[#38A18C] transition-colors"
                title="Switch artifact"
              >
                <span className="truncate">{activeArtifact?.title || 'Select artifact'}</span>
                <ChevronDown className="w-3 h-3 shrink-0" />
              </button>
              {switcherOpen && (
                <div className="absolute left-0 top-full mt-1 z-30 w-56 max-h-64 overflow-y-auto rounded-xl border border-[#E2DED5] dark:border-[#2A2E27] bg-white dark:bg-[#0D0D0D] shadow-xl overflow-hidden">
                  {artifacts.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => { onSelectArtifact(a.id); setSwitcherOpen(false) }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-left text-[11.5px] hover:bg-[#F1F7F5] dark:hover:bg-[#16211D] transition-colors ${a.id === activeArtifact?.id ? 'text-[#176B5B] dark:text-[#4AF626]' : 'text-[#20211F] dark:text-[#C7C6BE]'}`}
                    >
                      <FileText className="w-3.5 h-3.5 shrink-0 opacity-70" />
                      <span className="truncate flex-1">{a.title || 'Untitled artifact'}</span>
                      <span className="text-[9px] font-mono text-[#A09E96] shrink-0">{a.updatedAt || a.ts}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onCreate}
            title="New artifact"
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-[#176B5B] dark:text-[#4AF626] hover:bg-[#F1F7F5] dark:hover:bg-[#16211D] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New
          </button>
          {artifacts.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-[10px] font-mono text-[#A09E96] hover:text-red-500 dark:hover:text-red-400 transition-colors"
              title="Delete all artifacts"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      Action grid
      <div className="px-4 pt-3 pb-2 shrink-0">
        <div className="grid grid-cols-2 gap-1.5">
          {studioActions.map((a) => {
            const Icon = a.icon
            const busy = studioBusy === a.key
            return (
              <button
                key={a.key}
                onClick={() => onAction(a)}
                disabled={!hasSources || !!studioBusy}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[#E2DED5] dark:border-[#30332B] text-left hover:border-[#176B5B] dark:hover:border-[#38A18C] hover:bg-[#F1F7F5] dark:hover:bg-[#16211D] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {busy ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#176B5B] dark:text-[#4AF626] shrink-0" />
                ) : (
                  <Icon className="w-4 h-4 text-[#176B5B] dark:text-[#4AF626] shrink-0" />
                )}
                <span className="text-[12px] font-medium truncate text-[#20211F] dark:text-[#E0E0E0]">
                  {a.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Active artifact editor */}
      <div className="flex-1 flex flex-col min-h-0 px-4 pb-4 pt-1">
        {artifacts.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-[#E2DED5] dark:border-[#333333] px-4 py-8 text-center">
            <p className="text-[12px] text-[#77766F] dark:text-[#888888]">
              Your editable artifact will live here.
            </p>
            <p className="text-[11px] text-[#A09E96] dark:text-[#666860] mt-1">
              Run a Studio action, pin a chat answer, or click New to start.
            </p>
          </div>
        ) : (
          <StudioArtifactEditor
            artifact={activeArtifact}
            onUpdate={onUpdateArtifact}
            onRename={onRenameArtifact}
            onDelete={onDeleteArtifact}
            onCitationClick={onCitationClick}
          />
        )}
      </div>
    </section>
  )
}
