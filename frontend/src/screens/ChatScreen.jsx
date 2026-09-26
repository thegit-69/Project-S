import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
    footer_note: "Sovereign on-premise execution Â· Zero external telemetry Â· Hardware enclave active"
  },
  hi: {
    settings_title: "à¤¸à¥‡à¤Ÿà¤¿à¤‚à¤—à¥à¤¸",
    settings_theme: "à¤¥à¥€à¤®",
    settings_lang: "à¤­à¤¾à¤·à¤¾",
    theme_light: "à¤²à¤¾à¤‡à¤Ÿ",
    theme_dark: "à¤¡à¤¾à¤°à¥à¤•",
    theme_system: "à¤¸à¤¿à¤¸à¥à¤Ÿà¤®",
    nav_chat: "à¤šà¥ˆà¤Ÿ",
    nav_knowledge: "à¤œà¥à¤žà¤¾à¤¨",
    nav_code: "à¤•à¥‹à¤¡",
    nav_models: "à¤®à¥‰à¤¡à¤²",
    nav_logs: "à¤²à¥‰à¤—",
    badge_offline: "à¤‘à¤«à¤¼à¤²à¤¾à¤‡à¤¨",
    session_context: "à¤¸à¤¤à¥à¤° #4821-C Â· à¤à¤¯à¤°-à¤—à¥ˆà¤ªà¥à¤¡ à¤à¤¨à¥à¤•à¥à¤²à¥‡à¤µ Â· Gemma-3-4B-IT (à¤¸à¥à¤¥à¤¾à¤¨à¥€à¤¯ Llama.cpp)",
    role_operator: "à¤‘à¤ªà¤°à¥‡à¤Ÿà¤°",
    role_vault: "à¤µà¥‰à¤²à¥à¤Ÿ",
    msg_operator: "à¤¨à¤¿à¤°à¥€à¤•à¥à¤·à¤£ à¤°à¤¿à¤ªà¥‹à¤°à¥à¤Ÿ à¤•à¥€ à¤¸à¤®à¥€à¤•à¥à¤·à¤¾ à¤•à¤°à¥‡à¤‚ à¤”à¤° à¤‰à¤¨ à¤¨à¤¿à¤·à¥à¤•à¤°à¥à¤·à¥‹à¤‚ à¤•à¥€ à¤ªà¤¹à¤šà¤¾à¤¨ à¤•à¤°à¥‡à¤‚ à¤œà¤¿à¤¨ à¤ªà¤° à¤¤à¤¤à¥à¤•à¤¾à¤² à¤•à¤¾à¤°à¥à¤°à¤µà¤¾à¤ˆ à¤†à¤µà¤¶à¥à¤¯à¤• à¤¹à¥ˆà¥¤",
    msg_vault_title: "à¤¤à¥€à¤¨ à¤¨à¤¿à¤·à¥à¤•à¤°à¥à¤·à¥‹à¤‚ à¤ªà¤° à¤¤à¤¤à¥à¤•à¤¾à¤² à¤§à¥à¤¯à¤¾à¤¨ à¤¦à¥‡à¤¨à¥‡ à¤•à¥€ à¤†à¤µà¤¶à¥à¤¯à¤•à¤¤à¤¾ à¤¹à¥ˆà¥¤",
    finding_1_bold: "à¤¦à¤¬à¤¾à¤µ à¤µà¤¿à¤¸à¤‚à¤—à¤¤à¤¿ à¤•à¤¾ à¤ªà¤¤à¤¾ à¤šà¤²à¤¾",
    finding_1_body: "à¤¸à¤¾à¤‡à¤•à¤¿à¤² à¤¸à¤‚à¤•à¥à¤°à¤®à¤£ à¤•à¥‡ à¤¦à¥Œà¤°à¤¾à¤¨ à¤«à¥€à¤¡à¤µà¤¾à¤Ÿà¤° à¤ªà¤‚à¤ª 2B à¤†à¤µà¤°à¤£ à¤ªà¤°à¥¤ à¤…à¤²à¥à¤Ÿà¥à¤°à¤¾à¤¸à¥‹à¤¨à¤¿à¤• à¤°à¥€à¤¡à¤¿à¤‚à¤— à¤¬à¥‡à¤¸à¤²à¤¾à¤‡à¤¨ à¤¸à¥€à¤®à¤¾ à¤¸à¥‡ 18.4% à¤…à¤§à¤¿à¤• à¤¹à¥ˆà¥¤",
    citation_1: "Inspection_Report.pdf Â· à¤ªà¥ƒ.14",
    finding_2_bold: "à¤¸à¤‚à¤•à¥à¤·à¤¾à¤°à¤£ à¤•à¥€ à¤ªà¤¹à¤šà¤¾à¤¨ à¤•à¥€ à¤—à¤ˆ",
    finding_2_body: "à¤¦à¥à¤µà¤¿à¤¤à¥€à¤¯à¤• à¤¹à¥€à¤Ÿ à¤à¤•à¥à¤¸à¤šà¥‡à¤‚à¤œà¤° à¤¬à¤¾à¤ˆà¤ªà¤¾à¤¸ à¤¨à¤¿à¤•à¤²à¤¾ à¤¹à¥à¤† à¤•à¤¿à¤¨à¤¾à¤°à¤¾ à¤µà¥‡à¤²à¥à¤¡ à¤¸à¥€à¤® à¤®à¥‡à¤‚à¥¤ à¤¦à¥€à¤µà¤¾à¤° à¤•à¥€ à¤®à¥‹à¤Ÿà¤¾à¤ˆ à¤¸à¥à¤µà¥€à¤•à¤¾à¤°à¥à¤¯ à¤¸à¥à¤°à¤•à¥à¤·à¤¾ à¤¸à¥€à¤®à¤¾ à¤¸à¥‡ à¤•à¤®à¥¤",
    citation_2: "Inspection_Report.pdf Â· à¤ªà¥ƒ.22",
    finding_3_bold: "à¤¨à¤¿à¤°à¥€à¤•à¥à¤·à¤£ à¤…à¤‚à¤¤à¤°à¤¾à¤² à¤¸à¤®à¤¾à¤ªà¥à¤¤",
    finding_3_body: "à¤Ÿà¤°à¥à¤¬à¤¾à¤‡à¤¨ à¤†à¤‡à¤¸à¥‹à¤²à¥‡à¤¶à¤¨ à¤°à¤¿à¤²à¥€à¤« à¤µà¤¾à¤²à¥à¤µ VR-408 à¤•à¥‡ à¤²à¤¿à¤ 42 à¤¦à¤¿à¤¨ à¤¬à¥€à¤¤ à¤šà¥à¤•à¥‡ à¤¹à¥ˆà¤‚à¥¤",
    citation_3: "Inspection_Report.pdf Â· à¤ªà¥ƒ.31",
    recommendation_text: "à¤¸à¤¿à¤«à¤¾à¤°à¤¿à¤¶: à¤šà¤•à¥à¤° 08 à¤ªà¥à¤°à¤¾à¤°à¤‚à¤­ à¤¸à¥‡ à¤ªà¤¹à¤²à¥‡ à¤ªà¤‚à¤ª 2B à¤”à¤° à¤µà¤¾à¤²à¥à¤µ VR-408 à¤•à¥‡ à¤²à¤¿à¤ à¤°à¤–à¤°à¤–à¤¾à¤µ à¤•à¤¾à¤°à¥à¤¯ à¤†à¤¦à¥‡à¤¶ à¤œà¤¾à¤°à¥€ à¤•à¤°à¥‡à¤‚à¥¤",
    status_step1: "à¤¦à¤¸à¥à¤¤à¤¾à¤µà¥‡à¤œà¤¼ à¤ªà¤¢à¤¼à¤¾ à¤œà¤¾ à¤°à¤¹à¤¾ à¤¹à¥ˆ",
    status_step2: "à¤¸à¥à¤¥à¤¾à¤¨à¥€à¤¯ à¤œà¥à¤žà¤¾à¤¨ à¤®à¥‡à¤‚ à¤–à¥‹à¤œ à¤œà¤¾à¤°à¥€",
    status_step3: "à¤‰à¤¤à¥à¤¤à¤° à¤¤à¥ˆà¤¯à¤¾à¤° à¤•à¤¿à¤¯à¤¾ à¤œà¤¾ à¤°à¤¹à¤¾ à¤¹à¥ˆ",
    tokens_metric: "4,120 / 64k à¤Ÿà¥‹à¤•à¤¨",
    quick_actions_label: "à¤¤à¥à¤µà¤°à¤¿à¤¤ à¤•à¤¾à¤°à¥à¤°à¤µà¤¾à¤‡à¤¯à¤¾à¤‚:",
    qa_analyze: "à¤¦à¤¸à¥à¤¤à¤¾à¤µà¥‡à¤œà¤¼ à¤•à¤¾ à¤µà¤¿à¤¶à¥à¤²à¥‡à¤·à¤£",
    qa_search: "à¤œà¥à¤žà¤¾à¤¨ à¤–à¥‹à¤œà¥‡à¤‚",
    qa_code: "à¤•à¥‹à¤¡ à¤²à¤¿à¤–à¥‡à¤‚",
    input_placeholder: "Vault à¤¸à¥‡ à¤ªà¥‚à¤›à¥‡à¤‚...",
    attached_file: "Inspection_Report.pdf (à¤¸à¤‚à¤²à¤—à¥à¤¨)",
    btn_return: "à¤°à¤¿à¤Ÿà¤°à¥à¤¨",
    footer_note: "à¤¸à¤‚à¤ªà¥à¤°à¤­à¥ à¤‘à¤¨-à¤ªà¥à¤°à¤¿à¤®à¤¾à¤‡à¤¸à¥‡à¤¸ à¤¨à¤¿à¤·à¥à¤ªà¤¾à¤¦à¤¨ Â· à¤¶à¥‚à¤¨à¥à¤¯ à¤¬à¤¾à¤¹à¤°à¥€ à¤Ÿà¥‡à¤²à¥€à¤®à¥‡à¤Ÿà¥à¤°à¥€ Â· à¤¹à¤¾à¤°à¥à¤¡à¤µà¥‡à¤¯à¤° à¤à¤¨à¥à¤•à¥à¤²à¥‡à¤µ à¤¸à¤•à¥à¤°à¤¿à¤¯"
  },
  kn: {
    settings_title: "à²¸à³†à²Ÿà³à²Ÿà²¿à²‚à²—à³â€Œà²—à²³à³",
    settings_theme: "à²¥à³€à²®à³",
    settings_lang: "à²­à²¾à²·à³†",
    theme_light: "à²²à³ˆà²Ÿà³",
    theme_dark: "à²¡à²¾à²°à³à²•à³",
    theme_system: "à²¸à²¿à²¸à³à²Ÿà²®à³",
    nav_chat: "à²šà²¾à²Ÿà³",
    nav_knowledge: "à²œà³à²žà²¾à²¨",
    nav_code: "à²•à³‹à²¡à³",
    nav_models: "à²®à²¾à²¦à²°à²¿à²—à²³à³",
    nav_logs: "à²²à²¾à²—à³â€Œà²—à²³à³",
    badge_offline: "à²†à²«à³â€Œà²²à³ˆà²¨à³",
    session_context: "à²¸à³†à²·à²¨à³ #4821-C Â· à²à²°à³-à²—à³à²¯à²¾à²ªà³à²¡à³ à²Žà²¨à³â€Œà²•à³à²²à³‡à²µà³ Â· Gemma-3-4B-IT (à²²à³‹à²•à²²à³ Llama.cpp)",
    role_operator: "à²†à²ªà²°à³‡à²Ÿà²°à³",
    role_vault: "à²µà²¾à²²à³à²Ÿà³",
    msg_operator: "à²ªà²°à²¿à²¶à³€à²²à²¨à²¾ à²µà²°à²¦à²¿à²¯à²¨à³à²¨à³ à²ªà²°à²¿à²¶à³€à²²à²¿à²¸à²¿ à²®à²¤à³à²¤à³ à²¤à²•à³à²·à²£ à²•à³à²°à²® à²•à³ˆà²—à³Šà²³à³à²³à²¬à³‡à²•à²¾à²¦ à²…à²‚à²¶à²—à²³à²¨à³à²¨à³ à²—à³à²°à³à²¤à²¿à²¸à²¿.",
    msg_vault_title: "à²®à³‚à²°à³ à²…à²‚à²¶à²—à²³à²¿à²—à³† à²¤à²•à³à²·à²£ à²—à²®à²¨ à²¨à³€à²¡à²¬à³‡à²•à²¾à²—à²¿à²¦à³†.",
    finding_1_bold: "à²’à²¤à³à²¤à²¡à²¦ à²…à²¸à²¹à²œà²¤à³† à²ªà²¤à³à²¤à³†à²¯à²¾à²—à²¿à²¦à³†",
    finding_1_body: "à²¸à³ˆà²•à²²à³ à²ªà²°à²¿à²µà²°à³à²¤à²¨à³†à²¯ à²¸à²®à²¯à²¦à²²à³à²²à²¿ à²«à³€à²¡à³â€Œà²µà²¾à²Ÿà²°à³ à²ªà²‚à²ªà³ 2B à²•à³‡à²¸à²¿à²‚à²—à³â€Œà²¨à²²à³à²²à²¿.",
    citation_1: "Inspection_Report.pdf Â· à²ªà³.14",
    finding_2_bold: "à²¤à³à²•à³à²•à³ à²ªà²¤à³à²¤à³†à²¯à²¾à²—à²¿à²¦à³†",
    finding_2_body: "à²¦à³à²µà²¿à²¤à³€à²¯ à²¶à²¾à²– à²µà²¿à²¨à²¿à²®à²¯à²•à²¾à²°à²• à²¬à³ˆà²ªà²¾à²¸à³ à²«à³à²²à³‡à²‚à²œà³ à²µà³†à²²à³à²¡à³ à²¸à³€à²®à³â€Œà²¨à²²à³à²²à²¿.",
    citation_2: "Inspection_Report.pdf Â· à²ªà³.22",
    finding_3_bold: "à²ªà²°à²¿à²¶à³€à²²à²¨à²¾ à²…à²µà²§à²¿ à²®à³€à²°à²¿à²¦à³†",
    finding_3_body: "à²Ÿà²°à³à²¬à³ˆà²¨à³ à²à²¸à³‹à²²à³‡à²·à²¨à³ à²°à²¿à²²à³€à²«à³ à²µà²¾à²²à³à²µà³ VR-408 à²—à²¾à²—à²¿ 42 à²¦à²¿à²¨à²—à²³à³ à²•à²³à³†à²¦à²¿à²µà³†.",
    citation_3: "Inspection_Report.pdf Â· à²ªà³.31",
    recommendation_text: "à²¶à²¿à²«à²¾à²°à²¸à³: à²¸à³ˆà²•à²²à³ 08 à²ªà³à²°à²¾à²°à²‚à²­à²•à³à²•à³† à²®à³à²‚à²šà²¿à²¤à²µà²¾à²—à²¿ à²¨à²¿à²°à³à²µà²¹à²£à²¾ à²†à²¦à³‡à²¶à²—à²³à²¨à³à²¨à³ à²¨à³€à²¡à²¿.",
    status_step1: "à²µà²°à²¦à²¿à²¯à²¨à³à²¨à³ à²“à²¦à²²à²¾à²—à³à²¤à³à²¤à²¿à²¦à³†",
    status_step2: "à²œà³à²žà²¾à²¨ à²¨à³†à²²à³† à²¹à³à²¡à³à²•à²²à²¾à²—à³à²¤à³à²¤à²¿à²¦à³†",
    status_step3: "à²ªà³à²°à²¤à²¿à²•à³à²°à²¿à²¯à³† à²¸à²¿à²¦à³à²§à²ªà²¡à²¿à²¸à²²à²¾à²—à³à²¤à³à²¤à²¿à²¦à³†",
    tokens_metric: "4,120 / 64k à²Ÿà³‹à²•à²¨à³â€Œà²—à²³à³",
    quick_actions_label: "à²¤à³à²µà²°à²¿à²¤ à²•à³à²°à²¿à²¯à³†à²—à²³à³:",
    qa_analyze: "à²¦à²¾à²–à²²à³†à²¯à²¨à³à²¨à³ à²µà²¿à²¶à³à²²à³‡à²·à²¿à²¸à²¿",
    qa_search: "à²œà³à²žà²¾à²¨ à²¹à³à²¡à³à²•à²¿",
    qa_code: "à²•à³‹à²¡à³ à²¬à²°à³†à²¯à²¿à²°à²¿",
    input_placeholder: "Vault à²…à²¨à³à²¨à³ à²•à³‡à²³à²¿...",
    attached_file: "Inspection_Report.pdf (à²²à²—à²¤à³à²¤à²¿à²¸à²²à²¾à²—à²¿à²¦à³†)",
    btn_return: "à²°à²¿à²Ÿà²°à³à²¨à³",
    footer_note: "à²¸à²¾à²°à³à²µà²­à³Œà²® à²†à²¨à³-à²ªà³à²°à²¿à²®à³ˆà²¸à³ à²•à²¾à²°à³à²¯à²¾à²šà²°à²£à³† Â· à²¶à³‚à²¨à³à²¯ à²¬à²¾à²¹à³à²¯ à²Ÿà³†à²²à²¿à²®à³†à²Ÿà³à²°à²¿ Â· à²¹à²¾à²°à³à²¡à³â€Œà²µà³‡à²°à³ à²Žà²¨à³â€Œà²•à³à²²à³‡à²µà³ à²¸à²•à³à²°à²¿à²¯"
  }
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

  // Load chat history on chatId change
  useEffect(() => {
    if (chatId) {
      try {
        const stored = JSON.parse(localStorage.getItem(`vault_chat_${chatId}`) || '[]');
        setMessages(stored);
      } catch (e) {
        console.error('Failed to load chat messages', e);
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  }, [chatId]);

  // Save chat history on messages change
  useEffect(() => {
    if (chatId && messages.length > 0) {
      localStorage.setItem(`vault_chat_${chatId}`, JSON.stringify(messages));
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
        selectionReason: response.selectionReason,
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
        text: `âš ï¸ Execution notice: Could not complete request through local enclave. (${err.message || 'Server unavailable'}). Please ensure backend and llama-server are running.`,
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
    <div className="w-full h-screen flex flex-col relative bg-[#F7F6F2] dark:bg-[#151614] text-[#20211F] dark:text-[#ECEAE3] font-sans">

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
                      <span className="text-[#176B5B] dark:text-[#38A18C] font-bold">â‘‚</span>
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
                            <span className="truncate max-w-[190px]">{m.attachment.name}</span>
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
                    {m.selectionReason && (
                      <span
                        className="text-[9.5px] text-[#176B5B] dark:text-[#38A18C] italic"
                        title={m.selectionReason}
                      >
                        · {m.selectionReason}
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
              <span className="text-[#A09E96] dark:text-[#777970]">Â·</span>
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
