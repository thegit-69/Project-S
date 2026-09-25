import { useEffect, useRef } from 'react'

export default function ChatScreen({ onNavigate }) {
  const rootRef = useRef(null)
  const navRef = useRef(onNavigate)
  navRef.current = onNavigate

  useEffect(() => {
    const root = rootRef.current;

      const i18n = {
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
          session_context: "Session #4821-C · Air-gapped enclave · Llama-3-70B-Sovereign",
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
          session_context: "सत्र #4821-C · एयर-गैप्ड एन्क्लेव · Llama-3-70B-Sovereign",
          role_operator: "ऑपरेटर",
          role_vault: "वॉल्ट",
          msg_operator: "निरीक्षण रिपोर्ट की समीक्षा करें और उन निष्कर्षों की पहचान करें जिन पर तत्काल कार्रवाई आवश्यक है।",
          msg_vault_title: "तीन निष्कर्षों पर तत्काल ध्यान देने की आवश्यकता है।",
          finding_1_bold: "दबाव विसंगति का पता चला",
          finding_1_body: "साइकिल संक्रमण के दौरान फीडवाटर पंप 2B आवरण पर। अल्ट्रासोनिक रीडिंग बेसलाइन सीमा से 18.4% अधिक है।",
          citation_1: "Inspection_Report.pdf · पृ.14",
          finding_2_bold: "संक्षारण की पहचान की गई",
          finding_2_body: "द्वितीयक हीट एक्सचेंजर बाईपास निकला हुआ किनारा वेल्ड सीम में। दीवार की मोटाई स्वीकार्य सुरक्षा सीमा से कम (3.2 मिमी बनाम 4.0 मिमी आवश्यक)।",
          citation_2: "Inspection_Report.pdf · पृ.22",
          finding_3_bold: "निरीक्षण अंतराल समाप्त",
          finding_3_body: "टर्बाइन आइसोलेशन रिलीफ वाल्व VR-408 के लिए 42 दिन बीत चुके हैं। हाई-लोड स्टार्टअप से पहले पुन: अंशांकन अनिवार्य है।",
          citation_3: "Inspection_Report.pdf · पृ.31",
          recommendation_text: "सिफारिश: चक्र 08 प्रारंभ से पहले पंप 2B और वाल्व VR-408 के लिए रखरखाव कार्य आदेश जारी करें। क्या आप चाहते हैं कि मैं प्राथमिकता वाले दोष प्रेषण का मसौदा तैयार करूँ?",
          status_step1: "inspection_report.pdf पढ़ा जा रहा है",
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
          session_context: "ಸೆಷನ್ #4821-C · ಏರ್-ಗ್ಯಾಪ್ಡ್ ಎನ್‌ಕ್ಲೇವ್ · Llama-3-70B-Sovereign",
          role_operator: "ಆಪರೇಟರ್",
          role_vault: "ವಾಲ್ಟ್",
          msg_operator: "ಪರಿಶೀಲನಾ ವರದಿಯನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ತಕ್ಷಣ ಕ್ರಮ ಕೈಗೊಳ್ಳಬೇಕಾದ ಅಂಶಗಳನ್ನು ಗುರುತಿಸಿ.",
          msg_vault_title: "ಮೂರು ಅಂಶಗಳಿಗೆ ತಕ್ಷಣ ಗಮನ ನೀಡಬೇಕಾಗಿದೆ.",
          finding_1_bold: "ಒತ್ತಡದ ಅಸಹಜತೆ ಪತ್ತೆಯಾಗಿದೆ",
          finding_1_body: "ಸೈಕಲ್ ಪರಿವರ್ತನೆಯ ಸಮಯದಲ್ಲಿ ಫೀಡ್‌ವಾಟರ್ ಪಂಪ್ 2B ಕೇಸಿಂಗ್‌ನಲ್ಲಿ. ಅಲ್ಟ್ರಾಸಾನಿಕ್ ವಾಚನಗಳು ಬೇಸ್‌ಲೈನ್ ಮಿತಿಗಿಂತ 18.4% ಹೆಚ್ಚಿವೆ.",
          citation_1: "Inspection_Report.pdf · ಪು.14",
          finding_2_bold: "ತುಕ್ಕು ಪತ್ತೆಯಾಗಿದೆ",
          finding_2_body: "ದ್ವಿತೀಯ ಶಾಖ ವಿನಿಮಯಕಾರಕ ಬೈಪಾಸ್ ಫ್ಲೇಂಜ್ ವೆಲ್ಡ್ ಸೀಮ್‌ನಲ್ಲಿ. ಗೋಡೆಯ ದಪ್ಪವು ಅನುಮತಿಸಲಾದ ಸುರಕ್ಷತಾ ಮಿತಿಗಿಂತ ಕಡಿಮೆಯಾಗಿದೆ (3.2mm ಬದಲಿಗೆ 4.0mm ಅಗತ್ಯವಿದೆ).",
          citation_2: "Inspection_Report.pdf · ಪು.22",
          finding_3_bold: "ಪರಿಶೀಲನಾ ಅವಧಿ ಮೀರಿದೆ",
          finding_3_body: "ಟರ್ಬೈನ್ ಐಸೋಲೇಷನ್ ರಿಲೀಫ್ ವಾಲ್ವ್ VR-408 ಗಾಗಿ 42 ದಿನಗಳು ಕಳೆದಿವೆ. ಹೈ-ಲೋಡ್ ಪ್ರಾರಂಭಕ್ಕೆ ಮುನ್ನ ಮರು-ಮಾಪನಾಂಕ ನಿರ್ಣಯ ಕಡ್ಡಾಯವಾಗಿದೆ.",
          citation_3: "Inspection_Report.pdf · ಪು.31",
          recommendation_text: "ಶಿಫಾರಸು: ಸೈಕಲ್ 08 ಪ್ರಾರಂಭಕ್ಕೆ ಮುಂಚಿತವಾಗಿ ಪಂಪ್ 2B ಮತ್ತು ವಾಲ್ವ್ VR-408 ಗಾಗಿ ನಿರ್ವಹಣಾ ಕಾರ್ಯ ಆದೇಶಗಳನ್ನು ನೀಡಿ. ಆದ್ಯತೆಯ ದೋಷ ರವಾನೆಗಳನ್ನು ನಾನು ಸಿದ್ಧಪಡಿಸಬೇಕೇ?",
          status_step1: "inspection_report.pdf ಓದಲಾಗುತ್ತಿದೆ",
          status_step2: "ಸ್ಥಳೀಯ ಜ್ಞಾನದಲ್ಲಿ ಹುಡುಕಲಾಗುತ್ತಿದೆ",
          status_step3: "ಪ್ರತಿಕ್ರಿಯೆಯನ್ನು ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ",
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

      let currentTheme = localStorage.getItem('vault_theme') || 'light';
      let currentLang = localStorage.getItem('vault_lang') || 'en';

      // Apply theme to DOM
      function applyThemeClass(isDark) {
        const root = document.documentElement;
        if (isDark) {
          root.classList.add('dark');
          root.classList.remove('light');
        } else {
          root.classList.remove('dark');
          root.classList.add('light');
        }
      }

      function updateThemeUI(theme) {
        const btns = {
          light: document.getElementById('theme-btn-light'),
          dark: document.getElementById('theme-btn-dark'),
          system: document.getElementById('theme-btn-system')
        };

        Object.keys(btns).forEach(key => {
          const btn = btns[key];
          if (!btn) return;
          if (key === theme) {
            btn.className = "text-[11.5px] py-1 rounded-[4px] font-medium transition-colors text-[#20211F] dark:text-[#ECEAE3] bg-[#FFFFFF] dark:bg-[#1C1E1B] shadow-sm";
          } else {
            btn.className = "text-[11.5px] py-1 rounded-[4px] font-medium transition-colors text-[#77766F] dark:text-[#A6A69D] hover:text-[#20211F] dark:hover:text-[#ECEAE3]";
          }
        });
      }

      function setTheme(theme) {
        currentTheme = theme;
        localStorage.setItem('vault_theme', theme);

        if (theme === 'system') {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          applyThemeClass(prefersDark);
        } else {
          applyThemeClass(theme === 'dark');
        }

        updateThemeUI(theme);
      }

      // System theme change listener
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (currentTheme === 'system') {
          applyThemeClass(e.matches);
        }
      });

      // Language management
      function setLanguage(lang) {
        if (!i18n[lang]) return;
        currentLang = lang;
        localStorage.setItem('vault_lang', lang);

        const strings = i18n[lang];

        // Update all text elements with data-key
        document.querySelectorAll('[data-key]').forEach(el => {
          const key = el.getAttribute('data-key');
          if (strings[key]) {
            el.textContent = strings[key];
          }
        });

        // Update composer placeholder
        const input = document.getElementById('composer-input');
        if (input && strings.input_placeholder) {
          input.placeholder = strings.input_placeholder;
        }

        // Update language select checkmarks and styling in popover
        ['en', 'hi', 'kn'].forEach(l => {
          const btn = document.getElementById(`lang-btn-${l}`);
          if (!btn) return;
          const check = btn.querySelector('.check-icon');
          if (l === lang) {
            btn.classList.add('bg-[#F0EEE8]', 'dark:bg-[#242620]', 'text-[#20211F]', 'dark:text-[#ECEAE3]');
            btn.classList.remove('text-[#77766F]', 'dark:text-[#A6A69D]');
            if (check) check.classList.remove('hidden');
          } else {
            btn.classList.remove('bg-[#F0EEE8]', 'dark:bg-[#242620]', 'text-[#20211F]', 'dark:text-[#ECEAE3]');
            btn.classList.add('text-[#77766F]', 'dark:text-[#A6A69D]');
            if (check) check.classList.add('hidden');
          }
        });
      }

      // Settings popover toggle
      const trigger = document.getElementById('settings-trigger');
      const popover = document.getElementById('settings-popover');

      let isPopoverOpen = false;

      function togglePopover(show) {
        isPopoverOpen = (show !== undefined) ? show : !isPopoverOpen;
        if (isPopoverOpen) {
          popover.classList.remove('popover-enter');
          popover.classList.add('popover-open');
          trigger.setAttribute('aria-expanded', 'true');
        } else {
          popover.classList.remove('popover-open');
          popover.classList.add('popover-enter');
          trigger.setAttribute('aria-expanded', 'false');
        }
      }

      if (trigger && popover) {
        trigger.addEventListener('click', (e) => {
          e.stopPropagation();
          togglePopover();
        });

        popover.addEventListener('click', (e) => {
          e.stopPropagation();
        });

        document.addEventListener('click', (e) => {
          if (isPopoverOpen && !popover.contains(e.target) && e.target !== trigger) {
            togglePopover(false);
          }
        });

        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && isPopoverOpen) {
            togglePopover(false);
          }
        });
      }

      // Initialize
      setTheme(currentTheme);
      setLanguage(currentLang);


        const TARGETS = [['chat', ['chat']], ['kb', ['knowledge']], ['code', ['code']], ['models', ['models']], ['logs', ['logs', 'activity']]]
        const sidebar = root.querySelector('aside')
        if (sidebar) {
          sidebar.querySelectorAll('a[href="#"]').forEach((a) => {
            const key = [a.id, a.dataset.path, a.dataset.i18nTitle, a.getAttribute('title'), a.getAttribute('aria-label'), a.textContent].join(' ').toLowerCase()
            const hit = TARGETS.find(([, words]) => words.some((w) => key.includes(w)))
            if (!hit) return
            a.addEventListener('click', (e) => { e.preventDefault(); navRef.current && navRef.current(hit[0]) })
          })
        }
        root.querySelectorAll('[data-onclick]').forEach((el) => {
          el.addEventListener('click', () => { eval(el.getAttribute('data-onclick')) })
        })
  }, [])

  return (
    <div ref={rootRef} className={"w-full h-screen flex flex-col select-none relative bg-[#F7F6F2] dark:bg-[#151614] text-[#20211F] dark:text-[#ECEAE3] pl-16"}>
      {" "}<aside className={"group/sidebar fixed top-0 left-0 bottom-0 h-screen w-16 hover:w-56 bg-card-bg border-r border-border-subtle z-50 flex flex-col justify-between py-4 px-2.5 transition-all duration-200 ease-in-out shadow-sm overflow-hidden select-none"}><div className={"flex flex-col w-full gap-4"}><div className={"flex items-center gap-3 px-1.5 overflow-hidden"}><div className={"w-8 h-8 rounded bg-[#176B5B] flex items-center justify-center text-white font-semibold text-[14px] shrink-0 shadow-sm"} title={"VAULT SOV-01"}><span className={"w-2.5 h-2.5 bg-white rounded-[1px]"}></span></div><div className={"flex flex-col whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 min-w-0"}><span className={"font-code-md text-code-md font-semibold text-text-primary tracking-wide leading-tight truncate"}>VAULT SOV-01</span><span className={"font-label-sm text-[10px] text-text-muted uppercase tracking-wider"}>AIR-GAP v4.19</span></div></div><nav className={"flex flex-col w-full gap-1.5 mt-2"}><a className={"relative flex items-center gap-3 h-10 px-2 rounded-md bg-accent-tint text-[#176B5B] transition-colors whitespace-nowrap overflow-hidden"} data-i18n-title={"nav_chat"} href={"#"} style={{"backgroundColor": "rgb(241, 247, 245)", "color": "rgb(23, 107, 91)"}} title={"Chat"}><span className={"absolute left-0 top-2 bottom-2 w-0.5 bg-[#176B5B] rounded-r"}></span><span className={"material-symbols-outlined text-[20px] shrink-0"}>chat</span><span className={"font-body-md text-body-md font-semibold opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 text-[#176B5B]"} data-i18n={"nav_chat"}>Chat</span></a><a className={"flex items-center gap-3 h-10 px-2 rounded-md text-text-muted hover:text-text-primary hover:bg-chip-bg transition-colors whitespace-nowrap overflow-hidden"} data-i18n-title={"nav_knowledge"} href={"#"} title={"Knowledge"}><span className={"material-symbols-outlined text-[20px] shrink-0"}>menu_book</span><span className={"font-body-md text-body-md font-medium opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200"} data-i18n={"nav_knowledge"}>Knowledge</span></a><a className={"flex items-center gap-3 h-10 px-2 rounded-md text-text-muted hover:text-text-primary hover:bg-chip-bg transition-colors whitespace-nowrap overflow-hidden"} data-i18n-title={"nav_code"} href={"#"} title={"Code"}><span className={"material-symbols-outlined text-[20px] shrink-0"}>code</span><span className={"font-body-md text-body-md font-medium opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200"} data-i18n={"nav_code"}>Code</span></a><a className={"flex items-center gap-3 h-10 px-2 rounded-md text-text-muted hover:text-text-primary hover:bg-chip-bg transition-colors whitespace-nowrap overflow-hidden"} data-i18n-title={"nav_models"} href={"#"} title={"Models"}><span className={"material-symbols-outlined text-[20px] shrink-0"}>deployed_code</span><span className={"font-body-md text-body-md font-medium opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200"} data-i18n={"nav_models"}>Models</span></a><a className={"flex items-center gap-3 h-10 px-2 rounded-md text-text-muted hover:text-text-primary hover:bg-chip-bg transition-colors whitespace-nowrap overflow-hidden"} data-i18n-title={"nav_logs"} href={"#"} title={"Logs"}><span className={"material-symbols-outlined text-[20px] shrink-0"}>receipt_long</span><span className={"font-body-md text-body-md font-medium opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200"} data-i18n={"nav_logs"}>Logs</span></a></nav></div><div className={"flex flex-col w-full gap-3"}><div className={"flex items-center gap-3 px-2 py-1.5 rounded hover:bg-chip-bg/50 transition-colors cursor-pointer overflow-hidden whitespace-nowrap"} title={"OFFLINE · Air-gapped environment"}><div className={"w-6 flex items-center justify-center shrink-0"}><span className={"w-2.5 h-2.5 rounded-full bg-[#176B5B] animate-pulse"}></span></div><div className={"flex flex-col opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 min-w-0"}><span className={"font-label-sm text-[11px] text-[#176B5B] font-semibold uppercase tracking-wider leading-none"} data-i18n={"badge_offline"}>OFFLINE</span><span className={"font-body-sm text-[11px] text-text-muted leading-tight truncate"}>Air-gapped safe</span></div></div><div className={"relative flex items-center"}><button aria-expanded={"false"} aria-haspopup={"true"} className={"w-full h-10 px-2 rounded-md flex items-center gap-3 text-text-muted hover:text-text-primary hover:bg-chip-bg border border-border-subtle transition-colors overflow-hidden whitespace-nowrap"} id={"settings-trigger"} title={"Settings"}><span className={"material-symbols-outlined text-[20px] shrink-0"}>tune</span><span className={"font-body-md text-body-md font-medium opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200"} data-i18n={"settings_btn"}>Settings</span></button><div className={"hidden absolute left-full bottom-0 ml-2 w-64 bg-card-bg border border-border-subtle rounded shadow-lg p-3 z-50 flex flex-col gap-3 font-sans transition-colors duration-180"} id={"settings-popover"}><div className={"flex flex-col gap-1.5"}><label className={"font-label-sm text-label-sm text-text-muted uppercase tracking-wider"} data-i18n={"theme_label"}>Theme</label><div className={"grid grid-cols-3 gap-1 bg-chip-bg p-1 rounded border border-border-subtle"} id={"theme-controls"}><button className={"py-1 px-2 text-label-sm font-label-sm uppercase rounded transition-colors"} data-theme={"light"}>Light</button><button className={"py-1 px-2 text-label-sm font-label-sm uppercase rounded transition-colors"} data-theme={"dark"}>Dark</button><button className={"py-1 px-2 text-label-sm font-label-sm uppercase rounded transition-colors"} data-theme={"system"}>System</button></div></div><div className={"flex flex-col gap-1.5"}><label className={"font-label-sm text-label-sm text-text-muted uppercase tracking-wider"} data-i18n={"lang_label"}>Language</label><div className={"grid grid-cols-3 gap-1 bg-chip-bg p-1 rounded border border-border-subtle"} id={"lang-controls"}><button className={"py-1 px-1.5 text-center text-label-sm font-medium rounded transition-colors"} data-lang={"en"}>EN</button><button className={"py-1 px-1.5 text-center text-body-sm font-medium rounded transition-colors"} data-lang={"hi"}>हिन्दी</button><button className={"py-1 px-1.5 text-center text-body-sm font-medium rounded transition-colors"} data-lang={"kn"}>ಕನ್ನಡ</button></div></div></div></div></div></aside>{" "}<main className={"flex-1 overflow-y-auto pt-10 pb-6 px-6 flex flex-col items-center"}>{" "}<div className={"w-full max-w-[760px] flex flex-col space-y-11"}>{" "}<div className={"flex items-center justify-center"}>{" "}<span className={"font-mono text-[11px] text-[#A09E96] dark:text-[#777970] tracking-wider uppercase"} data-key={"session_context"}>
      Session #4821-C · Air-gapped enclave · Llama-3-70B-Sovereign
      </span>{" "}</div>{" "}<div className={"flex flex-col space-y-2 pt-2"}>{" "}<div className={"flex items-baseline space-x-2.5"}>{" "}<span className={"font-mono text-[11px] font-medium text-[#77766F] dark:text-[#A6A69D] tracking-wider uppercase"} data-key={"role_operator"}>Operator</span>{" "}<span className={"font-mono text-[10px] text-[#A09E96] dark:text-[#777970]"}>14:28</span>{" "}</div>{" "}<p className={"text-[15.5px] leading-[1.6] text-[#20211F] dark:text-[#ECEAE3] font-normal pl-0.5"} data-key={"msg_operator"}>
      Review the inspection report and identify the findings that require immediate action.
      </p>{" "}</div>{" "}<div className={"flex flex-col space-y-3.5 pb-2"}>{" "}<div className={"flex items-baseline space-x-2.5"}>{" "}<span className={"font-mono text-[11px] font-medium text-[#77766F] dark:text-[#A6A69D] tracking-wider uppercase"} data-key={"role_vault"}>Vault</span>{" "}<span className={"font-mono text-[10px] text-[#A09E96] dark:text-[#777970]"}>14:28:12</span>{" "}</div>{" "}<div className={"space-y-4 text-[15px] leading-[1.7] text-[#20211F] dark:text-[#ECEAE3] pl-0.5"}>{" "}<p className={"font-semibold text-[15.5px] text-[#20211F] dark:text-[#ECEAE3]"} data-key={"msg_vault_title"}>
      Three findings require immediate attention.
      </p>{" "}<ol className={"space-y-4 pt-1 list-none"}>{" "}<li className={"flex items-start space-x-3 group"}>{" "}<span className={"font-mono text-[13px] text-[#77766F] dark:text-[#A6A69D] pt-[3px] select-none font-medium"}>1.</span>{" "}<div className={"space-y-1.5 flex-1"}>{" "}<p className={"text-[#20211F] dark:text-[#ECEAE3] leading-relaxed"} id={"finding-1-text"}>{" "}<strong className={"font-semibold text-[#20211F] dark:text-[#ECEAE3]"} data-key={"finding_1_bold"}>Pressure anomaly detected</strong>{" "}<span className={""} data-key={"finding_1_body"}>on Feedwater Pump 2B casing during cycle transition. Ultrasonic readings exceed baseline thresholds by 18.4%.</span>{" "}</p>{" "}<div className={"inline-flex items-center space-x-1.5 font-mono text-[11px] text-[#D96B32] bg-[#F0EEE8] dark:bg-[#242620] border border-[#E2DED5] dark:border-[#34362F] px-2 py-0.5 rounded-[5px] hover:border-[#D96B32] cursor-pointer transition-colors"} style={{"backgroundColor": "rgb(241, 247, 245)", "borderColor": "rgb(228, 240, 236)", "color": "rgb(23, 107, 91)"}}>{" "}<svg className={"w-3 h-3 text-[#D96B32]"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.5"} style={{"color": "rgb(23, 107, 91)"}} viewBox={"0 0 16 16"}>{" "}<path d={"M9.5 2.5H4a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6L9.5 2.5z"}></path>{" "}<polyline points={"9.5 2.5 9.5 6 13 6"}></polyline>{" "}</svg>{" "}<span className={""} data-key={"citation_1"}>Inspection_Report.pdf · p.14</span>{" "}</div>{" "}</div>{" "}</li>{" "}<li className={"flex items-start space-x-3 group"}>{" "}<span className={"font-mono text-[13px] text-[#77766F] dark:text-[#A6A69D] pt-[3px] select-none font-medium"}>2.</span>{" "}<div className={"space-y-1.5 flex-1"}>{" "}<p className={"text-[#20211F] dark:text-[#ECEAE3] leading-relaxed"} id={"finding-2-text"}>{" "}<strong className={"font-semibold text-[#20211F] dark:text-[#ECEAE3]"} data-key={"finding_2_bold"}>Corrosion identified</strong>{" "}<span className={""} data-key={"finding_2_body"}>in Secondary Heat Exchanger bypass flange weld seam. Wall thickness compromised past allowable metallurgical safety margin (3.2mm vs 4.0mm required).</span>{" "}</p>{" "}<div className={"inline-flex items-center space-x-1.5 font-mono text-[11px] text-[#D96B32] bg-[#F0EEE8] dark:bg-[#242620] border border-[#E2DED5] dark:border-[#34362F] px-2 py-0.5 rounded-[5px] hover:border-[#D96B32] cursor-pointer transition-colors"} style={{"backgroundColor": "rgb(241, 247, 245)", "borderColor": "rgb(228, 240, 236)", "color": "rgb(23, 107, 91)"}}>{" "}<svg className={"w-3 h-3 text-[#D96B32]"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.5"} style={{"color": "rgb(23, 107, 91)"}} viewBox={"0 0 16 16"}>{" "}<path d={"M9.5 2.5H4a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6L9.5 2.5z"}></path>{" "}<polyline points={"9.5 2.5 9.5 6 13 6"}></polyline>{" "}</svg>{" "}<span className={""} data-key={"citation_2"}>Inspection_Report.pdf · p.22</span>{" "}</div>{" "}</div>{" "}</li>{" "}<li className={"flex items-start space-x-3 group"}>{" "}<span className={"font-mono text-[13px] text-[#77766F] dark:text-[#A6A69D] pt-[3px] select-none font-medium"}>3.</span>{" "}<div className={"space-y-1.5 flex-1"}>{" "}<p className={"text-[#20211F] dark:text-[#ECEAE3] leading-relaxed"} id={"finding-3-text"}>{" "}<strong className={"font-semibold text-[#20211F] dark:text-[#ECEAE3]"} data-key={"finding_3_bold"}>Inspection interval exceeded</strong>{" "}<span className={""} data-key={"finding_3_body"}>for Turbine Isolation Relief Valve VR-408 by 42 days. Regulatory conformance mandates re-calibration prior to high-load startup.</span>{" "}</p>{" "}<div className={"inline-flex items-center space-x-1.5 font-mono text-[11px] text-[#D96B32] bg-[#F0EEE8] dark:bg-[#242620] border border-[#E2DED5] dark:border-[#34362F] px-2 py-0.5 rounded-[5px] hover:border-[#D96B32] cursor-pointer transition-colors"} style={{"backgroundColor": "rgb(241, 247, 245)", "borderColor": "rgb(228, 240, 236)", "color": "rgb(23, 107, 91)"}}>{" "}<svg className={"w-3 h-3 text-[#D96B32]"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.5"} style={{"color": "rgb(23, 107, 91)"}} viewBox={"0 0 16 16"}>{" "}<path d={"M9.5 2.5H4a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6L9.5 2.5z"}></path>{" "}<polyline points={"9.5 2.5 9.5 6 13 6"}></polyline>{" "}</svg>{" "}<span className={""} data-key={"citation_3"}>Inspection_Report.pdf · p.31</span>{" "}</div>{" "}</div>{" "}</li>{" "}</ol>{" "}<div className={"pt-3 border-t border-[#E2DED5] dark:border-[#34362F] mt-5"}>{" "}<p className={"text-[13.5px] text-[#77766F] dark:text-[#A6A69D] leading-relaxed"} data-key={"recommendation_text"}>
      Recommendation: Issue maintenance work orders for Pump 2B and Valve VR-408 before cycle 08 commencement. Would you like me to draft the priority defect dispatches?
      </p>{" "}</div>{" "}</div>{" "}<div className={"flex items-center space-x-4 pt-1 pl-0.5 text-[#77766F] dark:text-[#A6A69D]"}>{" "}<button className={"hover:text-[#20211F] dark:hover:text-[#ECEAE3] transition-colors p-1"} title={"Copy response"}>{" "}<svg className={"w-3.5 h-3.5"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.5"} viewBox={"0 0 16 16"}>{" "}<rect height={"8"} rx={"1.5"} width={"8"} x={"5.5"} y={"5.5"}></rect>{" "}<path d={"M3.5 10.5h-1a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1"}></path>{" "}</svg>{" "}</button>{" "}<button className={"hover:text-[#20211F] dark:hover:text-[#ECEAE3] transition-colors p-1"} title={"Export to report"}>{" "}<svg className={"w-3.5 h-3.5"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.5"} viewBox={"0 0 16 16"}>{" "}<path d={"M3 13h10M8 3v7m0 0l-2.5-2.5M8 10l2.5-2.5"}></path>{" "}</svg>{" "}</button>{" "}</div>{" "}</div>{" "}</div>{" "}</main>{" "}<footer className={"w-full flex flex-col items-center pb-6 pt-2 px-6 shrink-0 bg-[#F7F6F2] dark:bg-[#151614] z-30"}>{" "}<div className={"w-full max-w-[760px] flex flex-col space-y-2.5"}>{" "}<div className={"flex items-center justify-between px-1"}>{" "}<div className={"flex items-center space-x-2 font-mono text-[11px] text-[#77766F] dark:text-[#A6A69D]"}>{" "}<span className={"relative flex h-2 w-2"}>{" "}<span className={"animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D96B32] opacity-40"} style={{"backgroundColor": "rgb(23, 107, 91)"}}></span>{" "}<span className={"relative inline-flex rounded-full h-2 w-2 bg-[#D96B32]"} style={{"backgroundColor": "rgb(23, 107, 91)"}}></span>{" "}</span>{" "}<span className={"text-[#77766F] dark:text-[#A6A69D]"} data-key={"status_step1"}>Reading inspection_report.pdf</span>{" "}<span className={"text-[#A09E96] dark:text-[#777970]"}>·</span>{" "}<span className={"text-[#77766F] dark:text-[#A6A69D]"} data-key={"status_step2"}>Searching local knowledge</span>{" "}<span className={"text-[#A09E96] dark:text-[#777970]"}>·</span>{" "}<span className={"text-[#20211F] dark:text-[#ECEAE3] font-medium"} data-key={"status_step3"}>Preparing response</span>{" "}</div>{" "}<span className={"font-mono text-[10.5px] text-[#A09E96] dark:text-[#777970]"} data-key={"tokens_metric"}>
      4,120 / 64k tokens
      </span>{" "}</div>{" "}<div className={"flex items-center space-x-4 px-1 pt-1"}>{" "}<span className={"text-[12px] text-[#A09E96] dark:text-[#777970]"} data-key={"quick_actions_label"}>Quick actions:</span>{" "}<button className={"text-[12px] text-[#77766F] dark:text-[#A6A69D] hover:text-[#D96B32] dark:hover:text-[#D96B32] transition-colors underline-offset-4 hover:underline"} data-key={"qa_analyze"}>
      Analyze document
      </button>{" "}<span className={"text-[#E2DED5] dark:text-[#34362F] text-[10px]"}>/</span>{" "}<button className={"text-[12px] text-[#77766F] dark:text-[#A6A69D] hover:text-[#D96B32] dark:hover:text-[#D96B32] transition-colors underline-offset-4 hover:underline"} data-key={"qa_search"}>
      Search knowledge
      </button>{" "}<span className={"text-[#E2DED5] dark:text-[#34362F] text-[10px]"}>/</span>{" "}<button className={"text-[12px] text-[#77766F] dark:text-[#A6A69D] hover:text-[#D96B32] dark:hover:text-[#D96B32] transition-colors underline-offset-4 hover:underline"} data-key={"qa_code"}>
      Write code
      </button>{" "}</div>{" "}<div className={"w-full bg-[#FFFFFF] dark:bg-[#1C1E1B] border border-[#E2DED5] dark:border-[#34362F] rounded-[8px] p-3 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:border-[#D96B32]/40 focus-within:border-[#D96B32] focus-within:ring-1 focus-within:ring-[#D96B32]/30 transition-all composer-rounded-box"} style={{"backgroundColor": "rgb(240, 247, 238)"}}>{" "}<div className={"min-h-[52px] px-2 pt-1 flex items-start"}>{" "}<input className={"w-full bg-transparent text-[15px] text-[#20211F] dark:text-[#ECEAE3] placeholder-[#A09E96] dark:placeholder-[#777970] outline-none font-normal"} id={"composer-input"} placeholder={"Ask Vault..."} type={"text"} defaultValue={""} />{" "}</div>{" "}<div className={"flex items-center justify-between pt-2 px-1 border-t border-[#E2DED5] dark:border-[#34362F] mt-1"}>{" "}<div className={"flex items-center space-x-1.5"}>{" "}<button className={"w-7 h-7 rounded-[5px] flex items-center justify-center text-[#77766F] dark:text-[#A6A69D] hover:text-[#20211F] dark:hover:text-[#ECEAE3] hover:bg-[#F0EEE8] dark:hover:bg-[#242620] transition-colors"} title={"Attach file or document"}>{" "}<svg className={"w-4 h-4"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.6"} viewBox={"0 0 16 16"}>{" "}<line x1={"8"} x2={"8"} y1={"3"} y2={"13"}></line>{" "}<line x1={"3"} x2={"13"} y1={"8"} y2={"8"}></line>{" "}</svg>{" "}</button>{" "}<button className={"w-7 h-7 rounded-[5px] flex items-center justify-center text-[#77766F] dark:text-[#A6A69D] hover:text-[#20211F] dark:hover:text-[#ECEAE3] hover:bg-[#F0EEE8] dark:hover:bg-[#242620] transition-colors"} title={"Tools & integrations"}>{" "}<svg className={"w-3.5 h-3.5"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.5"} viewBox={"0 0 16 16"}>{" "}<path d={"M12.5 9.5l-6-6a2.12 2.12 0 0 0-3 3l6 6a2.12 2.12 0 0 0 3-3z"}></path>{" "}<line x1={"10"} x2={"12"} y1={"4"} y2={"6"}></line>{" "}<line x1={"2"} x2={"4"} y1={"14"} y2={"12"}></line>{" "}</svg>{" "}</button>{" "}<div className={"h-3 w-[1px] bg-[#E2DED5] dark:bg-[#34362F] mx-1"}></div>{" "}<span className={"inline-flex items-center px-2 py-0.5 rounded-[4px] bg-[#F0EEE8] dark:bg-[#242620] border border-[#E2DED5] dark:border-[#34362F] font-mono text-[11px] text-[#20211F] dark:text-[#ECEAE3] tracking-tight rounded-full"} data-key={"attached_file"}>
      Inspection_Report.pdf (attached)
      </span>{" "}</div>{" "}<div className={"flex items-center space-x-3"}>{" "}<span className={"font-mono text-[10.5px] text-[#77766F] dark:text-[#A6A69D] select-none"}>⏎ <span className={""} data-key={"btn_return"}>return</span></span>{" "}<button className={"w-7 h-7 rounded-[6px] bg-[#D96B32] text-[#FFFFFF] hover:bg-[#B95324] flex items-center justify-center active:scale-95 transition-all shadow-sm composer-send-btn"} style={{"backgroundColor": "rgb(23, 107, 91)"}} title={"Send query"}>{" "}<svg className={"w-3.5 h-3.5"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} viewBox={"0 0 16 16"}>{" "}<line x1={"8"} x2={"8"} y1={"12.5"} y2={"3.5"}></line>{" "}<polyline points={"4.5 7 8 3.5 11.5 7"}></polyline>{" "}</svg>{" "}</button>{" "}</div>{" "}</div>{" "}</div>{" "}<div className={"flex items-center justify-center pt-0.5 border-t border-[#E2DED5] dark:border-[#34362F] mt-1"}>{" "}<p className={"font-mono text-[10.5px] text-[#A09E96] dark:text-[#777970] tracking-tight pt-1"} data-key={"footer_note"}>
      Sovereign on-premise execution · Zero external telemetry · Hardware enclave active
      </p>{" "}</div>{" "}</div>{" "}</footer>{" "}
    </div>
  )
}
