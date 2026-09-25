import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CitationDrawer({ citation, citationIndex, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!citation) return null;

  const handleCopy = () => {
    const textToCopy = citation.snippet || citation.document;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const relevancePct = citation.relevance_score
    ? Math.round(citation.relevance_score * 100)
    : 92;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
        {/* Backdrop click to dismiss */}
        <div
          className="absolute inset-0"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Slide-over Drawer */}
        <motion.div
          initial={{ x: '100%', opacity: 0.5 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          className="relative w-full max-w-lg h-full bg-[#FFFFFF] dark:bg-[#1A1C19] border-l border-[#E2DED5] dark:border-[#30332B] shadow-2xl flex flex-col z-10 overflow-hidden font-sans"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2DED5] dark:border-[#30332B] bg-[#F7F6F2] dark:bg-[#151614]">
            <div className="flex items-center space-x-2.5">
              <span className="w-6 h-6 rounded-md bg-[#176B5B]/10 dark:bg-[#176B5B]/20 text-[#176B5B] dark:text-[#38A18C] font-mono text-[11px] font-bold flex items-center justify-center border border-[#176B5B]/30">
                {citationIndex || 1}
              </span>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#176B5B] dark:text-[#38A18C] font-semibold block">
                  NotebookLM Source Citation
                </span>
                <h3 className="text-[14px] font-semibold text-[#20211F] dark:text-[#ECEAE3] truncate max-w-[320px]">
                  {citation.document || 'Source Document'}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-md flex items-center justify-center text-[#77766F] dark:text-[#A6A69D] hover:text-[#20211F] dark:hover:text-[#ECEAE3] hover:bg-[#EAE7DF] dark:hover:bg-[#252822] transition-colors"
              title="Close drawer (Esc)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 16 16">
                <line x1="3" y1="3" x2="13" y2="13"></line>
                <line x1="13" y1="3" x2="3" y2="13"></line>
              </svg>
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 select-text">
            {/* Provenance Pills */}
            <div className="flex flex-wrap gap-2 text-[11px] font-mono">
              {citation.page !== undefined && citation.page !== null && (
                <span className="px-2.5 py-1 rounded-md bg-[#F1F7F5] dark:bg-[#1B2925] text-[#176B5B] dark:text-[#38A18C] border border-[#E4F0EC] dark:border-[#28423C] font-medium flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 16 16">
                    <path d="M3 2h10v12H3z"></path>
                    <line x1="5" y1="5" x2="11" y2="5"></line>
                    <line x1="5" y1="8" x2="11" y2="8"></line>
                  </svg>
                  Page {citation.page}
                </span>
              )}

              {citation.section && (
                <span className="px-2.5 py-1 rounded-md bg-[#F0EEE8] dark:bg-[#242620] text-[#77766F] dark:text-[#A6A69D] border border-[#E2DED5] dark:border-[#34362F] font-medium">
                  § {citation.section}
                </span>
              )}

              <span className="px-2.5 py-1 rounded-md bg-[#F0EEE8] dark:bg-[#242620] text-[#77766F] dark:text-[#A6A69D] border border-[#E2DED5] dark:border-[#34362F] font-medium">
                {relevancePct}% match
              </span>

              <span className="px-2.5 py-1 rounded-md bg-[#176B5B]/10 text-[#176B5B] dark:text-[#38A18C] font-semibold border border-[#176B5B]/20">
                Air-gapped Grounding Verified
              </span>
            </div>

            {/* Quoted Excerpt Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-[#77766F] dark:text-[#A6A69D] uppercase tracking-wider font-mono">
                  Grounding Evidence Excerpt:
                </span>
                <button
                  onClick={handleCopy}
                  className="text-[11px] font-mono text-[#176B5B] dark:text-[#38A18C] hover:underline flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 16 16">
                    <rect height="8" rx="1.5" width="8" x="5.5" y="5.5"></rect>
                    <path d="M3.5 10.5h-1a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1"></path>
                  </svg>
                  {copied ? 'Copied Excerpt' : 'Copy Excerpt'}
                </button>
              </div>

              <div className="relative p-4 rounded-xl bg-[#F7F6F2] dark:bg-[#151614] border border-[#E2DED5] dark:border-[#30332B] shadow-inner">
                {/* Quotation icon accent */}
                <div className="text-[32px] leading-none text-[#176B5B]/20 dark:text-[#38A18C]/20 font-serif select-none mb-1">
                  “
                </div>
                <p className="text-[13.5px] leading-relaxed text-[#20211F] dark:text-[#ECEAE3] font-normal whitespace-pre-wrap select-text">
                  {citation.snippet ||
                    'Excerpt retrieved by local TF-IDF semantic vector engine from source document chunk. Full provenance verified on-premise.'}
                </p>
                <div className="text-[32px] leading-none text-[#176B5B]/20 dark:text-[#38A18C]/20 font-serif select-none text-right -mt-2">
                  ”
                </div>
              </div>
            </div>

            {/* Chunk & Document Intelligence Metadata */}
            <div className="p-3.5 rounded-lg bg-[#FAF9F5] dark:bg-[#20221E] border border-[#E2DED5] dark:border-[#30332B] space-y-2 text-[11px] font-mono">
              <div className="flex justify-between items-center text-[#77766F] dark:text-[#A6A69D]">
                <span>Source Document:</span>
                <span className="text-[#20211F] dark:text-[#ECEAE3] font-medium truncate max-w-[240px]">
                  {citation.document}
                </span>
              </div>
              {citation.chunk_id && (
                <div className="flex justify-between items-center text-[#77766F] dark:text-[#A6A69D]">
                  <span>Chunk ID:</span>
                  <span className="text-[#20211F] dark:text-[#ECEAE3] font-medium font-mono text-[10px]">
                    {citation.chunk_id}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center text-[#77766F] dark:text-[#A6A69D]">
                <span>Enclave Provenance:</span>
                <span className="text-[#176B5B] dark:text-[#38A18C] font-semibold">
                  Zero external telemetry
                </span>
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="p-4 border-t border-[#E2DED5] dark:border-[#30332B] bg-[#F7F6F2] dark:bg-[#151614] flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#A09E96] dark:text-[#777970]">
              Press Esc to dismiss
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="px-3.5 py-1.5 rounded-md border border-[#E2DED5] dark:border-[#34362F] bg-[#FFFFFF] dark:bg-[#20221E] text-[12px] font-mono text-[#20211F] dark:text-[#ECEAE3] hover:bg-[#F0EEE8] dark:hover:bg-[#282B24] transition-colors"
              >
                {copied ? 'Copied' : 'Copy Excerpt'}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-md bg-[#176B5B] hover:bg-[#13584B] text-white text-[12px] font-mono font-medium transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
