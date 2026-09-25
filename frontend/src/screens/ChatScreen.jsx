import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  sendChatMessage,
  getSystemHealth,
  getModelsHealth,
  uploadAndIngestDocument,
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
    session_context: "Session #4821-C · Air-gapped enclave · Gemma-3-4B-IT (Local Llama.cpp)",
    role_operator: "Operator",
    role_vault: "Vault",
    msg_operator: "Review the inspection report and identify the findings that require immediate action.",
    msg_vault_title: "Three findings require immediate attention.",
    finding_1_bold: "Pressure anomaly detected",
    finding_1_body: "on Feedwater Pump 2B casing during cycle transition. Ultrasonic readings exceed baseline thresholds by 18.4%.",
    citation_1: "Inspection_Report.pdf · p.14",
    finding_2_bold: "Corrosion identified",
    finding_2_body: "in Secondary Heat Exchanger bypass flange weld seam. Wall thickness compromised past allowable metallurgical safety margin (3.2mm vs 4.0mm required).",
    citation_2: "Inspection_Report.pdf · p.22",
    finding_3_bold: "Inspection interval exceeded",
    finding_3_body: "for Turbine Isolation Relief Valve VR-408 by 42 days. Regulatory conformance mandates re-calibration prior to high-load startup.",
    citation_3: "Inspection_Report.pdf · p.31",
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
    footer_note: "Sovereign on-premise execution · Zero external telemetry · Hardware enclave active"
  },
  hi: {
    settings_title: "सेटिंग्स",
    settings_theme: "थीम",
    settings_lang: "भाषा",
    theme_light: "लाइट",
    theme_dark: "डार्क",
    theme_system: "सिस्टम",
    nav_chat: "चैट",
    nav_knowledge: "ज्ञान",
    nav_code: "कोड",
    nav_models: "मॉडल",
    nav_logs: "लॉग",
    badge_offline: "ऑफ़लाइन",
    session_context: "सत्र #4821-C · एयर-गैप्ड एन्क्लेव · Gemma-3-4B-IT (स्थानीय Llama.cpp)",
    role_operator: "ऑपरेटर",
    role_vault: "वॉल्ट",
    msg_operator: "निरीक्षण रिपोर्ट की समीक्षा करें और उन निष्कर्षों की पहचान करें जिन पर तत्काल कार्रवाई आवश्यक है।",
    msg_vault_title: "तीन निष्कर्षों पर तत्काल ध्यान देने की आवश्यकता है।",
    finding_1_bold: "दबाव विसंगति का पता चला",
    finding_1_body: "साइकिल संक्रमण के दौरान फीडवाटर पंप 2B आवरण पर। अल्ट्रासोनिक रीडिंग बेसलाइन सीमा से 18.4% अधिक है।",
    citation_1: "Inspection_Report.pdf · पृ.14",
    finding_2_bold: "संक्षारण की पहचान की गई",
    finding_2_body: "द्वितीयक हीट एक्सचेंजर बाईपास निकला हुआ किनारा वेल्ड सीम में। दीवार की मोटाई स्वीकार्य सुरक्षा सीमा से कम।",
    citation_2: "Inspection_Report.pdf · पृ.22",
    finding_3_bold: "निरीक्षण अंतराल समाप्त",
    finding_3_body: "टर्बाइन आइसोलेशन रिलीफ वाल्व VR-408 के लिए 42 दिन बीत चुके हैं।",
    citation_3: "Inspection_Report.pdf · पृ.31",
    recommendation_text: "सिफारिश: चक्र 08 प्रारंभ से पहले पंप 2B और वाल्व VR-408 के लिए रखरखाव कार्य आदेश जारी करें।",
    status_step1: "दस्तावेज़ पढ़ा जा रहा है",
    status_step2: "स्थानीय ज्ञान में खोज जारी",
    status_step3: "उत्तर तैयार किया जा रहा है",
    tokens_metric: "4,120 / 64k टोकन",
    quick_actions_label: "त्वरित कार्रवाइयां:",
    qa_analyze: "दस्तावेज़ का विश्लेषण",
    qa_search: "ज्ञान खोजें",
    qa_code: "कोड लिखें",
    input_placeholder: "Vault से पूछें...",
    attached_file: "Inspection_Report.pdf (संलग्न)",
    btn_return: "रिटर्न",
    footer_note: "संप्रभु ऑन-प्रिमाइसेस निष्पादन · शून्य बाहरी टेलीमेट्री · हार्डवेयर एन्क्लेव सक्रिय"
  },
  kn: {
    settings_title: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
    settings_theme: "ಥೀಮ್",
    settings_lang: "ಭಾಷೆ",
    theme_light: "ಲೈಟ್",
    theme_dark: "ಡಾರ್ಕ್",
    theme_system: "ಸಿಸ್ಟಮ್",
    nav_chat: "ಚಾಟ್",
    nav_knowledge: "ಜ್ಞಾನ",
    nav_code: "ಕೋಡ್",
    nav_models: "ಮಾದರಿಗಳು",
    nav_logs: "ಲಾಗ್‌ಗಳು",
    badge_offline: "ಆಫ್‌ಲೈನ್",
    session_context: "ಸೆಷನ್ #4821-C · ಏರ್-ಗ್ಯಾಪ್ಡ್ ಎನ್‌ಕ್ಲೇವ್ · Gemma-3-4B-IT (ಲೋಕಲ್ Llama.cpp)",
    role_operator: "ಆಪರೇಟರ್",
    role_vault: "ವಾಲ್ಟ್",
    msg_operator: "ಪರಿಶೀಲನಾ ವರದಿಯನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ತಕ್ಷಣ ಕ್ರಮ ಕೈಗೊಳ್ಳಬೇಕಾದ ಅಂಶಗಳನ್ನು ಗುರುತಿಸಿ.",
    msg_vault_title: "ಮೂರು ಅಂಶಗಳಿಗೆ ತಕ್ಷಣ ಗಮನ ನೀಡಬೇಕಾಗಿದೆ.",
    finding_1_bold: "ಒತ್ತಡದ ಅಸಹಜತೆ ಪತ್ತೆಯಾಗಿದೆ",
    finding_1_body: "ಸೈಕಲ್ ಪರಿವರ್ತನೆಯ ಸಮಯದಲ್ಲಿ ಫೀಡ್‌ವಾಟರ್ ಪಂಪ್ 2B ಕೇಸಿಂಗ್‌ನಲ್ಲಿ.",
    citation_1: "Inspection_Report.pdf · ಪು.14",
    finding_2_bold: "ತುಕ್ಕು ಪತ್ತೆಯಾಗಿದೆ",
    finding_2_body: "ದ್ವಿತೀಯ ಶಾಖ ವಿನಿಮಯಕಾರಕ ಬೈಪಾಸ್ ಫ್ಲೇಂಜ್ ವೆಲ್ಡ್ ಸೀಮ್‌ನಲ್ಲಿ.",
    citation_2: "Inspection_Report.pdf · ಪು.22",
    finding_3_bold: "ಪರಿಶೀಲನಾ ಅವಧಿ ಮೀರಿದೆ",
    finding_3_body: "ಟರ್ಬೈನ್ ಐಸೋಲೇಷನ್ ರಿಲೀಫ್ ವಾಲ್ವ್ VR-408 ಗಾಗಿ 42 ದಿನಗಳು ಕಳೆದಿವೆ.",
    citation_3: "Inspection_Report.pdf · ಪು.31",
    recommendation_text: "ಶಿಫಾರಸು: ಸೈಕಲ್ 08 ಪ್ರಾರಂಭಕ್ಕೆ ಮುಂಚಿತವಾಗಿ ನಿರ್ವಹಣಾ ಆದೇಶಗಳನ್ನು ನೀಡಿ.",
    status_step1: "ವರದಿಯನ್ನು ಓದಲಾಗುತ್ತಿದೆ",
    status_step2: "ಜ್ಞಾನ ನೆಲೆ ಹುಡುಕಲಾಗುತ್ತಿದೆ",
    status_step3: "ಪ್ರತಿಕ್ರಿಯೆ ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ",
    tokens_metric: "4,120 / 64k ಟೋಕನ್‌ಗಳು",
    quick_actions_label: "ತ್ವರಿತ ಕ್ರಿಯೆಗಳು:",
    qa_analyze: "ದಾಖಲೆಯನ್ನು ವಿಶ್ಲೇಷಿಸಿ",
    qa_search: "ಜ್ಞಾನ ಹುಡುಕಿ",
    qa_code: "ಕೋಡ್ ಬರೆಯಿರಿ",
    input_placeholder: "Vault ಅನ್ನು ಕೇಳಿ...",
    attached_file: "Inspection_Report.pdf (ಲಗತ್ತಿಸಲಾಗಿದೆ)",
    btn_return: "ರಿಟರ್ನ್",
    footer_note: "ಸಾರ್ವಭೌಮ ಆನ್-ಪ್ರಿಮೈಸ್ ಕಾರ್ಯಾಚರಣೆ · ಶೂನ್ಯ ಬಾಹ್ಯ ಟೆಲಿಮೆಟ್ರಿ · ಹಾರ್ಡ್‌ವೇರ್ ಎನ್‌ಕ್ಲೇವ್ ಸಕ್ರಿಯ"
  }
};

