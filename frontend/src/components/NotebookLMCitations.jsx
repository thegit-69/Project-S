import { useState } from 'react';

/**
 * Renders NotebookLM-style clickable source citation pills below a message.
 * Clicking any citation opens the CitationDrawer for source provenance inspection.
 */
export default function NotebookLMCitations({ citations = [], onSelectCitation }) {
  if (!citations || citations.length === 0) return null;

  return (
    <div className="w-full pt-2 pb-1 space-y-2 select-none font-sans">
      <div className="flex items-center space-x-2 text-[11px] font-mono text-[#77766F] dark:text-[#A6A69D]">
        <svg className="w-3.5 h-3.5 text-[#176B5B] dark:text-[#38A18C]" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 16 16">
          <path d="M3 2h8l3 3v9H3z"></path>
          <path d="M11 2v3h3"></path>
          <line x1="5" y1="7" x2="11" y2="7"></line>
          <line x1="5" y1="10" x2="9" y2="10"></line>
        </svg>
        <span className="font-semibold uppercase tracking-wider text-[10px]">
          Sources & Citations ({citations.length}):
        </span>
        <span className="text-[10px] text-[#A09E96] dark:text-[#777970]">
          Click to inspect grounded excerpt
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {citations.map((cite, index) => {
          const num = index + 1;
          const docName = cite.document || cite.filename || 'Source Document';
          const pageStr = cite.page !== undefined && cite.page !== null ? `· p.${cite.page}` : (cite.section ? `· §${cite.section}` : '');

          return (
            <button
              key={index}
              onClick={() => onSelectCitation && onSelectCitation(cite, num)}
              className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[#EAE7DF] dark:bg-[#1A1C19] hover:bg-[#E0DDD3] dark:hover:bg-[#252822] border border-[#DDD9CE] dark:border-[#30332B] hover:border-[#176B5B]/60 dark:hover:border-[#38A18C]/60 text-[12px] font-mono text-[#20211F] dark:text-[#ECEAE3] transition-all shadow-sm active:scale-95 text-left"
              title={`Inspect source quotation from ${docName} ${pageStr}`}
            >
              {/* Number Badge */}
              <span className="w-4 h-4 rounded-[3px] bg-[#176B5B]/15 dark:bg-[#176B5B]/30 text-[#176B5B] dark:text-[#38A18C] font-bold text-[10px] flex items-center justify-center shrink-0">
                {num}
              </span>

              {/* Document Name */}
              <span className="font-medium truncate max-w-[190px]">
                {docName}
              </span>

              {/* Page / Section */}
              {pageStr && (
                <span className="text-[#77766F] dark:text-[#A6A69D] text-[11px]">
                  {pageStr}
                </span>
              )}

              {/* Arrow Indicator */}
              <svg className="w-3 h-3 text-[#77766F] dark:text-[#A6A69D] group-hover:text-[#176B5B] dark:group-hover:text-[#38A18C] transition-colors shrink-0 ml-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 16 16">
                <polyline points="6 3 11 8 6 13"></polyline>
              </svg>
            </button>
          );
        })}
      </div>
    </div>
  );
}
