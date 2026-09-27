import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  sendChatMessage,
  getSystemHealth,
  getModelsHealth,
  uploadDocumentFile,
  pollDocumentStatus,
  listModelCatalog,
  streamChat,
  uploadToLibrary,
  runAgentChat,
  downloadApprovalNote,
} from '../services/api.js'
import MarkdownMessage from '../components/MarkdownMessage.jsx'
import LlamaMessageFooter from '../components/LlamaMessageFooter.jsx'
import NotebookLMCitations from '../components/NotebookLMCitations.jsx'
import CitationDrawer from '../components/CitationDrawer.jsx'

const I18N = {
  en: {
    settings_title: "Settings",
    settings_theme: "Theme",
    settings_lang: "Language",
    theme_light: "Light",
    theme_dark: "Dark",
    theme_system: "System",
    nav_chat: "Chat",
    nav_knowledge: "Knowledge",
    nav_code: "Code",
    nav_models: "Models",
    nav_logs: "Logs",
    badge_offline: "OFFLINE",
    session_context: "Session #4821-C Â· Air-gapped enclave Â· Gemma-3-4B-IT (Local Llama.cpp)",
    role_operator: "Operator",
    role_vault: "Vault",
    msg_operator: "Review the inspection report and identify the findings that require immediate action.",
    msg_vault_title: "Three findings require immediate attention.",
    finding_1_bold: "Pressure anomaly detected",
    finding_1_body: "on Feedwater Pump 2B casing during cycle transition. Ultrasonic readings exceed baseline thresholds by 18.4%.",
    citation_1: "Inspection_Report.pdf Â· p.14",
    finding_2_bold: "Corrosion identified",
    finding_2_body: "in Secondary Heat Exchanger bypass flange weld seam. Wall thickness compromised past allowable metallurgical safety margin (3.2mm vs 4.0mm required).",
    citation_2: "Inspection_Report.pdf Â· p.22",
    finding_3_bold: "Inspection interval exceeded",
    finding_3_body: "for Turbine Isolation Relief Valve VR-408 by 42 days. Regulatory conformance mandates re-calibration prior to high-load startup.",
    citation_3: "Inspection_Report.pdf Â· p.31",
    recommendation_text: "Recommendation: Issue maintenance work orders for Pump 2B and Valve VR-408 before cycle 08 commencement. Would you like me to draft the priority defect dispatches?",
    status_step1: "Reading inspection_report.pdf",
    status_step2: "Searching local knowledge",
    status_step3: "Preparing response",
    tokens_metric: "4,120 / 64k tokens",
    quick_actions_label: "Quick actions:",
    qa_analyze: "Analyze document",
    qa_search: "Search knowledge",
    qa_code: "Write code",
    input_placeholder: "Ask Vault...",
    attached_file: "Inspection_Report.pdf (attached)",
    btn_return: "return",
    footer_note: "Sovereign on-premise Ai workbench · Zero external network requests"
  },
};