export default function ChatScreen({ onNavigate }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [totalTokens, setTotalTokens] = useState(0);
  const [backendStatus, setBackendStatus] = useState('checking'); // 'healthy' | 'offline' | 'checking'
  const [modelStatus, setModelStatus] = useState('Gemma-3-4B-IT');
  const [copiedId, setCopiedId] = useState(null);

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
    };
    if (isSettingsOpen) {
      document.addEventListener('click', handleOutsideClick);
    }
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isSettingsOpen]);

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
        const res = await uploadAndIngestDocument(file);
        setAttachedFile((prev) =>
          prev && prev.name === file.name
            ? {
                ...prev,
                status: 'ready',
                documentId: res.document_id,
                chunks: res.chunks,
                pageCount: res.page_count,
              }
            : prev
        );
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
      text: `⑂ Forked session branch from turn #${Math.floor(msgIndex / 2) + 1}. Context checkpoint saved.`,
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
    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'operator',
      time: getTimestamp(),
      text: finalQuery,
      attachment: attachmentToUse ? { ...attachmentToUse } : null,
    };

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
      let options = {};
      if (attachmentToUse?.type === 'image' && attachmentToUse.base64Data) {
        options = {
          images: [
            {
              base64_data: attachmentToUse.base64Data,
              media_type: attachmentToUse.mediaType || 'image/png',
            },
          ],
        };
      } else if (attachmentToUse?.type === 'document' && attachmentToUse.documentId) {
        options = {
          documentId: attachmentToUse.documentId,
          mode: 'knowledge',
        };
      }

      const response = await sendChatMessage(finalQuery, options);
      setStatusText('Synthesizing verified response...');

      const tokensUsed =
        response.tokensUsed || Math.max(1, Math.floor(response.text.length / 4));
      setTotalTokens((prev) => prev + tokensUsed);

      const vaultMsg = {
        id: `vault-${Date.now()}`,
        role: 'vault',
        time: getTimestamp(),
        text: response.text,
        model: response.model || 'gemma-3-4b-it',
        taskType: response.taskType,
        plan: response.plan,
        toolCalls: response.toolCalls,
        verification: response.verification,
        citations: response.citations,
        tokens: tokensUsed,
        tokensPerSecond: response.tokensPerSecond,
        promptTokens: response.promptTokens,
        completionTokens: response.completionTokens,
        durationMs: response.durationMs,
        mode: response.mode,
      };

      setMessages((prev) => [...prev, vaultMsg]);
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
    } finally {
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
    <div className="w-full h-screen flex flex-col relative bg-[#F7F6F2] dark:bg-[#151614] text-[#20211F] dark:text-[#ECEAE3] pl-16 font-sans">
      {/* ========================================================
          SIDEBAR NAVIGATION
         ======================================================== */}
      <aside className="group/sidebar fixed top-0 left-0 bottom-0 h-screen w-16 hover:w-56 bg-[#FFFFFF] dark:bg-[#1C1E1B] border-r border-[#E2DED5] dark:border-[#34362F] z-50 flex flex-col justify-between py-4 px-2.5 transition-all duration-200 ease-in-out shadow-sm overflow-hidden select-none">
        <div className="flex flex-col w-full gap-4">
          {/* Logo / Badge */}
          <div className="flex items-center gap-3 px-1.5 overflow-hidden">
            <div className="w-8 h-8 rounded bg-[#176B5B] flex items-center justify-center text-white font-semibold text-[14px] shrink-0 shadow-sm" title="VAULT SOV-01">
              <span className="w-2.5 h-2.5 bg-white rounded-[1px]"></span>
            </div>
            <div className="flex flex-col whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 min-w-0">
              <span className="font-mono text-[12px] font-semibold text-[#20211F] dark:text-[#ECEAE3] tracking-wide leading-tight truncate">
                VAULT SOV-01
              </span>
              <span className="font-mono text-[10px] text-[#77766F] dark:text-[#A6A69D] uppercase tracking-wider">
                AIR-GAP v4.19
              </span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="flex flex-col w-full gap-1.5 mt-2">
            <button
              onClick={() => onNavigate && onNavigate('chat')}
              className="relative flex items-center gap-3 h-10 px-2 rounded-md bg-[#F1F7F5] dark:bg-[#1B2925] text-[#176B5B] dark:text-[#38A18C] transition-colors whitespace-nowrap overflow-hidden text-left"
              title={t.nav_chat}
            >
              <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-[#176B5B] rounded-r"></span>
              <span className="material-symbols-outlined text-[20px] shrink-0">chat</span>
              <span className="text-[13.5px] font-semibold opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">
                {t.nav_chat}
              </span>
            </button>

            <button
              onClick={() => onNavigate && onNavigate('kb')}
              className="flex items-center gap-3 h-10 px-2 rounded-md text-[#77766F] dark:text-[#A6A69D] hover:text-[#20211F] dark:hover:text-[#ECEAE3] hover:bg-[#F0EEE8] dark:hover:bg-[#242620] transition-colors whitespace-nowrap overflow-hidden text-left"
              title={t.nav_knowledge}
            >
              <span className="material-symbols-outlined text-[20px] shrink-0">menu_book</span>
              <span className="text-[13.5px] font-medium opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">
                {t.nav_knowledge}
              </span>
            </button>

            <button
              onClick={() => onNavigate && onNavigate('code')}
              className="flex items-center gap-3 h-10 px-2 rounded-md text-[#77766F] dark:text-[#A6A69D] hover:text-[#20211F] dark:hover:text-[#ECEAE3] hover:bg-[#F0EEE8] dark:hover:bg-[#242620] transition-colors whitespace-nowrap overflow-hidden text-left"
              title={t.nav_code}
            >
              <span className="material-symbols-outlined text-[20px] shrink-0">code</span>
              <span className="text-[13.5px] font-medium opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">
                {t.nav_code}
              </span>
            </button>

            <button
              onClick={() => onNavigate && onNavigate('models')}
              className="flex items-center gap-3 h-10 px-2 rounded-md text-[#77766F] dark:text-[#A6A69D] hover:text-[#20211F] dark:hover:text-[#ECEAE3] hover:bg-[#F0EEE8] dark:hover:bg-[#242620] transition-colors whitespace-nowrap overflow-hidden text-left"
              title={t.nav_models}
            >
              <span className="material-symbols-outlined text-[20px] shrink-0">deployed_code</span>
              <span className="text-[13.5px] font-medium opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">
                {t.nav_models}
              </span>
            </button>

            <button
              onClick={() => onNavigate && onNavigate('logs')}
              className="flex items-center gap-3 h-10 px-2 rounded-md text-[#77766F] dark:text-[#A6A69D] hover:text-[#20211F] dark:hover:text-[#ECEAE3] hover:bg-[#F0EEE8] dark:hover:bg-[#242620] transition-colors whitespace-nowrap overflow-hidden text-left"
              title={t.nav_logs}
            >
              <span className="material-symbols-outlined text-[20px] shrink-0">receipt_long</span>
              <span className="text-[13.5px] font-medium opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">
                {t.nav_logs}
              </span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer: Health status & Settings Popover */}
        <div className="flex flex-col w-full gap-3">
          {/* Status Indicator */}
          <div
            className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-[#F0EEE8] dark:hover:bg-[#242620] transition-colors cursor-pointer overflow-hidden whitespace-nowrap"
            title={`Backend: ${backendStatus} · Model: ${modelStatus}`}
          >
            <div className="w-6 flex items-center justify-center shrink-0">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  backendStatus === 'healthy' ? 'bg-[#176B5B] animate-pulse' : 'bg-[#D96B32]'
                }`}
              ></span>
            </div>
            <div className="flex flex-col opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 min-w-0">
              <span className="font-mono text-[11px] text-[#176B5B] dark:text-[#38A18C] font-semibold uppercase tracking-wider leading-none">
                {backendStatus === 'healthy' ? 'CONNECTED' : t.badge_offline}
              </span>
              <span className="text-[11px] text-[#77766F] dark:text-[#A6A69D] leading-tight truncate">
                {backendStatus === 'healthy' ? 'Air-gapped safe' : 'Backend link standby'}
              </span>
            </div>
          </div>

          {/* Settings Trigger & Popover */}
          <div className="relative flex items-center" ref={settingsPopoverRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsSettingsOpen(!isSettingsOpen);
              }}
              className="w-full h-10 px-2 rounded-md flex items-center gap-3 text-[#77766F] dark:text-[#A6A69D] hover:text-[#20211F] dark:hover:text-[#ECEAE3] hover:bg-[#F0EEE8] dark:hover:bg-[#242620] border border-[#E2DED5] dark:border-[#34362F] transition-colors overflow-hidden whitespace-nowrap"
              title={t.settings_title}
            >
              <span className="material-symbols-outlined text-[20px] shrink-0">tune</span>
              <span className="text-[13.5px] font-medium opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">
                {t.settings_title}
              </span>
            </button>

            {/* Popover */}
            {isSettingsOpen && (
              <div className="absolute left-full bottom-0 ml-2 w-64 bg-[#FFFFFF] dark:bg-[#1C1E1B] border border-[#E2DED5] dark:border-[#34362F] rounded-lg shadow-xl p-3 z-50 flex flex-col gap-3 font-sans">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] text-[#77766F] dark:text-[#A6A69D] uppercase tracking-wider font-semibold">
                    {t.settings_theme}
                  </label>
                  <div className="grid grid-cols-3 gap-1 bg-[#F0EEE8] dark:bg-[#242620] p-1 rounded border border-[#E2DED5] dark:border-[#34362F]">
                    {['light', 'dark', 'system'].map((theme) => (
                      <button
                        key={theme}
                        onClick={() => applyTheme(theme)}
                        className={`text-[11.5px] py-1 rounded-[4px] font-medium transition-colors ${
                          currentTheme === theme
                            ? 'text-[#20211F] dark:text-[#ECEAE3] bg-[#FFFFFF] dark:bg-[#1C1E1B] shadow-sm'
                            : 'text-[#77766F] dark:text-[#A6A69D] hover:text-[#20211F] dark:hover:text-[#ECEAE3]'
                        }`}
                      >
                        {t[`theme_${theme}`] || theme}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] text-[#77766F] dark:text-[#A6A69D] uppercase tracking-wider font-semibold">
                    {t.settings_lang}
                  </label>
                  <div className="grid grid-cols-3 gap-1 bg-[#F0EEE8] dark:bg-[#242620] p-1 rounded border border-[#E2DED5] dark:border-[#34362F]">
                    {[
                      { code: 'en', label: 'EN' },
                      { code: 'hi', label: 'हिन्दी' },
                      { code: 'kn', label: 'ಕನ್ನಡ' },
                    ].map((item) => (
                      <button
                        key={item.code}
                        onClick={() => switchLang(item.code)}
                        className={`py-1 px-1.5 text-center text-[11.5px] font-medium rounded transition-colors ${
                          currentLang === item.code
                            ? 'bg-[#FFFFFF] dark:bg-[#1C1E1B] text-[#20211F] dark:text-[#ECEAE3] shadow-sm'
                            : 'text-[#77766F] dark:text-[#A6A69D] hover:text-[#20211F] dark:hover:text-[#ECEAE3]'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ========================================================
          MAIN CHAT CONTAINER
         ======================================================== */}
      <main className="flex-1 overflow-y-auto pt-8 pb-6 px-6 flex flex-col items-center select-text">
        <div className="w-full max-w-[780px] flex flex-col space-y-6">
          {/* Header Banner */}
          <div className="flex items-center justify-between pb-2 border-b border-[#E2DED5]/60 dark:border-[#34362F]/60">
            <span className="font-mono text-[11px] text-[#A09E96] dark:text-[#777970] tracking-wider uppercase">
              {t.session_context}
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#176B5B]/10 text-[#176B5B] dark:text-[#38A18C] border border-[#176B5B]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#176B5B] animate-pulse"></span>
              API: 127.0.0.1:8000
            </span>
          </div>

          {/* Empty State when no messages */}
          {messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-center select-text">
              <div className="w-12 h-12 rounded-xl bg-[#176B5B]/10 dark:bg-[#176B5B]/20 text-[#176B5B] dark:text-[#38A18C] flex items-center justify-center mb-4 shadow-sm">
                <span className="material-symbols-outlined text-[28px]">terminal</span>
              </div>
              <h2 className="text-[17px] font-semibold text-[#20211F] dark:text-[#ECEAE3] mb-1.5">
                Sovereign AI Enclave Ready
              </h2>
              <p className="text-[13px] text-[#77766F] dark:text-[#A6A69D] max-w-[460px] leading-relaxed mb-6">
                Pure on-premise industrial intelligence. Zero external network telemetry. Powered by local Gemma 3 4B on llama-server.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full max-w-[640px]">
                <button
                  onClick={() => handleSendMessage('Review the inspection report and identify critical findings.')}
                  className="p-3 text-left rounded-lg bg-[#FFFFFF] dark:bg-[#1C1E1B] border border-[#E2DED5] dark:border-[#34362F] hover:border-[#176B5B] transition-colors group shadow-sm"
                >
                  <span className="block text-[10.5px] font-mono text-[#176B5B] dark:text-[#38A18C] uppercase mb-1 font-semibold">
                    Analysis
                  </span>
                  <span className="text-[12.5px] text-[#20211F] dark:text-[#ECEAE3] font-medium leading-snug block">
                    Analyze document report & findings
                  </span>
                </button>

                <button
                  onClick={() => handleSendMessage('Search local knowledge for emergency isolation valve operating limits.')}
                  className="p-3 text-left rounded-lg bg-[#FFFFFF] dark:bg-[#1C1E1B] border border-[#E2DED5] dark:border-[#34362F] hover:border-[#176B5B] transition-colors group shadow-sm"
                >
                  <span className="block text-[10.5px] font-mono text-[#176B5B] dark:text-[#38A18C] uppercase mb-1 font-semibold">
                    Knowledge Base
                  </span>
                  <span className="text-[12.5px] text-[#20211F] dark:text-[#ECEAE3] font-medium leading-snug block">
                    Query private indexed manuals
                  </span>
                </button>

                <button
                  onClick={() => handleSendMessage('write a python script for adding 2 numbers')}
                  className="p-3 text-left rounded-lg bg-[#FFFFFF] dark:bg-[#1C1E1B] border border-[#E2DED5] dark:border-[#34362F] hover:border-[#176B5B] transition-colors group shadow-sm"
                >
                  <span className="block text-[10.5px] font-mono text-[#176B5B] dark:text-[#38A18C] uppercase mb-1 font-semibold">
                    Code Studio
                  </span>
                  <span className="text-[12.5px] text-[#20211F] dark:text-[#ECEAE3] font-medium leading-snug block">
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
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAE7DF] dark:bg-[#1E201C] border border-[#DDD9CE] dark:border-[#30332B] text-[11px] font-mono text-[#77766F] dark:text-[#A6A69D] shadow-sm">
                      <span className="text-[#176B5B] dark:text-[#38A18C] font-bold">⑂</span>
                      <span>{m.text}</span>
                      <span className="text-[9.5px] text-[#A09E96]">· {m.time}</span>
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
                    <span className="font-mono text-[10px] text-[#A09E96] dark:text-[#777970]">
                      {m.time}
                    </span>
                    <span className="font-mono text-[11px] font-semibold text-[#77766F] dark:text-[#A6A69D] tracking-wider uppercase">
                      {t.role_operator}
                    </span>
                  </div>

                  {/* Attachment Preview (Image or Document) in Operator Message */}
                  {m.attachment && (
                    <div className="mb-1 w-full flex justify-end">
                      {m.attachment.type === 'image' ? (
                        <div className="rounded-xl overflow-hidden border border-[#DDD9CE] dark:border-[#343830] max-w-[280px] bg-black/5 dark:bg-white/5 shadow-sm">
                          {m.attachment.previewUrl && (
                            <img
                              src={m.attachment.previewUrl}
                              alt={m.attachment.name || 'Uploaded image'}
                              className="w-full h-auto object-cover max-h-[220px] rounded-t-xl"
                            />
                          )}
                          <div className="p-2 bg-[#E8E6DE] dark:bg-[#252823] text-[11px] font-mono text-[#77766F] dark:text-[#A6A69D] flex items-center justify-between">
                            <span className="truncate max-w-[190px]">📷 {m.attachment.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#176B5B]/10 text-[#176B5B] dark:text-[#38A18C] font-semibold">
                              Vision Input
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#E0DDD3] dark:bg-[#252823] border border-[#DDD9CE] dark:border-[#343830] text-[12px] font-mono text-[#20211F] dark:text-[#ECEAE3] shadow-sm">
                          <div className="w-6 h-6 rounded bg-[#176B5B]/15 text-[#176B5B] dark:text-[#38A18C] flex items-center justify-center shrink-0">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 16 16">
                              <path d="M3 2h8l3 3v9H3z"></path>
                              <path d="M11 2v3h3"></path>
                            </svg>
                          </div>
                          <span className="font-medium truncate max-w-[220px]">{m.attachment.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#176B5B]/10 text-[#176B5B] dark:text-[#38A18C] font-semibold ml-1 shrink-0">
                            Indexed Document
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-[#E8E6DE] dark:bg-[#252823] text-[#20211F] dark:text-[#ECEAE3] px-4 py-2.5 rounded-2xl rounded-tr-sm border border-[#DDD9CE] dark:border-[#343830] shadow-sm text-[15px] leading-[1.6] text-left select-text">
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
                    <span className="font-mono text-[11px] font-semibold tracking-wider uppercase text-[#176B5B] dark:text-[#38A18C]">
                      {t.role_vault}
                    </span>
                    <span className="font-mono text-[10px] text-[#A09E96] dark:text-[#777970]">
                      {m.time}
                    </span>
                    {m.model && (
                      <span className="font-mono text-[9.5px] text-[#77766F] dark:text-[#A6A69D] bg-[#F0EEE8] dark:bg-[#242620] px-1.5 py-0.2 rounded">
                        {m.model}
                      </span>
                    )}
                    {m.mode && (
                      <span className="font-mono text-[9.5px] text-[#176B5B] dark:text-[#38A18C] bg-[#176B5B]/10 px-1.5 py-0.2 rounded uppercase">
                        {m.mode}
                      </span>
                    )}
                    {m.taskType && (
                      <span className="font-mono text-[9.5px] text-[#D96B32] bg-[#D96B32]/10 px-1.5 py-0.2 rounded uppercase">
                        task:{m.taskType}
                      </span>
                    )}
                  </div>

                  {/* Vault AI Response Container */}
                  <div className="w-full space-y-3.5 text-[15px] leading-[1.7] text-[#20211F] dark:text-[#ECEAE3] select-text">
                    {/* Main LLM generated body formatted with Markdown and Code highlighting */}
                    {m.text && (
                      <MarkdownMessage content={m.text} />
                    )}

                    {/* Tool executions & verification trace */}
                    {m.toolCalls && m.toolCalls.length > 0 && (
                      <div className="mt-3 p-2.5 rounded bg-[#F0EEE8] dark:bg-[#1E201C] border border-[#E2DED5] dark:border-[#34362F] space-y-1.5 text-[12px] font-mono select-text">
                        <span className="text-[#77766F] dark:text-[#A6A69D] font-semibold uppercase text-[10.5px]">
                          Agentic Execution & Verifier Trace:
                        </span>
                        {m.toolCalls.map((tc, j) => (
                          <div key={j} className="flex items-center gap-2 text-[#20211F] dark:text-[#ECEAE3]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#176B5B]"></span>
                            <span>Tool: <b>{tc.tool}</b></span>
                            <span className="text-[#77766F]">→</span>
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
                    <div className="border-t border-[#E2DED5]/60 dark:border-[#34362F]/60 pt-1">
                      <LlamaMessageFooter
                        message={m}
                        onCopy={handleCopy}
                        onEdit={handleEdit}
                        onRegenerate={handleRegenerate}
                        onBranch={handleBranch}
                        onDelete={handleDelete}
                      />
                    </div>
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
              <span className="font-mono text-[12px] text-[#176B5B] dark:text-[#38A18C]">
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
      <footer className="w-full flex flex-col items-center pb-6 pt-2 px-6 shrink-0 bg-[#F7F6F2] dark:bg-[#151614] z-30">
        <div className="w-full max-w-[780px] flex flex-col space-y-2.5">
          {/* Status Subtitle & Tokens Metric */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-2 font-mono text-[11px] text-[#77766F] dark:text-[#A6A69D]">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isSending ? 'bg-[#176B5B]' : 'bg-[#176B5B]/50'} opacity-40`}></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#176B5B]"></span>
              </span>
              <span>{isSending ? (statusText || 'Working...') : 'Air-gapped enclave ready'}</span>
              <span className="text-[#A09E96] dark:text-[#777970]">·</span>
              <span>Local llama-server :8080</span>
            </div>
            <span className="font-mono text-[10.5px] text-[#A09E96] dark:text-[#777970]">
              {totalTokens.toLocaleString()} / 64k tokens
            </span>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-4 px-1 pt-1">
            <span className="text-[12px] text-[#A09E96] dark:text-[#777970]">
              {t.quick_actions_label}
            </span>
            <button
              onClick={() => handleSendMessage('Review the inspection report and identify the findings that require immediate action.')}
              className="text-[12px] text-[#77766F] dark:text-[#A6A69D] hover:text-[#176B5B] dark:hover:text-[#38A18C] transition-colors underline-offset-4 hover:underline"
            >
              {t.qa_analyze}
            </button>
            <span className="text-[#E2DED5] dark:text-[#34362F] text-[10px]">/</span>
            <button
              onClick={() => handleSendMessage('Search local knowledge for emergency isolation valve operating limits and procedures.')}
              className="text-[12px] text-[#77766F] dark:text-[#A6A69D] hover:text-[#176B5B] dark:hover:text-[#38A18C] transition-colors underline-offset-4 hover:underline"
            >
              {t.qa_search}
            </button>
            <span className="text-[#E2DED5] dark:text-[#34362F] text-[10px]">/</span>
            <button
              onClick={() => handleSendMessage('Write a safe Python telemetry calculation script to evaluate pump vibration thresholds.')}
              className="text-[12px] text-[#77766F] dark:text-[#A6A69D] hover:text-[#176B5B] dark:hover:text-[#38A18C] transition-colors underline-offset-4 hover:underline"
            >
              {t.qa_code}
            </button>
          </div>

          {/* Input Composer Box */}
          <div className="w-full bg-[#FFFFFF] dark:bg-[#1C1E1B] border border-[#E2DED5] dark:border-[#34362F] rounded-[8px] p-3 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:border-[#176B5B]/50 focus-within:border-[#176B5B] focus-within:ring-1 focus-within:ring-[#176B5B]/30 transition-all">
            {/* Attached File/Image Preview Banner */}
            {attachedFile && (
              <div className="mb-2 p-2 rounded-lg bg-[#F1F7F5] dark:bg-[#1B2925] border border-[#D5EAE2] dark:border-[#28423C] flex items-center justify-between animate-fade-in text-[12px] font-mono">
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
                    <div className="w-9 h-9 rounded-md bg-[#176B5B]/15 dark:bg-[#176B5B]/30 text-[#176B5B] dark:text-[#38A18C] flex items-center justify-center shrink-0 border border-[#176B5B]/30">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 16 16">
                        <path d="M3 2h8l3 3v9H3z"></path>
                        <path d="M11 2v3h3"></path>
                      </svg>
                    </div>
                  )}

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-[#20211F] dark:text-[#ECEAE3] truncate max-w-[280px]">
                        {attachedFile.name}
                      </span>
                      <span className="text-[10px] text-[#77766F] dark:text-[#A6A69D]">
                        ({Math.round(attachedFile.size / 1024)} KB)
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10.5px]">
                      {attachedFile.type === 'image' ? (
                        <span className="text-[#176B5B] dark:text-[#38A18C] font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#176B5B] animate-pulse"></span>
                          Multimodal Vision Active (Local Gemma 3)
                        </span>
                      ) : attachedFile.status === 'uploading' ? (
                        <span className="text-[#D96B32] flex items-center gap-1 font-medium">
                          <span className="w-2.5 h-2.5 border-2 border-[#D96B32] border-t-transparent rounded-full animate-spin"></span>
                          Ingesting into Enclave Knowledge Base...
                        </span>
                      ) : attachedFile.status === 'ready' ? (
                        <span className="text-[#176B5B] dark:text-[#38A18C] font-semibold flex items-center gap-1">
                          ✓ Indexed in Enclave ({attachedFile.chunks || 'ready'} chunks) · RAG Grounded
                        </span>
                      ) : (
                        <span className="text-red-500 font-medium">
                          ⚠ {attachedFile.error || 'Ingestion failed'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveAttachment}
                  className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-[#77766F] dark:text-[#A6A69D] hover:text-[#20211F] dark:hover:text-[#ECEAE3] transition-colors ml-2"
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
              <input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSending}
                className="w-full bg-transparent text-[15px] text-[#20211F] dark:text-[#ECEAE3] placeholder-[#A09E96] dark:placeholder-[#777970] outline-none font-normal"
                id="composer-input"
                placeholder={
                  isSending
                    ? 'Generating local inference...'
                    : attachedFile
                    ? `Ask a question about ${attachedFile.name}...`
                    : t.input_placeholder
                }
                type="text"
              />
            </div>

            <div className="flex items-center justify-between pt-2 px-1 border-t border-[#E2DED5] dark:border-[#34362F] mt-1">
              <div className="flex items-center space-x-1.5">
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*,.pdf,.docx,.txt"
                  className="hidden"
                  id="chat-file-input"
                />

                {/* Upload File / Image Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-7 h-7 rounded-[5px] flex items-center justify-center text-[#77766F] dark:text-[#A6A69D] hover:text-[#176B5B] dark:hover:text-[#38A18C] hover:bg-[#F0EEE8] dark:hover:bg-[#242620] transition-colors"
                  title="Upload image or document (.pdf, .docx, .txt)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 16 16">
                    <path d="M13.5 7.5l-6 6a3.5 3.5 0 0 1-5-5l6-6a2.5 2.5 0 0 1 3.5 3.5l-6 6a1.5 1.5 0 0 1-2.1-2.1l5.3-5.3"></path>
                  </svg>
                </button>

                <button
                  type="button"
                  className="w-7 h-7 rounded-[5px] flex items-center justify-center text-[#77766F] dark:text-[#A6A69D] hover:text-[#20211F] dark:hover:text-[#ECEAE3] hover:bg-[#F0EEE8] dark:hover:bg-[#242620] transition-colors"
                  title="Tools & integrations"
                  onClick={() => onNavigate && onNavigate('models')}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 16 16">
                    <path d="M12.5 9.5l-6-6a2.12 2.12 0 0 0-3 3l6 6a2.12 2.12 0 0 0 3-3z"></path>
                    <line x1="10" x2="12" y1="4" y2="6"></line>
                    <line x1="2" x2="4" y1="14" y2="12"></line>
                  </svg>
                </button>

                <div className="h-3 w-[1px] bg-[#E2DED5] dark:bg-[#34362F] mx-1"></div>

                {attachedFile ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#F1F7F5] dark:bg-[#1B2925] border border-[#E4F0EC] dark:border-[#28423C] font-mono text-[11px] text-[#176B5B] dark:text-[#38A18C] tracking-tight rounded-full truncate max-w-[220px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#176B5B]"></span>
                    {attachedFile.name}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] hover:bg-[#F0EEE8] dark:hover:bg-[#242620] font-mono text-[11px] text-[#77766F] dark:text-[#A6A69D] tracking-tight transition-colors rounded-full"
                  >
                    <span>+ Attach file/image</span>
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <span className="font-mono text-[10.5px] text-[#77766F] dark:text-[#A6A69D] select-none">
                  ⏎ <span>{t.btn_return}</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={(!inputValue.trim() && !attachedFile) || isSending}
                  className={`w-7 h-7 rounded-[6px] flex items-center justify-center active:scale-95 transition-all shadow-sm ${
                    (!inputValue.trim() && !attachedFile) || isSending
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
          <div className="flex items-center justify-center pt-0.5 border-t border-[#E2DED5] dark:border-[#34362F] mt-1">
            <p className="font-mono text-[10.5px] text-[#A09E96] dark:text-[#777970] tracking-tight pt-1">
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
