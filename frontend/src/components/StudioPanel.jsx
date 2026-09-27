import { Sparkles, Loader2, Trash2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import StudioNote from './StudioNote.jsx'

/**
 * StudioPanel — the right-side column of the Knowledge screen.
 *
 * Props:
 *   notes           StudioNote[]
 *   hasSources      boolean
 *   studioBusy      string | null  (action key currently running)
 *   studioActions   array of { key, label, icon, prompt }
 *   onAction        (action) => void
 *   onDeleteNote    (id) => void
 *   onUpdateNote    (id, content) => void
 *   onCitationClick (citation, index) => void
 *   onClearAll      () => void
 *   style           CSSProperties  (for resizable width)
 */
export default function StudioPanel({
  notes,
  hasSources,
  studioBusy,
  studioActions,
  onAction,
  onDeleteNote,
  onUpdateNote,
  onCitationClick,
  onClearAll,
  style,
}) {
  return (
    <section
      style={style}
      className="shrink-0 flex flex-col rounded-2xl bg-white dark:bg-[#0D0D0D] border border-[#E2DED5] dark:border-[#30332B] overflow-hidden"
    >
      {/* Panel header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-[#E2DED5] dark:border-[#30332B] shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#176B5B] dark:text-[#4AF626]" />
          <h2 className="text-[15px] font-semibold text-[#20211F] dark:text-[#E0E0E0]">Studio</h2>
          {notes.length > 0 && (
            <span className="text-[10px] font-mono bg-[#176B5B]/10 dark:bg-[#176B5B]/20 text-[#176B5B] dark:text-[#4AF626] px-1.5 py-0.5 rounded-full">
              {notes.length}
            </span>
          )}
        </div>
        {notes.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-[10px] font-mono text-[#A09E96] hover:text-red-500 dark:hover:text-red-400 transition-colors"
            title="Clear all notes"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Action grid */}
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

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-1">
        {notes.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-[#E2DED5] dark:border-[#333333] px-4 py-8 text-center">
            <p className="text-[12px] text-[#77766F] dark:text-[#888888]">
              Studio output will be saved here.
            </p>
            <p className="text-[11px] text-[#A09E96] dark:text-[#666860] mt-1">
              Generate a summary or pin a chat message to start.
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            <div className="flex flex-col gap-2">
              {notes.map((note) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <StudioNote
                    note={note}
                    onDelete={onDeleteNote}
                    onUpdate={onUpdateNote}
                    onCitationClick={onCitationClick}
                  />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </section>
  )
}