export default function ChatScreen({ onNavigate }) {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [totalTokens, setTotalTokens] = useState(0);
  const [backendStatus, setBackendStatus] = useState('checking'); // 'healthy' | 'offline' | 'checking'
  const [modelStatus, setModelStatus] = useState('Gemma-3-4B-IT');
  const [copiedId, setCopiedId] = useState(null);

  // Model selection (composer dropdown): 'auto' lets the agent route.
  const [selectedModel, setSelectedModel] = useState('auto');
  const [availableModels, setAvailableModels] = useState([]);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  // File upload & NotebookLM citation states
  const [attachedFile, setAttachedFile] = useState(null); // { type, file, name, size, previewUrl, base64Data, mediaType, status, documentId, chunks, error }
  const [activeCitation, setActiveCitation] = useState(null); // { citation, index }
  const fileInputRef = useRef(null);

  // Settings & i18n state
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem('vault_theme') || 'light');
  const [currentLang, setCurrentLang] = useState(() => localStorage.getItem('vault_lang') || 'en');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const t = I18N[currentLang] || I18N.en;
  const chatBottomRef = useRef(null);
  const inputRef = useRef(null);
  const settingsPopoverRef = useRef(null);
  const modelDropdownRef = useRef(null);
  // Tracks which chat's messages are currently loaded, so programmatic
  // navigation to a freshly-created chat does not wipe pending messages.
  const loadedChatIdRef = useRef(null);

  // Apply Theme
  const applyTheme = (theme) => {
    setCurrentTheme(theme);
    localStorage.setItem('vault_theme', theme);
    const root = document.documentElement;
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', isDark);
      root.classList.toggle('light', !isDark);
    } else {
      root.classList.toggle('dark', theme === 'dark');
      root.classList.toggle('light', theme === 'light');
    }
  };

  // Language Change
  const switchLang = (lang) => {
    if (I18N[lang]) {
      setCurrentLang(lang);
      localStorage.setItem('vault_lang', lang);
    }
  };

  // Close settings popover on external click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (settingsPopoverRef.current && !settingsPopoverRef.current.contains(e.target)) {
        setIsSettingsOpen(false);
      }
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target)) {
        setIsModelDropdownOpen(false);
      }
    };
    if (isSettingsOpen || isModelDropdownOpen) {
      document.addEventListener('click', handleOutsideClick);
    }
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isSettingsOpen, isModelDropdownOpen]);

  // Initial Theme & Backend Health Verification
  useEffect(() => {
    applyTheme(currentTheme);

    const checkSystem = async () => {
      const health = await getSystemHealth();
      if (health && health.status === 'healthy') {
        setBackendStatus('healthy');
        const models = await getModelsHealth();
        if (models && models.models) {
          const gen = models.models.find(m => m.name === 'general');
          if (gen && gen.status === 'available') {
            setModelStatus('Gemma-3-4B-IT (Local llama.cpp:8080)');
          }
        }
      } else {
        setBackendStatus('offline');
      }
    };

    checkSystem();
    const interval = setInterval(checkSystem, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load available models for the composer dropdown
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const catalog = await listModelCatalog();
        const models = (catalog?.models || []).filter((m) => m.enabled !== false);
        if (!cancelled) setAvailableModels(models);
      } catch (err) {
        console.warn('[Chat] Failed to load model catalog', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load chat history on chatId change
  useEffect(() => {
    if (chatId) {
      // We already hold this chat's messages (e.g. we just created it),
      // so don't reload from storage and clobber unsaved/pending messages.
      if (loadedChatIdRef.current === chatId) return;
      try {
        const stored = JSON.parse(localStorage.getItem(`vault_chat_${chatId}`) || '[]');
        setMessages(stored);
        loadedChatIdRef.current = chatId;
      } catch (e) {
        console.error('Failed to load chat messages', e);
        setMessages([]);
        loadedChatIdRef.current = chatId;
      }
    } else {
      setMessages([]);
      loadedChatIdRef.current = null;
    }
  }, [chatId]);

  // Save chat history on messages change
  useEffect(() => {
    if (chatId && messages.length > 0) {
      try {
        const messagesToSave = messages.map(m => {
          if (m.attachment?.type === 'image') {
            return {
              ...m,
              attachment: {
                ...m.attachment,
                base64Data: undefined,
                previewUrl: undefined
              }
            };
          }
          return m;
        });
        localStorage.setItem(`vault_chat_${chatId}`, JSON.stringify(messagesToSave));
      } catch (err) {
        console.warn('Failed to save chat to localStorage (quota exceeded?)', err);
      }
    }
  }, [messages, chatId]);

  // Auto-scroll chat to latest message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending, statusText]);

  // Format timestamp
  const getTimestamp = () => {
    const d = new Date();
    return d.toTimeString().slice(0, 8);
  };

  // Copy response handler
  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Download a generated approval-note DOCX for a chat message
  const handleDownloadNote = async (documentId) => {
    try {
      const blob = await downloadApprovalNote(documentId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'approval_note.docx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[Chat] Approval-note download failed:', err);
    }
  };

  // Handle attachment file selection (Images and Documents)
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so re-selecting same file triggers change
    e.target.value = '';

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        const base64Data = dataUrl.split(',')[1];
        setAttachedFile({
          type: 'image',
          file,
          name: file.name,
          size: file.size,
          previewUrl: dataUrl,
          base64Data,
          mediaType: file.type || 'image/png',
          status: 'ready',
        });
      };
      reader.readAsDataURL(file);
    } else {
      // Document upload (.pdf, .docx, .txt)
      setAttachedFile({
        type: 'document',
        file,
        name: file.name,
        size: file.size,
        status: 'uploading',
      });

      try {
        const res = await uploadDocumentFile(file);
        const docId = res.document_id;
        
        setAttachedFile((prev) =>
          prev && prev.name === file.name
            ? {
              ...prev,
              status: 'uploading',
              documentId: docId,
            }
            : prev
        );

        const pollInterval = setInterval(async () => {
          try {
            const statusRes = await pollDocumentStatus(docId);
            const status = (statusRes.status || '').toLowerCase();
            if (status === 'ready') {
              clearInterval(pollInterval);
              setAttachedFile((prev) =>
                prev && prev.name === file.name
                  ? {
                    ...prev,
                    status: 'ready',
                    chunks: statusRes.chunk_count,
                    pageCount: statusRes.page_count,
                  }
                  : prev
              );
            } else if (status === 'failed') {
              clearInterval(pollInterval);
              setAttachedFile((prev) =>
                prev && prev.name === file.name
                  ? {
                    ...prev,
                    status: 'error',
                    error: 'Ingestion failed',
                  }
                  : prev
              );
            }
          } catch (e) {
            clearInterval(pollInterval);
          }
        }, 2000);

      } catch (err) {
        console.error('[Upload] Document upload error:', err);
        setAttachedFile((prev) =>
          prev && prev.name === file.name
            ? {
              ...prev,
              status: 'error',
              error: err.message || 'Ingestion failed',
            }
            : prev
        );
      }
    }
  };

  // Remove current attachment
  const handleRemoveAttachment = () => {
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Edit prompt: loads the turn's prompt back into the composer
  const handleEdit = (msg) => {
    const msgIndex = messages.findIndex((m) => m.id === msg.id);
    let promptText = '';
    for (let i = msgIndex - 1; i >= 0; i--) {
      if (messages[i].role === 'operator') {
        promptText = messages[i].text;
        break;
      }
    }
    setInputValue(promptText || msg.text || '');
    inputRef.current?.focus();
  };

  // Regenerate response for this turn
  const handleRegenerate = (msg) => {
    const msgIndex = messages.findIndex((m) => m.id === msg.id);
    let promptText = '';
    let attachment = null;
    for (let i = msgIndex - 1; i >= 0; i--) {
      if (messages[i].role === 'operator') {
        promptText = messages[i].text;
        attachment = messages[i].attachment;
        break;
      }
    }
    if (!promptText) return;
    setMessages((prev) => prev.filter((m) => m.id !== msg.id));
    handleSendMessage(promptText, attachment);
  };

  // Branch conversation at this turn
  const handleBranch = (msg) => {
    const msgIndex = messages.findIndex((m) => m.id === msg.id);
    const branchNotice = {
      id: `branch-${Date.now()}`,
      role: 'system_notice',
      time: getTimestamp(),
      text: `â‘‚ Forked session branch from turn #${Math.floor(msgIndex / 2) + 1}. Context checkpoint saved.`,
    };
    setMessages((prev) => [...prev.slice(0, msgIndex + 1), branchNotice]);
  };

  // Delete message
  const handleDelete = (msgId) => {
    setMessages((prev) => prev.filter((m) => m.id !== msgId));
  };

  // Send message
  const handleSendMessage = async (textToSend, customAttachment = null) => {
    const query = (textToSend ?? inputValue).trim();
    const attachmentToUse = customAttachment ?? attachedFile;
    if ((!query && !attachmentToUse) || isSending) return;

    const finalQuery =
      query ||
      (attachmentToUse?.type === 'image'
        ? 'Describe and analyze this image in detail.'
        : 'Summarize and extract key findings from this document.');

    setInputValue('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'operator',
      time: getTimestamp(),
      text: finalQuery,
      attachment: attachmentToUse ? { ...attachmentToUse } : null,
    };

    let currentChatId = chatId;
    if (!currentChatId) {
      currentChatId = Date.now().toString();
      // Claim this chat id before navigating so the load-history effect
      // (which fires when the URL param changes) doesn't wipe our messages.
      loadedChatIdRef.current = currentChatId;
      const chats = JSON.parse(localStorage.getItem('vault_chats') || '[]');
      chats.push({ id: currentChatId, title: finalQuery.slice(0, 30) + '...', timestamp: Date.now() });
      localStorage.setItem('vault_chats', JSON.stringify(chats));
      window.dispatchEvent(new Event('vault_chats_updated'));
      navigate(`/chat/${currentChatId}`, { replace: true });
    }

    setMessages((prev) => [...prev, userMsg]);
    setIsSending(true);
    setStatusText(
      attachmentToUse?.type === 'image'
        ? 'Analyzing image with local Gemma 3 vision...'
        : attachmentToUse?.type === 'document'
          ? 'Searching & citing document in local enclave...'
          : 'Routing task through agent pipeline...'
    );

    if (!customAttachment) {
      setAttachedFile(null);
    }

    try {
      // ---- Agent intent routing --------------------------------------
      // With a document attached, first ask the backend agent layer whether
      // this is an approval-note request. If so, run the full workflow and
      // render the note + Download DOCX inline. Otherwise fall through to
      // normal streaming RAG chat.
      if (attachmentToUse?.type === 'document' && attachmentToUse.documentId) {
        setStatusText('Routing through sovereign agent (intent detection)...');
        try {
          const agentRes = await runAgentChat(finalQuery, attachmentToUse.documentId);
          if (agentRes.intent === 'approval_note') {
            if (agentRes.result) {
              const r = agentRes.result;
              const noteMsg = {
                id: `vault-${Date.now()}`,
                role: 'vault',
                time: getTimestamp(),
                text: r.note_markdown || '',
                model: r.model || 'gemma-3-4b-it',
                mode: 'approval note',
                citations: r.citations || [],
                findings: r.findings,
                downloadUrl: r.download_url,
                documentId: r.document_id,
                steps: r.steps,
                runId: r.run_id,
              };
              setMessages((prev) => [...prev, noteMsg]);
            } else {
              setMessages((prev) => [
                ...prev,
                {
                  id: `vault-err-${Date.now()}`,
                  role: 'vault',
                  time: getTimestamp(),
                  text: `⚠️ ${agentRes.error || 'Could not generate the approval note.'}`,
                  isError: true,
                },
              ]);
            }
            setIsSending(false);
            setStatusText('');
            if (attachmentToUse?.file) {
              uploadToLibrary(attachmentToUse.file, 'chat').catch((e) =>
                console.warn('[Library] Background upload failed:', e)
              );
            }
            return;
          }
          // intent === 'qa' → fall through to streaming RAG below
        } catch (routeErr) {
          // Routing itself failed (network/infra) — degrade gracefully to RAG.
          console.warn('[Chat] Agent-chat routing failed, falling back to RAG:', routeErr);
        }
      }

      let options = { model: selectedModel };
      let finalPrompt = finalQuery;
      
      if (attachmentToUse?.type === 'image' && attachmentToUse.base64Data) {
        options = {
          ...options,
          images: [
            {
              base64_data: attachmentToUse.base64Data,
              media_type: attachmentToUse.mediaType || 'image/png',
            },
          ],
        };
      } else if (attachmentToUse?.type === 'document' && attachmentToUse.documentId) {
        options = {
          ...options,
          documentId: attachmentToUse.documentId,
          useRag: true,
        };
      } else {
        options.useRag = false; // standard chat if no file attached
      }

      setStatusText('Synthesizing verified response...');
      
      const assistantId = `vault-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: 'vault',
          time: getTimestamp(),
          text: '',
          model: selectedModel === 'auto' ? 'gemma-3-4b-it' : selectedModel,
          citations: [],
          mode: 'chat',
          startTime: Date.now(),
        }
      ]);
      
      await streamChat(
        finalPrompt,
        (chunk) => {
          setMessages((prev) => prev.map((m) => {
            if (m.id === assistantId) {
              return {
                ...m,
                text: m.text + (chunk.content || ''),
                citations: chunk.citations || m.citations,
                model: chunk.model_used || m.model,
                tokensUsed: chunk.tokens_used || m.tokensUsed,
                durationMs: chunk.total_time_ms || m.durationMs,
                tokensPerSecond: chunk.tokens_per_sec || m.tokensPerSecond,
              };
            }
            return m;
          }));
        },
        () => {
          setIsSending(false);
          setStatusText('');
          // Post-vision library upload: silently persist the file after the model responds
          if (attachmentToUse?.file) {
            const src = attachmentToUse.type === 'image' ? 'chat' : 'chat'
            uploadToLibrary(attachmentToUse.file, src).catch((e) =>
              console.warn('[Library] Background upload failed:', e)
            )
          }
        },
        (err) => {
          throw err;
        },
        options
      );

    } catch (err) {
      console.error('[Chat] Execution error:', err);
      const errorMsg = {
        id: `vault-err-${Date.now()}`,
        role: 'vault',
        time: getTimestamp(),
        text: `⚠️ Execution notice: Could not complete request through local enclave. (${err.message || 'Server unavailable'}). Please ensure backend and llama-server are running.`,
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
      setIsSending(false);
      setStatusText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="w-full h-screen flex flex-col relative bg-[#F7F6F2] dark:bg-[#000000] text-[#20211F] dark:text-[#E0E0E0] font-sans">

      {/* ========================================================
          MAIN CHAT CONTAINER
         ======================================================== */}
      <main className="flex-1 overflow-y-auto pt-8 pb-6 px-6 flex flex-col items-center select-text">
        <div className="w-full max-w-[780px] flex flex-col space-y-6">
          {/* Empty State when no messages */}
          {messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-center select-text">
              <div className="w-12 h-12 rounded-xl bg-[#176B5B]/10 dark:bg-[#176B5B]/20 text-[#176B5B] dark:text-[#4AF626] flex items-center justify-center mb-4 shadow-sm">
                <span className="material-symbols-outlined text-[28px]">terminal</span>
              </div>
              <h2 className="text-[17px] font-semibold text-[#20211F] dark:text-[#E0E0E0] mb-1.5">
                Sovereign AI Workbench
              </h2>
              <p className="text-[13px] text-[#77766F] dark:text-[#888888] max-w-[460px] leading-relaxed mb-6">
                Pure on-premise industrial intelligence. Zero external network telemetry. Powered by local Gemma 3 4B on llama-server.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full max-w-[640px]">
                <button
                  onClick={() => handleSendMessage('Review the inspection report and identify critical findings.')}
                  className="p-3 text-left rounded-lg bg-[#FFFFFF] dark:bg-[#0D0D0D] border border-[#E2DED5] dark:border-[#333333] hover:border-[#176B5B] transition-colors group shadow-sm"
                >
                  <span className="block text-[10.5px] font-mono text-[#176B5B] dark:text-[#4AF626] uppercase mb-1 font-semibold">
                    Analysis
                  </span>
                  <span className="text-[12.5px] text-[#20211F] dark:text-[#E0E0E0] font-medium leading-snug block">
                    Analyze document report & findings
                  </span>
                </button>

                <button
                  onClick={() => handleSendMessage('Search local knowledge for emergency isolation valve operating limits.')}
                  className="p-3 text-left rounded-lg bg-[#FFFFFF] dark:bg-[#0D0D0D] border border-[#E2DED5] dark:border-[#333333] hover:border-[#176B5B] transition-colors group shadow-sm"
                >
                  <span className="block text-[10.5px] font-mono text-[#176B5B] dark:text-[#4AF626] uppercase mb-1 font-semibold">
                    Knowledge Base
                  </span>
                  <span className="text-[12.5px] text-[#20211F] dark:text-[#E0E0E0] font-medium leading-snug block">
                    Query private indexed manuals
                  </span>
                </button>

                <button
                  onClick={() => handleSendMessage('write a python script for adding 2 numbers')}
                  className="p-3 text-left rounded-lg bg-[#FFFFFF] dark:bg-[#0D0D0D] border border-[#E2DED5] dark:border-[#333333] hover:border-[#176B5B] transition-colors group shadow-sm"
                >
                  <span className="block text-[10.5px] font-mono text-[#176B5B] dark:text-[#4AF626] uppercase mb-1 font-semibold">
                    Code Studio
                  </span>
                  <span className="text-[12.5px] text-[#20211F] dark:text-[#E0E0E0] font-medium leading-snug block">
                    Write verified Python script
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Message List */}
          <AnimatePresence initial={false}>
            {messages.map((m) => {
              if (m.role === 'system_notice') {
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full flex items-center justify-center my-3 select-none"
                  >
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAE7DF] dark:bg-[#1E201C] border border-[#DDD9CE] dark:border-[#30332B] text-[11px] font-mono text-[#77766F] dark:text-[#888888] shadow-sm">
                      <span className="text-[#176B5B] dark:text-[#4AF626] font-bold">â‘‚</span>
                      <span>{m.text}</span>
                      <span className="text-[9.5px] text-[#A09E96]">Â· {m.time}</span>
                    </div>
                  </motion.div>
                );
              }

              return m.role === 'operator' ? (
                /* USER / OPERATOR PROMPT (RIGHT SIDE) */
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-end self-end max-w-[85%] ml-auto space-y-1.5 select-text"
                >
                  <div className="flex items-center space-x-2 text-right">
                    <span className="font-mono text-[10px] text-[#A09E96] dark:text-[#888888]">
                      {m.time}
                    </span>
                    <span className="font-mono text-[11px] font-semibold text-[#77766F] dark:text-[#888888] tracking-wider uppercase">
                      {t.role_operator}
                    </span>
                  </div>

                  {/* Attachment Preview (Image or Document) in Operator Message */}
                  {m.attachment && (
                    <div className="mb-1 w-full flex justify-end">
                      {m.attachment.type === 'image' ? (
                        <div className="rounded-xl overflow-hidden border border-[#DDD9CE] dark:border-[#343830] max-w-[280px] bg-black/5 dark:bg-white/5 shadow-sm">
                          {m.attachment.previewUrl ? (
                            <img
                              src={m.attachment.previewUrl}
                              alt={m.attachment.name || 'Uploaded image'}
                              className="w-full h-auto object-cover max-h-[220px] rounded-t-xl"
                            />
                          ) : m.attachment.type === 'image' && (
                            <div className="w-full h-24 bg-[#efede7] dark:bg-[#0D0D0D] rounded-t-xl flex items-center justify-center text-sm text-[#8c8a81] border-b border-[#e2dfd7] dark:border-[#333333]">
                              [Image Attachment: {m.attachment.name || 'Original'}]
                            </div>
                          )}
                          <div className="p-2 bg-[#E8E6DE] dark:bg-[#1A1A1A] text-[11px] font-mono text-[#77766F] dark:text-[#888888] flex items-center justify-between">
                            <span className="truncate max-w-[190px]">{m.attachment.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#176B5B]/10 text-[#176B5B] dark:text-[#4AF626] font-semibold">
                              Vision Input
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#E0DDD3] dark:bg-[#1A1A1A] border border-[#DDD9CE] dark:border-[#343830] text-[12px] font-mono text-[#20211F] dark:text-[#E0E0E0] shadow-sm">
                          <div className="w-6 h-6 rounded bg-[#176B5B]/15 text-[#176B5B] dark:text-[#4AF626] flex items-center justify-center shrink-0">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 16 16">
                              <path d="M3 2h8l3 3v9H3z"></path>
                              <path d="M11 2v3h3"></path>
                            </svg>
                          </div>
                          <span className="font-medium truncate max-w-[220px]">{m.attachment.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#176B5B]/10 text-[#176B5B] dark:text-[#4AF626] font-semibold ml-1 shrink-0">
                            Indexed Document
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-[#E8E6DE] dark:bg-[#1A1A1A] text-[#20211F] dark:text-[#E0E0E0] px-4 py-2.5 rounded-2xl rounded-tr-sm border border-[#DDD9CE] dark:border-[#343830] shadow-sm text-[15px] leading-[1.6] text-left select-text">
                    {m.text}
                  </div>
                </motion.div>
              ) : (
                /* AI / VAULT RESPONSE (LEFT SIDE) */
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-start self-start w-full space-y-2 select-text"
                >
                  {/* Role Header */}
                  <div className="flex items-baseline space-x-2.5">
                    <span className="font-mono text-[11px] font-semibold tracking-wider uppercase text-[#176B5B] dark:text-[#4AF626]">
                      {t.role_vault}
                    </span>
                    <span className="font-mono text-[10px] text-[#A09E96] dark:text-[#888888]">
                      {m.time}
                    </span>
                    {m.taskType ? (
                      <span className="font-mono text-[10px] font-bold text-[#000000] dark:text-[#E0E0E0] bg-[#E2DED5] dark:bg-[#34362F] px-2 py-0.5 rounded uppercase">
                        {m.taskType}
                      </span>
                    ) : m.mode && m.mode !== 'agent' ? (
                      <span className="font-mono text-[10px] font-bold text-[#000000] dark:text-[#E0E0E0] bg-[#E2DED5] dark:bg-[#34362F] px-2 py-0.5 rounded uppercase">
                        {m.mode}
                      </span>
                    ) : null}
                  </div>

                  {/* Vault AI Response Container */}
                  <div className="w-full space-y-3.5 text-[15px] leading-[1.7] text-[#20211F] dark:text-[#E0E0E0] select-text">
                    {/* Main LLM generated body formatted with Markdown and Code highlighting */}
                    {m.text && (
                      <MarkdownMessage content={m.text} />
                    )}

                    {/* Approval-note deliverable: Download DOCX affordance */}
                    {m.mode === 'approval note' && m.documentId && (
                      <div className="mt-2 flex items-center gap-3 p-3 rounded-lg bg-[#F1F7F5] dark:bg-[#12211C] border border-[#D5EAE2] dark:border-[#284F44]">
                        <div className="w-8 h-8 rounded-md bg-[#176B5B]/15 text-[#176B5B] dark:text-[#4AF626] flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 16 16">
                            <path d="M3 2h8l3 3v9H3z"></path>
                            <path d="M11 2v3h3"></path>
                          </svg>
                        </div>
                        <div className="flex flex-col min-w-0 mr-auto">
                          <span className="text-[12.5px] font-semibold text-[#20211F] dark:text-[#E0E0E0]">
                            Approval Note (Word document)
                          </span>
                          <span className="text-[10.5px] font-mono text-[#77766F] dark:text-[#888888]">
                            Generated on-premise · grounded in {(m.citations || []).length} source{(m.citations || []).length === 1 ? '' : 's'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDownloadNote(m.documentId)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#176B5B] text-white text-[12px] font-medium hover:bg-[#13584B] active:scale-95 transition-all shadow-sm shrink-0"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 16 16">
                            <line x1="8" y1="2.5" x2="8" y2="11"></line>
                            <polyline points="4.5 7.5 8 11 11.5 7.5"></polyline>
                            <line x1="3" y1="13.5" x2="13" y2="13.5"></line>
                          </svg>
                          Download DOCX
                        </button>
                      </div>
                    )}

                    {/* Tool executions & verification trace */}
                    {m.toolCalls && m.toolCalls.length > 0 && (
                      <div className="mt-3 p-2.5 rounded bg-[#F0EEE8] dark:bg-[#1E201C] border border-[#E2DED5] dark:border-[#333333] space-y-1.5 text-[12px] font-mono select-text">
                        <span className="text-[#77766F] dark:text-[#888888] font-semibold uppercase text-[10.5px]">
                          Agentic Execution & Verifier Trace:
                        </span>
                        {m.toolCalls.map((tc, j) => (
                          <div key={j} className="flex items-center gap-2 text-[#20211F] dark:text-[#E0E0E0]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#176B5B]"></span>
                            <span>Tool: <b>{tc.tool}</b></span>
                            <span className="text-[#77766F]">â†’</span>
                            <span className={tc.success ? "text-[#176B5B]" : "text-[#D96B32]"}>
                              {tc.success ? `Result: ${JSON.stringify(tc.output ?? 'OK')}` : `Error: ${tc.error}`}
                            </span>
                            {tc.verification && (
                              <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-[#176B5B]/10 text-[#176B5B]">
                                {tc.verification}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* NotebookLM Clickable Source Citations */}
                    {m.citations && m.citations.length > 0 && (
                      <NotebookLMCitations
                        citations={m.citations}
                        onSelectCitation={(cite, idx) =>
                          setActiveCitation({ citation: cite, index: idx })
                        }
                      />
                    )}

                    {/* llama.cpp-style Message Footer (Pill, Metrics, Action Buttons) */}
                    {!m.isError && (
                      <div className="border-t border-[#E2DED5]/60 dark:border-[#333333]/60 pt-1">
                        <LlamaMessageFooter
                          message={m}
                          onCopy={handleCopy}
                          onEdit={handleEdit}
                          onRegenerate={handleRegenerate}
                          onBranch={handleBranch}
                          onDelete={handleDelete}
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>


          {/* Busy animation when generating */}
          {isSending && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2.5 pt-2 pl-0.5"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#176B5B] opacity-40"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#176B5B]"></span>
              </span>
              <span className="font-mono text-[12px] text-[#176B5B] dark:text-[#4AF626]">
                {statusText || 'Executing on-premise Gemma 3 inference...'}
              </span>
            </motion.div>
          )}

          <div ref={chatBottomRef} />
        </div>
      </main>

      {/* ========================================================
          FOOTER COMPOSER & ACTIONS
         ======================================================== */}
      <footer className="w-full flex flex-col items-center pb-6 pt-2 px-6 shrink-0 bg-[#F7F6F2] dark:bg-[#000000] z-30">
        <div className="w-full max-w-[780px] flex flex-col space-y-2.5">
          {/* Input Composer Box */}
          <div className="w-full bg-[#FFFFFF] dark:bg-[#0D0D0D] border border-[#E2DED5] dark:border-[#333333] rounded-[8px] p-3 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:border-[#176B5B]/50 focus-within:border-[#176B5B] focus-within:ring-1 focus-within:ring-[#176B5B]/30 transition-all">
            {/* Attached File/Image Preview Banner */}
            {attachedFile && (
              <div className="mb-2 p-2 rounded-lg bg-[#F1F7F5] dark:bg-[#1A1A1A] border border-[#D5EAE2] dark:border-[#333333] flex items-center justify-between animate-fade-in text-[12px] font-mono">
                <div className="flex items-center space-x-2.5 min-w-0">
                  {attachedFile.type === 'image' ? (
                    <div className="w-9 h-9 rounded-md overflow-hidden border border-[#176B5B]/40 shrink-0 bg-black/10">
                      <img
                        src={attachedFile.previewUrl}
                        alt={attachedFile.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-md bg-[#176B5B]/15 dark:bg-[#176B5B]/30 text-[#176B5B] dark:text-[#4AF626] flex items-center justify-center shrink-0 border border-[#176B5B]/30">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 16 16">
                        <path d="M3 2h8l3 3v9H3z"></path>
                        <path d="M11 2v3h3"></path>
                      </svg>
                    </div>
                  )}

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-[#20211F] dark:text-[#E0E0E0] truncate max-w-[280px]">
                        {attachedFile.name}
                      </span>
                      <span className="text-[10px] text-[#77766F] dark:text-[#888888]">
                        ({Math.round(attachedFile.size / 1024)} KB)
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10.5px]">
                      {attachedFile.type === 'image' ? (
                        <span className="text-[#176B5B] dark:text-[#4AF626] font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#176B5B] animate-pulse"></span>
                          Multimodal Vision Active (Local Gemma 3)
                        </span>
                      ) : attachedFile.status === 'uploading' ? (
                        <span className="text-[#D96B32] flex items-center gap-1 font-medium">
                          <span className="w-2.5 h-2.5 border-2 border-[#D96B32] border-t-transparent rounded-full animate-spin"></span>
                          Ingesting into Enclave Knowledge Base...
                        </span>
                      ) : attachedFile.status === 'ready' ? (
                        <span className="text-[#176B5B] dark:text-[#4AF626] font-semibold flex items-center gap-1">
                          âœ“ Indexed in Enclave ({attachedFile.chunks || 'ready'} chunks) Â· RAG Grounded
                        </span>
                      ) : (
                        <span className="text-red-500 font-medium">
                          âš  {attachedFile.error || 'Ingestion failed'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveAttachment}
                  className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-[#77766F] dark:text-[#888888] hover:text-[#20211F] dark:hover:text-[#ECEAE3] transition-colors ml-2"
                  title="Remove attachment"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 16 16">
                    <line x1="4" y1="4" x2="12" y2="12"></line>
                    <line x1="12" y1="4" x2="4" y2="12"></line>
                  </svg>
                </button>
              </div>
            )}

            <div className="min-h-[52px] px-2 pt-1 flex items-start">
              <textarea
                ref={inputRef}
                value={inputValue}
                rows={1}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isSending}
                className="w-full bg-transparent text-[15px] text-[#20211F] dark:text-[#E0E0E0] placeholder-[#A09E96] dark:placeholder-[#777970] outline-none font-normal resize-none overflow-hidden block py-1"
                id="composer-input"
                style={{ minHeight: '30px' }}
                placeholder={
                  isSending
                    ? 'Generating local inference...'
                    : attachedFile
                      ? `Ask a question about ${attachedFile.name}...`
                      : t.input_placeholder
                }
              />
            </div>

            <div className="flex items-center justify-between pt-2 px-1 border-t border-[#E2DED5] dark:border-[#333333] mt-1">
              <div className="flex items-center space-x-1.5">
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*,.pdf,.docx,.txt,.csv,.xlsx"
                  className="hidden"
                  id="chat-file-input"
                />

                {/* Attach File / Image Button (clip) */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-7 h-7 rounded-[5px] flex items-center justify-center text-[#77766F] dark:text-[#888888] hover:text-[#176B5B] dark:hover:text-[#4AF626] hover:bg-[#F0EEE8] dark:hover:bg-[#1A1A1A] transition-colors"
                  title="Attach image or document (.pdf, .docx, .txt)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 16 16">
                    <path d="M13.5 7.5l-6 6a3.5 3.5 0 0 1-5-5l6-6a2.5 2.5 0 0 1 3.5 3.5l-6 6a1.5 1.5 0 0 1-2.1-2.1l5.3-5.3"></path>
                  </svg>
                </button>

                <div className="h-3 w-[1px] bg-[#E2DED5] dark:bg-[#34362F] mx-1"></div>



                {attachedFile && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F1F7F5] dark:bg-[#1A1A1A] border border-[#E4F0EC] dark:border-[#333333] font-mono text-[11px] text-[#176B5B] dark:text-[#4AF626] tracking-tight truncate max-w-[220px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#176B5B]"></span>
                    {attachedFile.name}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-3">
                {/* Model Selection Dropdown */}
                <div className="relative inline-flex items-center" ref={modelDropdownRef}>
                  <button
                    type="button"
                    onClick={() => !isSending && setIsModelDropdownOpen(!isModelDropdownOpen)}
                    disabled={isSending}
                    title="Select model"
                    className="flex items-center justify-between min-w-[110px] max-w-[150px] bg-transparent border border-[#E2DED5] dark:border-[#333333] rounded-[5px] pl-2 pr-1.5 py-0.5 font-mono text-[11px] text-[#77766F] dark:text-[#888888] hover:text-[#176B5B] dark:hover:text-[#4AF626] hover:border-[#176B5B]/50 focus:outline-none focus:border-[#176B5B] cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="truncate mr-2 text-left">
                      {selectedModel === 'auto' ? 'Auto (route)' : (availableModels.find(m => m.key === selectedModel)?.display_name || selectedModel)}
                    </span>
                    <svg className={`w-3 h-3 shrink-0 transition-transform ${isModelDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 16 16">
                      <polyline points="4 6 8 10 12 6"></polyline>
                    </svg>
                  </button>

                  {isModelDropdownOpen && (
                    <div className="absolute bottom-[calc(100%+4px)] left-0 w-[160px] bg-[#FFFFFF] dark:bg-[#0D0D0D] border border-[#E2DED5] dark:border-[#333333] rounded-md shadow-lg py-1 z-50">
                      <button
                        type="button"
                        onClick={() => { setSelectedModel('auto'); setIsModelDropdownOpen(false); }}
                        className={`w-full text-left px-3 py-1.5 font-mono text-[11px] hover:bg-[#F0EEE8] dark:hover:bg-[#1A1A1A] ${selectedModel === 'auto' ? 'text-[#176B5B] dark:text-[#4AF626] bg-[#F8E9DF]/50 dark:bg-[#003300]/50' : 'text-[#20211F] dark:text-[#E0E0E0]'}`}
                      >
                        Auto (route)
                      </button>
                      {availableModels.map((m) => (
                        <button
                          key={m.key}
                          type="button"
                          onClick={() => { setSelectedModel(m.key); setIsModelDropdownOpen(false); }}
                          className={`w-full text-left px-3 py-1.5 font-mono text-[11px] hover:bg-[#F0EEE8] dark:hover:bg-[#1A1A1A] ${selectedModel === m.key ? 'text-[#176B5B] dark:text-[#4AF626] bg-[#F8E9DF]/50 dark:bg-[#003300]/50' : 'text-[#20211F] dark:text-[#E0E0E0]'}`}
                        >
                          {m.display_name || m.key}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span className="font-mono text-[10.5px] text-[#77766F] dark:text-[#888888] select-none">
                  {/* <span>{t.btn_return}</span> */}
                </span>
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={(!inputValue.trim() && !attachedFile) || isSending}
                  className={`w-7 h-7 rounded-[6px] flex items-center justify-center active:scale-95 transition-all shadow-sm ${(!inputValue.trim() && !attachedFile) || isSending
                    ? 'bg-[#176B5B]/40 text-white cursor-not-allowed'
                    : 'bg-[#176B5B] text-white hover:bg-[#13584B]'
                    }`}
                  title="Send query"
                >
                  {isSending ? (
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 16 16">
                      <line x1="8" x2="8" y1="12.5" y2="3.5"></line>
                      <polyline points="4.5 7 8 3.5 11.5 7"></polyline>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="flex items-center justify-center pt-0.5 border-t border-[#E2DED5] dark:border-[#333333] mt-1">
            <p className="font-mono text-[10.5px] text-[#A09E96] dark:text-[#888888] tracking-tight pt-1">
              {t.footer_note}
            </p>
          </div>
        </div>
      </footer>

      {/* ========================================================
          NOTEBOOKLM CITATION INSPECTION DRAWER
         ======================================================== */}
      {activeCitation && (
        <CitationDrawer
          citation={activeCitation.citation}
          citationIndex={activeCitation.index}
          onClose={() => setActiveCitation(null)}
        />
      )}
    </div>
  );
}
