import { useState, useEffect } from 'react';

/**
 * Parses a model name into a base name and tag pills matching llama.cpp's UI.
 * e.g., "ggml-org/gemma-3-4b-it-GGUF:Q4_K_M" -> base: "ggml-org/gemma-3", pills: ["4B", "Q4_K_M", "it"]
 */
function parseModelPills(modelName = '') {
  const defaultPills = ['4B', 'Q4_K_M', 'it'];
  if (!modelName || modelName.toLowerCase().includes('gemma-3') || modelName.toLowerCase().includes('general')) {
    return {
      base: 'ggml-org/gemma-3',
      pills: defaultPills,
    };
  }

  // Handle other format strings
  const parts = modelName.split(/[:/_-]/).filter(Boolean);
  const base = parts.slice(0, 2).join('/') || modelName;
  const pills = parts.slice(2, 5);
  return {
    base,
    pills: pills.length ? pills : defaultPills,
  };
}

export default function LlamaMessageFooter({
  message,
  onCopy,
  onEdit,
  onRegenerate,
  onBranch,
  onDelete,
}) {
  const [copied, setCopied] = useState(false);
  const [actionNotice, setActionNotice] = useState('');
  const [now, setNow] = useState(Date.now());

  const { base, pills } = parseModelPills(message.model);

  useEffect(() => {
    let interval;
    if (message.startTime && !message.durationMs) {
      interval = setInterval(() => setNow(Date.now()), 250);
    }
    return () => clearInterval(interval);
  }, [message.startTime, message.durationMs]);

  // Compute duration live
  const activeDurationMs = message.durationMs || (message.startTime ? now - message.startTime : 0);
  const durationSec = activeDurationMs > 0
    ? `${(activeDurationMs / 1000).toFixed(1)}s`
    : '...';

  // Compute tokens count live
  const tokensCount = message.tokensUsed || message.tokens || (message.text ? Math.max(1, Math.floor(message.text.length / 4)) : 860);

  // Compute tokens per second live
  const speedRaw = message.tokensPerSecond || (activeDurationMs > 0 ? (tokensCount / (activeDurationMs / 1000)) : null);
  const speed = speedRaw ? Number(speedRaw).toFixed(2) : '...';

  const handleCopyClick = () => {
    if (onCopy) {
      onCopy(message.id, message.text || '');
    } else {
      navigator.clipboard.writeText(message.text || '');
    }
    setCopied(true);
    setActionNotice('Copied to clipboard');
    setTimeout(() => {
      setCopied(false);
      setActionNotice('');
    }, 2000);
  };

  const handleEditClick = () => {
    if (onEdit) onEdit(message);
    setActionNotice('Prompt loaded into composer');
    setTimeout(() => setActionNotice(''), 2000);
  };

  const handleRegenerateClick = () => {
    if (onRegenerate) onRegenerate(message);
  };

  const handleBranchClick = () => {
    if (onBranch) onBranch(message);
    setActionNotice('Conversation branched');
    setTimeout(() => setActionNotice(''), 2500);
  };

  const handleDeleteClick = () => {
    if (onDelete) onDelete(message.id);
  };

  return (
    <div className="w-full flex flex-col pt-3 pb-1 select-none font-sans space-y-2">
      {/* ========================================================
          ROW 1: Model Tag & Inline Metrics
         ======================================================== */}
      <div className="flex flex-wrap items-center gap-3 text-[12px] font-mono text-[#77766F] dark:text-[#888888]">
        {/* Model Pill Container */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[#EAE7DF] dark:bg-[#161715] border border-[#DDD9CE] dark:border-[#2C2E29] text-[#20211F] dark:text-[#E2E0D8] shadow-sm">
          {/* 3D Cube Icon */}
          <svg className="w-3.5 h-3.5 text-[#176B5B] dark:text-[#4AF626] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 16 16">
            <path d="M8 1.5L2.2 4.8v6.4L8 14.5l5.8-3.3V4.8L8 1.5z"></path>
            <path d="M8 1.5v6.5m5.8-3.2L8 8m0 0L2.2 4.8"></path>
          </svg>

          {/* Model Base Name */}
          <span className="font-semibold text-[11.5px] tracking-tight text-[#20211F] dark:text-[#E6E4DD]">
            {base}
          </span>

          {/* Sub-Pills */}
          <div className="inline-flex items-center gap-1 ml-0.5">
            {pills.map((pill, idx) => (
              <span
                key={idx}
                className="px-1.5 py-[1px] text-[10px] font-bold rounded-[4px] bg-[#DDD9CE] dark:bg-[#1A1A1A] text-[#20211F] dark:text-[#CCCCCC] border border-[#CFCABF] dark:border-[#333333]"
              >
                {pill}
              </span>
            ))}
          </div>
        </div>

        {/* Tokens Count */}
        <div className="inline-flex items-center gap-1.5 hover:text-[#20211F] dark:hover:text-[#ECEAE3] transition-colors" title="Tokens generated">
          <span className="font-mono font-bold text-[10.5px] border-b border-current pb-[1px] tracking-tight">
            ab
          </span>
          <span className="text-[12px]">{tokensCount} tokens</span>
        </div>

        {/* Latency / Duration */}
        <div className="inline-flex items-center gap-1.5 hover:text-[#20211F] dark:hover:text-[#ECEAE3] transition-colors" title="Generation latency">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 16 16">
            <circle cx="8" cy="8" r="6"></circle>
            <polyline points="8 4.5 8 8 10.5 9.5"></polyline>
          </svg>
          <span className="text-[12px]">{durationSec}</span>
        </div>

        {/* Generation Speed (t/s) */}
        <div className="inline-flex items-center gap-1.5 hover:text-[#20211F] dark:hover:text-[#ECEAE3] transition-colors" title="Generation throughput">
          <svg className="w-3.5 h-3.5 text-[#176B5B] dark:text-[#4AF626] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 16 16">
            <path d="M2.5 11a6 6 0 1 1 11 0"></path>
            <circle cx="8" cy="8" r="1.5"></circle>
            <path d="M8 8l2.5-3"></path>
          </svg>
          <span className="text-[12px] font-semibold text-[#176B5B] dark:text-[#4AF626]">
            {speed} t/s
          </span>
        </div>

        {/* Action Notice feedback if any */}
        {actionNotice && (
          <span className="text-[10.5px] font-mono text-[#176B5B] dark:text-[#4AF626] animate-fade-in ml-auto">
            ✓ {actionNotice}
          </span>
        )}
      </div>

      {/* ========================================================
          ROW 2: Action Buttons (Copy, Edit, Regenerate, Branch, Delete)
         ======================================================== */}
      <div className="flex items-center gap-1 text-[#77766F] dark:text-[#888888] pt-0.5">
        {/* 1. Copy Button */}
        <button
          onClick={handleCopyClick}
          className="p-1.5 rounded-md hover:bg-[#EAE7DF] dark:hover:bg-[#1A1A1A] hover:text-[#20211F] dark:hover:text-[#FFFFFF] transition-colors"
          title="Copy response to clipboard"
        >
          {copied ? (
            <svg className="w-4 h-4 text-[#176B5B] dark:text-[#4AF626]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 16 16">
              <polyline points="3.5 8.5 6.5 11.5 12.5 4.5"></polyline>
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 16 16">
              <rect height="8.5" rx="1.5" width="8.5" x="5" y="5"></rect>
              <path d="M3.5 10.5h-1a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1"></path>
            </svg>
          )}
        </button>

        {/* 2. Edit Button */}
        <button
          onClick={handleEditClick}
          className="p-1.5 rounded-md hover:bg-[#EAE7DF] dark:hover:bg-[#1A1A1A] hover:text-[#20211F] dark:hover:text-[#FFFFFF] transition-colors"
          title="Edit prompt and re-submit"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 16 16">
            <path d="M11.5 2.5a1.414 1.414 0 0 1 2 2L5 13H2.5v-2.5l8.5-8.5z"></path>
            <line x1="10" x2="13" y1="4" y2="7"></line>
          </svg>
        </button>

        {/* 3. Regenerate Button */}
        <button
          onClick={handleRegenerateClick}
          className="p-1.5 rounded-md hover:bg-[#EAE7DF] dark:hover:bg-[#1A1A1A] hover:text-[#20211F] dark:hover:text-[#FFFFFF] transition-colors"
          title="Regenerate response"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 16 16">
            <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9L14 6"></path>
            <polyline points="14 2 14 6 10 6"></polyline>
          </svg>
        </button>

        {/* 4. Branch / Fork Button */}
        <button
          onClick={handleBranchClick}
          className="p-1.5 rounded-md hover:bg-[#EAE7DF] dark:hover:bg-[#1A1A1A] hover:text-[#20211F] dark:hover:text-[#FFFFFF] transition-colors"
          title="Branch / Fork conversation from this turn"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 16 16">
            <circle cx="4" cy="12" r="2"></circle>
            <circle cx="12" cy="4" r="2"></circle>
            <circle cx="4" cy="4" r="2"></circle>
            <path d="M4 6v4m0-4c0 3 8 2 8 0"></path>
          </svg>
        </button>

        {/* 5. Delete Button */}
        <button
          onClick={handleDeleteClick}
          className="p-1.5 rounded-md hover:bg-[#EAE7DF] dark:hover:bg-[#1A1A1A] hover:text-[#D96B32] transition-colors"
          title="Delete this message"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 16 16">
            <polyline points="2.5 4.5 13.5 4.5"></polyline>
            <path d="M6 2h4a1 1 0 0 1 1 1v1.5H5V3a1 1 0 0 1 1-1z"></path>
            <path d="M4 4.5l.8 8.5a1.5 1.5 0 0 0 1.5 1.5h3.4a1.5 1.5 0 0 0 1.5-1.5l.8-8.5"></path>
            <line x1="6.5" x2="6.5" y1="7.5" y2="11.5"></line>
            <line x1="9.5" x2="9.5" y1="7.5" y2="11.5"></line>
          </svg>
        </button>
      </div>
    </div>
  );
}
