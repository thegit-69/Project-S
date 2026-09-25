import { useEffect, useRef } from 'react'

export default function ModelsScreen({ onNavigate, hidden }) {
  const rootRef = useRef(null)
  const navRef = useRef(onNavigate)
  navRef.current = onNavigate

  useEffect(() => {
    const root = rootRef.current;

      // Translations Dictionary
      const translations = {
        en: {
          nav_chat: "Chat",
          nav_knowledge: "Knowledge",
          nav_code: "Code",
          nav_models: "Models",
          nav_logs: "Logs",
          badge_offline: "OFFLINE",
          settings_title: "PREFERENCES",
          settings_theme: "Theme",
          settings_lang: "Language",
          page_title: "Models",
          page_desc: "Local intelligence available to Vault.",
          btn_add_model: "+ ADD MODEL",
          autoroute_label: "AUTO ROUTING",
          autoroute_desc: "Vault automatically selects the appropriate local model for each query and pipeline task.",
          state_active: "ACTIVE",
          col_model: "MODEL",
          col_capability: "CAPABILITY",
          col_weights: "WEIGHTS",
          col_state: "STATE",
          state_ready: "READY",
          state_standby: "STANDBY",
          drawer_pane_title: "INSPECTION PANE",
          drawer_assigned_capabilities: "Assigned Capabilities",
          drawer_specifications: "Specifications",
          spec_context_window: "Context Window",
          drawer_runtime_status: "Runtime Status",
          runtime_state: "State",
          runtime_ready_warm: "READY / WARM",
          cap_1: "Code generation & refactoring",
          cap_2: "Static structural analysis",
          cap_3: "Autonomous error localization",
          cap_4: "Deterministic test synthesis",
          action_set_default: "SET AS DEFAULT CODER",
          action_verify_sha: "VERIFY SHA",
          action_unload: "UNLOAD"
        },
        hi: {
          nav_chat: "चैट",
          nav_knowledge: "ज्ञानकोष",
          nav_code: "कोड",
          nav_models: "मॉडल",
          nav_logs: "लॉग्स",
          badge_offline: "ऑफ़लाइन",
          settings_title: "प्राथमिकताएं",
          settings_theme: "थीम",
          settings_lang: "भाषा",
          page_title: "मॉडल",
          page_desc: "Vault के लिए उपलब्ध स्थानीय बुद्धिमत्ता।",
          btn_add_model: "+ मॉडल जोड़ें",
          autoroute_label: "स्वतः रूटिंग",
          autoroute_desc: "Vault प्रत्येक क्वेरी और पाइपलाइन कार्य के लिए स्वचालित रूप से उपयुक्त स्थानीय मॉडल का चयन करता है।",
          state_active: "सक्रिय",
          col_model: "मॉडल",
          col_capability: "क्षमता",
          col_weights: "आकार/वजन",
          col_state: "स्थिति",
          state_ready: "तैयार",
          state_standby: "स्टैंडबाय",
          drawer_pane_title: "निरीक्षण फलक",
          drawer_assigned_capabilities: "असाइन की गई क्षमताएं",
          drawer_specifications: "विनिर्देश",
          spec_context_window: "संदर्भ विंडो",
          drawer_runtime_status: "रनटाइम स्थिति",
          runtime_state: "स्थिति",
          runtime_ready_warm: "तैयार / सक्रिय",
          cap_1: "कोड निर्माण और पुनर्गठन",
          cap_2: "स्थिर संरचनात्मक विश्लेषण",
          cap_3: "स्वायत्त त्रुटि स्थान निर्धारण",
          cap_4: "नियतात्मक परीक्षण संश्लेषण",
          action_set_default: "डिफ़ॉल्ट कोडर के रूप में सेट करें",
          action_verify_sha: "SHA सत्यापित करें",
          action_unload: "अनलोड करें"
        },
        kn: {
          nav_chat: "ಚಾಟ್",
          nav_knowledge: "ಜ್ಞಾನಕೋಶ",
          nav_code: "ಕೋಡ್",
          nav_models: "ಮಾದರಿಗಳು",
          nav_logs: "ಲಾಗ್‌ಗಳು",
          badge_offline: "ಆಫ್‌ಲೈನ್",
          settings_title: "ಆದ್ಯತೆಗಳು",
          settings_theme: "ಥೀಮ್",
          settings_lang: "ಭಾಷೆ",
          page_title: "ಮಾದರಿಗಳು",
          page_desc: "Vault ಗೆ ಲಭ್ಯವಿರುವ ಸ್ಥಳೀಯ ಬುದ್ಧಿವಂತಿಕೆ.",
          btn_add_model: "+ ಮಾದರಿ ಸೇರಿಸಿ",
          autoroute_label: "ಸ್ವಯಂ ರೂಟಿಂಗ್",
          autoroute_desc: "ಪ್ರತಿಯೊಂದು ಪ್ರಶ್ನೆ ಮತ್ತು ಪೈಪ್‌ಲೈನ್ ಕಾರ್ಯಕ್ಕಾಗಿ Vault ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಸೂಕ್ತವಾದ ಸ್ಥಳೀಯ ಮಾದರಿಯನ್ನು ಆಯ್ಕೆ ಮಾಡುತ್ತದೆ.",
          state_active: "ಸಕ್ರಿಯ",
          col_model: "ಮಾದರಿ",
          col_capability: "ಸಾಮರ್ಥ್ಯ",
          col_weights: "ಗಾತ್ರ/ತೂಕ",
          col_state: "ಸ್ಥಿತಿ",
          state_ready: "ಸಿದ್ಧವಾಗಿದೆ",
          state_standby: "ಸ್ಟ್ಯಾಂಡ್‌ಬೈ",
          drawer_pane_title: "ಪರಿಶೀಲನಾ ಫಲಕ",
          drawer_assigned_capabilities: "ನಿಯೋಜಿಸಲಾದ ಸಾಮರ್ಥ್ಯಗಳು",
          drawer_specifications: "ವಿವರಣೆಗಳು",
          spec_context_window: "ಸಂದರ್ಭ ವಿಂಡೋ",
          drawer_runtime_status: "ರನ್‌ಟೈಮ್ ಸ್ಥಿತಿ",
          runtime_state: "ಸ್ಥಿತಿ",
          runtime_ready_warm: "ಸಿದ್ಧವಾಗಿದೆ / ಸಕ್ರಿಯ",
          cap_1: "ಕೋಡ್ ಜನರೇಷನ್ ಮತ್ತು ರಿಫ್ಯಾಕ್ಟರಿಂಗ್",
          cap_2: "ಸ್ಥಿರ ರಚನಾತ್ಮಕ ವಿಶ್ಲೇಷಣೆ",
          cap_3: "ಸ್ವಾಯತ್ತ ದೋಷ ಪತ್ತೆ",
          cap_4: "ನಿರ್ಣಾಯಕ ಪರೀಕ್ಷಾ ಸಂಶ್ಲೇಷಣೆ",
          action_set_default: "ಡೀಫಾಲ್ಟ್ ಕೋಡರ್ ಆಗಿ ಹೊಂದಿಸಿ",
          action_verify_sha: "SHA ಪರಿಶೀಲಿಸಿ",
          action_unload: "ಅನ್‌ಲೋಡ್ ಮಾಡಿ"
        }
      };

      // State Management
      let currentTheme = localStorage.getItem('vault_theme') || 'system';
      let currentLang = localStorage.getItem('vault_lang') || 'en';

      const htmlEl = document.documentElement;
      const settingsBtn = root.querySelector('#settings-trigger');
      const settingsPopover = root.querySelector('#settings-popover');
      const themeButtons = document.querySelectorAll('.theme-btn');
      const langButtons = document.querySelectorAll('.lang-btn');

      function applyTheme(theme) {
        currentTheme = theme;
        localStorage.setItem('vault_theme', theme);

        const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (theme === 'dark' || (theme === 'system' && isSystemDark)) {
          htmlEl.classList.add('dark');
        } else {
          htmlEl.classList.remove('dark');
        }

        themeButtons.forEach(btn => {
          const active = btn.getAttribute('data-theme-val') === theme;
          btn.className = `theme-btn py-1 text-center font-label-sm text-label-sm rounded-DEFAULT transition-all ${
            active 
              ? 'bg-surface text-primary shadow-xs font-semibold border border-border-subtle' 
              : 'text-text-muted hover:text-text-main'
          }`;
        });
      }

      function applyLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('vault_lang', lang);
        htmlEl.setAttribute('lang', lang);

        const dict = translations[lang] || translations.en;
        document.querySelectorAll('[data-i18n]').forEach(el => {
          const key = el.getAttribute('data-i18n');
          if (dict[key]) {
            el.textContent = dict[key];
          }
        });

        langButtons.forEach(btn => {
          const active = btn.getAttribute('data-lang-val') === lang;
          btn.className = `lang-btn py-1 text-center font-label-sm text-label-sm rounded-DEFAULT transition-all ${
            active 
              ? 'bg-surface text-primary shadow-xs font-semibold border border-border-subtle' 
              : 'text-text-muted hover:text-text-main'
          }`;
        });
      }

      // System theme listener
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (currentTheme === 'system') {
          applyTheme('system');
        }
      });

      // Settings popover toggling
      if (settingsBtn && settingsPopover) {
        settingsBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          settingsPopover.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
          if (!settingsPopover.contains(e.target) && e.target !== settingsBtn) {
            settingsPopover.classList.add('hidden');
          }
        });
      }

      // Attach control listeners
      themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          applyTheme(btn.getAttribute('data-theme-val'));
        });
      });

      langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          applyLanguage(btn.getAttribute('data-lang-val'));
        });
      });

      // Initialize
      applyTheme(currentTheme);
      applyLanguage(currentLang);


        const TARGETS = [['chat', ['chat']], ['kb', ['knowledge']], ['models', ['models']], ['code', ['code']], ['logs', ['logs', 'activity']]]
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
    <div ref={rootRef} className={"min-h-screen bg-background text-text-main pl-16"} style={{ display: hidden ? 'none' : undefined }}>
      {" "}<aside className={"group/sidebar fixed top-0 left-0 bottom-0 h-screen w-16 hover:w-56 bg-card-bg border-r border-border-subtle z-50 flex flex-col justify-between py-4 px-2.5 transition-all duration-200 ease-in-out shadow-sm overflow-hidden select-none"}><div className={"flex flex-col w-full gap-4"}><div className={"flex items-center gap-3 px-1.5 overflow-hidden"}><div className={"w-8 h-8 rounded bg-[#176B5B] flex items-center justify-center text-white font-semibold text-[14px] shrink-0 shadow-sm"} title={"VAULT SOV-01"}><span className={"w-2.5 h-2.5 bg-white rounded-[1px]"}></span></div><div className={"flex flex-col whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 min-w-0"}><span className={"font-code-md text-code-md font-semibold text-text-primary tracking-wide leading-tight truncate"}>VAULT SOV-01</span><span className={"font-label-sm text-[10px] text-text-muted uppercase tracking-wider"}>AIR-GAP v4.19</span></div></div><nav className={"flex flex-col w-full gap-1.5 mt-2"}><a className={"flex items-center gap-3 h-10 px-2 rounded-md text-text-muted hover:text-text-primary hover:bg-chip-bg transition-colors whitespace-nowrap overflow-hidden"} data-i18n-title={"nav_chat"} href={"#"} title={"Chat"}><span className={"material-symbols-outlined text-[20px] shrink-0"}>chat</span><span className={"font-body-md text-body-md font-medium opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200"} data-i18n={"nav_chat"}>Chat</span></a><a className={"flex items-center gap-3 h-10 px-2 rounded-md text-text-muted hover:text-text-primary hover:bg-chip-bg transition-colors whitespace-nowrap overflow-hidden"} data-i18n-title={"nav_knowledge"} href={"#"} title={"Knowledge"}><span className={"material-symbols-outlined text-[20px] shrink-0"}>menu_book</span><span className={"font-body-md text-body-md font-medium opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200"} data-i18n={"nav_knowledge"}>Knowledge</span></a><a className={"flex items-center gap-3 h-10 px-2 rounded-md text-text-muted hover:text-text-primary hover:bg-chip-bg transition-colors whitespace-nowrap overflow-hidden"} data-i18n-title={"nav_code"} href={"#"} title={"Code"}><span className={"material-symbols-outlined text-[20px] shrink-0"}>code</span><span className={"font-body-md text-body-md font-medium opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200"} data-i18n={"nav_code"}>Code</span></a><a className={"relative flex items-center gap-3 h-10 px-2 rounded-md bg-accent-tint text-[#176B5B] transition-colors whitespace-nowrap overflow-hidden"} data-i18n-title={"nav_models"} href={"#"} style={{"backgroundColor": "rgb(241, 247, 245)", "color": "rgb(23, 107, 91)"}} title={"Models"}><span className={"absolute left-0 top-2 bottom-2 w-0.5 bg-[#176B5B] rounded-r"}></span><span className={"material-symbols-outlined text-[20px] shrink-0"}>deployed_code</span><span className={"font-body-md text-body-md font-semibold opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 text-[#176B5B]"} data-i18n={"nav_models"}>Models</span></a><a className={"flex items-center gap-3 h-10 px-2 rounded-md text-text-muted hover:text-text-primary hover:bg-chip-bg transition-colors whitespace-nowrap overflow-hidden"} data-i18n-title={"nav_logs"} href={"#"} title={"Logs"}><span className={"material-symbols-outlined text-[20px] shrink-0"}>receipt_long</span><span className={"font-body-md text-body-md font-medium opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200"} data-i18n={"nav_logs"}>Logs</span></a></nav></div><div className={"flex flex-col w-full gap-3"}><div className={"flex items-center gap-3 px-2 py-1.5 rounded hover:bg-chip-bg/50 transition-colors cursor-pointer overflow-hidden whitespace-nowrap"} title={"OFFLINE · Air-gapped environment"}><div className={"w-6 flex items-center justify-center shrink-0"}><span className={"w-2.5 h-2.5 rounded-full bg-[#176B5B] animate-pulse"}></span></div><div className={"flex flex-col opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 min-w-0"}><span className={"font-label-sm text-[11px] text-[#176B5B] font-semibold uppercase tracking-wider leading-none"} data-i18n={"badge_offline"}>OFFLINE</span><span className={"font-body-sm text-[11px] text-text-muted leading-tight truncate"}>Air-gapped safe</span></div></div><div className={"relative flex items-center"}><button aria-expanded={"false"} aria-haspopup={"true"} className={"w-full h-10 px-2 rounded-md flex items-center gap-3 text-text-muted hover:text-text-primary hover:bg-chip-bg border border-border-subtle transition-colors overflow-hidden whitespace-nowrap"} id={"settings-trigger"} title={"Settings"}><span className={"material-symbols-outlined text-[20px] shrink-0"}>tune</span><span className={"font-body-md text-body-md font-medium opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200"} data-i18n={"settings_btn"}>Settings</span></button><div className={"hidden absolute left-full bottom-0 ml-2 w-64 bg-card-bg border border-border-subtle rounded shadow-lg p-3 z-50 flex flex-col gap-3 font-sans transition-colors duration-180"} id={"settings-popover"}><div className={"flex flex-col gap-1.5"}><label className={"font-label-sm text-label-sm text-text-muted uppercase tracking-wider"} data-i18n={"theme_label"}>Theme</label><div className={"grid grid-cols-3 gap-1 bg-chip-bg p-1 rounded border border-border-subtle"} id={"theme-controls"}><button className={"py-1 px-2 text-label-sm font-label-sm uppercase rounded transition-colors"} data-theme={"light"}>Light</button><button className={"py-1 px-2 text-label-sm font-label-sm uppercase rounded transition-colors"} data-theme={"dark"}>Dark</button><button className={"py-1 px-2 text-label-sm font-label-sm uppercase rounded transition-colors"} data-theme={"system"}>System</button></div></div><div className={"flex flex-col gap-1.5"}><label className={"font-label-sm text-label-sm text-text-muted uppercase tracking-wider"} data-i18n={"lang_label"}>Language</label><div className={"grid grid-cols-3 gap-1 bg-chip-bg p-1 rounded border border-border-subtle"} id={"lang-controls"}><button className={"py-1 px-1.5 text-center text-label-sm font-medium rounded transition-colors"} data-lang={"en"}>EN</button><button className={"py-1 px-1.5 text-center text-body-sm font-medium rounded transition-colors"} data-lang={"hi"}>हिन्दी</button><button className={"py-1 px-1.5 text-center text-body-sm font-medium rounded transition-colors"} data-lang={"kn"}>ಕನ್ನಡ</button></div></div></div></div></div></aside>{" "}<main className={"min-h-[calc(100vh-2.5rem)] px-margin-desktop py-gutter-desktop"}>{" "}<div className={"flex flex-col w-full"}>{" "}<div className={"flex flex-col lg:flex-row min-h-[calc(100vh-6.5rem)] gap-space-lg"}>{" "}<div className={"flex-1 flex flex-col min-w-0 pr-0 lg:pr-space-md"}>{" "}<div className={"flex items-end justify-between pb-space-lg"}>{" "}<div>{" "}<h1 className={"font-headline-xl text-headline-xl text-text-main tracking-tight font-normal"} data-i18n={"page_title"}>Models</h1>{" "}<p className={"font-body-md text-body-md text-text-muted mt-1"} data-i18n={"page_desc"}>Local intelligence available to Vault.</p>{" "}</div>{" "}<div className={"flex items-center gap-space-sm"}>{" "}<button className={"inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-DEFAULT text-white font-label-md text-label-md tracking-wider transition-colors duration-150 shadow-sm"} style={{"backgroundColor": "rgb(23, 107, 91)"}}>{" "}<span className={"material-symbols-outlined text-[15px] text-white"}>add</span>{" "}<span className={""} data-i18n={"btn_add_model"}>+ ADD MODEL</span>{" "}</button>{" "}</div>{" "}</div>{" "}<div className={"flex items-center justify-between py-2.5 px-space-md bg-surface rounded-md border border-border-subtle mb-space-md shadow-sm"}><div className={"flex items-center gap-space-sm min-w-0"}>{" "}<span className={"font-label-sm text-label-sm tracking-widest uppercase shrink-0 font-medium"} data-i18n={"autoroute_label"} style={{"color": "#176B5B"}}>AUTO ROUTING</span>{" "}<span className={"text-border-subtle text-label-sm"}>/</span>{" "}<span className={"font-body-sm text-body-sm text-text-muted truncate"} data-i18n={"autoroute_desc"}>Vault automatically selects the appropriate local model for each query and pipeline task.</span>{" "}</div>{" "}<div className={"flex items-center gap-2 shrink-0 pl-space-md"}>{" "}<span className={"font-label-sm text-label-sm font-code-md"} data-i18n={"state_active"} style={{"color": "#176B5B"}}>ACTIVE</span>{" "}<span className={"w-1.5 h-1.5 rounded-full"} style={{"backgroundColor": "#176B5B"}}></span>{" "}</div></div>{" "}<div className={"flex flex-col bg-surface rounded-DEFAULT border border-border-subtle overflow-hidden shadow-sm"}>{" "}<div className={"grid grid-cols-12 px-space-md py-space-sm text-text-subtle font-label-sm text-label-sm tracking-wider border-b border-border-subtle bg-surface-alt"}>{" "}<div className={"col-span-5 flex items-center"} data-i18n={"col_model"}>MODEL</div>{" "}<div className={"col-span-3 flex items-center"} data-i18n={"col_capability"}>CAPABILITY</div>{" "}<div className={"col-span-2 flex items-center"} data-i18n={"col_weights"}>WEIGHTS</div>{" "}<div className={"col-span-2 flex items-center justify-end"} data-i18n={"col_state"}>STATE</div>{" "}</div>{" "}<div className={"grid grid-cols-12 px-space-md py-3.5 items-center bg-primary-tint border-l-[3px] border-l-primary border-b border-border-subtle cursor-pointer transition-colors duration-150 group"} style={{"backgroundColor": "rgb(241, 247, 245)", "borderLeftColor": "rgb(23, 107, 91)"}}>{" "}<div className={"col-span-5 flex flex-col justify-center min-w-0 pr-space-sm"}>{" "}<div className={"flex items-center gap-space-sm"}>{" "}<span className={"font-headline-md text-headline-md text-text-main font-normal tracking-tight truncate"}>Qwen Coder</span>{" "}<span className={"px-1.5 py-0.5 rounded-DEFAULT border border-[#176B5B]/20 text-[#176B5B] bg-[#E4F0EC] font-label-sm text-[0.625rem] tracking-wider shrink-0 font-code-md"} style={{"backgroundColor": "rgb(228, 240, 236)", "color": "rgb(23, 107, 91)", "borderColor": "rgb(192, 222, 214)"}}>ACTIVE IN CODESPACE</span>{" "}</div>{" "}<span className={"font-code-md text-label-sm text-text-muted tracking-tight mt-0.5 truncate"}>Qwen2.5-Coder-32B-Instruct · q4_k_m</span>{" "}</div>{" "}<div className={"col-span-3 flex items-center"}>{" "}<span className={"font-body-sm text-body-sm text-text-main"}>Coding &amp; Syntax</span>{" "}</div>{" "}<div className={"col-span-2 flex items-center"}>{" "}<span className={"font-code-md text-body-sm text-text-main"}>32B</span>{" "}</div>{" "}<div className={"col-span-2 flex items-center justify-end gap-space-sm"}>{" "}<span className={"w-1.5 h-1.5 rounded-full bg-primary"} style={{"backgroundColor": "rgb(23, 107, 91)"}}></span>{" "}<span className={"font-label-sm text-label-sm text-text-main tracking-wider font-medium"} data-i18n={"state_ready"}>READY</span>{" "}<span className={"material-symbols-outlined text-text-muted text-[16px] ml-1"}>chevron_right</span>{" "}</div>{" "}</div>{" "}<div className={"grid grid-cols-12 px-space-md py-3.5 items-center bg-surface hover:bg-surface-alt border-b border-border-subtle cursor-pointer transition-colors duration-150 group"}>{" "}<div className={"col-span-5 flex flex-col justify-center min-w-0 pr-space-sm"}>{" "}<div className={"flex items-center gap-space-sm"}>{" "}<span className={"font-headline-md text-headline-md text-text-main font-normal tracking-tight truncate group-hover:text-black dark:group-hover:text-white"}>Llama</span>{" "}</div>{" "}<span className={"font-code-md text-label-sm text-text-muted tracking-tight mt-0.5 truncate"}>Llama-3.3-70B-Instruct · q5_k_m</span>{" "}</div>{" "}<div className={"col-span-3 flex items-center"}>{" "}<span className={"font-body-sm text-body-sm text-text-main"}>Reasoning &amp; Synthesis</span>{" "}</div>{" "}<div className={"col-span-2 flex items-center"}>{" "}<span className={"font-code-md text-body-sm text-text-main"}>70B</span>{" "}</div>{" "}<div className={"col-span-2 flex items-center justify-end gap-space-sm"}>{" "}<span className={"w-1.5 h-1.5 rounded-full bg-primary"} style={{"backgroundColor": "rgb(23, 107, 91)"}}></span>{" "}<span className={"font-label-sm text-label-sm text-text-main tracking-wider font-medium"} data-i18n={"state_ready"}>READY</span>{" "}<span className={"material-symbols-outlined text-text-muted group-hover:text-text-main text-[16px] ml-1"}>chevron_right</span>{" "}</div>{" "}</div>{" "}<div className={"grid grid-cols-12 px-space-md py-3.5 items-center bg-surface hover:bg-surface-alt border-b border-border-subtle cursor-pointer transition-colors duration-150 group"}>{" "}<div className={"col-span-5 flex flex-col justify-center min-w-0 pr-space-sm"}>{" "}<div className={"flex items-center gap-space-sm"}>{" "}<span className={"font-headline-md text-headline-md text-text-main font-normal tracking-tight truncate group-hover:text-black dark:group-hover:text-white"}>Vision Model</span>{" "}</div>{" "}<span className={"font-code-md text-label-sm text-text-muted tracking-tight mt-0.5 truncate"}>Pixtral-12B · Enclave Vision-OCR</span>{" "}</div>{" "}<div className={"col-span-3 flex items-center"}>{" "}<span className={"font-body-sm text-body-sm text-text-main"}>Multimodal &amp; Schematics</span>{" "}</div>{" "}<div className={"col-span-2 flex items-center"}>{" "}<span className={"font-code-md text-body-sm text-text-main"}>12B</span>{" "}</div>{" "}<div className={"col-span-2 flex items-center justify-end gap-space-sm"}>{" "}<span className={"w-1.5 h-1.5 rounded-full bg-primary"} style={{"backgroundColor": "rgb(23, 107, 91)"}}></span>{" "}<span className={"font-label-sm text-label-sm text-text-main tracking-wider font-medium"} data-i18n={"state_ready"}>READY</span>{" "}<span className={"material-symbols-outlined text-text-muted group-hover:text-text-main text-[16px] ml-1"}>chevron_right</span>{" "}</div>{" "}</div>{" "}<div className={"grid grid-cols-12 px-space-md py-3.5 items-center bg-surface hover:bg-surface-alt cursor-pointer transition-colors duration-150 group"}>{" "}<div className={"col-span-5 flex flex-col justify-center min-w-0 pr-space-sm"}>{" "}<div className={"flex items-center gap-space-sm"}>{" "}<span className={"font-headline-md text-headline-md text-text-main font-normal tracking-tight truncate group-hover:text-black dark:group-hover:text-white"}>DeepSeek R1</span>{" "}</div>{" "}<span className={"font-code-md text-label-sm text-text-muted tracking-tight mt-0.5 truncate"}>DeepSeek-R1-Distill-Qwen-32B · f16</span>{" "}</div>{" "}<div className={"col-span-3 flex items-center"}>{" "}<span className={"font-body-sm text-body-sm text-text-main"}>Deterministic Verification</span>{" "}</div>{" "}<div className={"col-span-2 flex items-center"}>{" "}<span className={"font-code-md text-body-sm text-text-main"}>32B</span>{" "}</div>{" "}<div className={"col-span-2 flex items-center justify-end gap-space-sm"}>{" "}<span className={"w-1.5 h-1.5 rounded-full bg-text-subtle"}></span>{" "}<span className={"font-label-sm text-label-sm text-text-subtle tracking-wider font-medium"} data-i18n={"state_standby"}>STANDBY</span>{" "}<span className={"material-symbols-outlined text-text-muted group-hover:text-text-main text-[16px] ml-1"}>chevron_right</span>{" "}</div>{" "}</div>{" "}</div>{" "}<div className={"mt-space-lg flex items-center justify-between text-text-subtle font-label-sm text-label-sm px-1"}>{" "}<div className={"flex items-center gap-space-sm"}>{" "}<span className={"text-text-subtle"}>MODEL INTEGRITY:</span>{" "}<span className={"text-text-muted font-code-md"}>ATTESTED BY SECURE ENCLAVE 0x9AF0</span>{" "}</div>{" "}<div className={"flex items-center gap-space-sm"}>{" "}<span className={"text-text-subtle"}>STORE:</span>{" "}<span className={"font-code-md text-text-muted"}>/dev/nvme0n1p3/vault_models</span>{" "}</div>{" "}</div>{" "}</div>{" "}<div className={"w-full lg:w-80 shrink-0 flex flex-col bg-surface rounded-DEFAULT border border-border-subtle shadow-sm overflow-hidden p-space-md"}><div className={"flex items-center justify-between pb-space-sm border-b border-border-subtle mb-space-md"}><div className={"flex items-center gap-2"}><span className={"material-symbols-outlined text-[18px] text-[#176B5B]"}>verified</span><span className={"font-label-sm text-label-sm uppercase tracking-wider text-text-muted font-medium"} data-i18n={"drawer_pane_title"}>INSPECTION PANE</span></div><span className={"px-1.5 py-0.5 rounded-DEFAULT bg-[#EFECE4] text-text-muted font-code-md text-[10px] uppercase border border-border-subtle"}>v2.5</span></div><div className={"flex flex-col gap-1 mb-space-md"}><div className={"flex items-center justify-between"}><h2 className={"font-headline-md text-headline-md text-text-main font-semibold tracking-tight"}>Qwen Coder</h2><span className={"px-1.5 py-0.5 rounded-DEFAULT border border-[#176B5B]/20 text-[#176B5B] bg-[#E4F0EC] font-label-sm text-[0.625rem] tracking-wider font-code-md"}>ACTIVE</span></div><span className={"font-code-md text-label-sm text-text-muted"}>Qwen2.5-Coder-32B-Instruct</span></div><div className={"flex flex-col gap-space-sm mb-space-md pb-space-md border-b border-border-subtle"}><span className={"font-label-sm text-label-sm text-text-subtle uppercase tracking-wider"} data-i18n={"drawer_runtime_status"}>Runtime Status</span><div className={"flex items-center justify-between bg-surface-alt p-2 rounded-DEFAULT border border-border-subtle"}><div className={"flex items-center gap-2"}><span className={"w-2 h-2 rounded-full bg-primary"} style={{"backgroundColor": "#176B5B"}}></span><span className={"font-code-md text-label-sm text-text-main font-medium"} data-i18n={"runtime_ready_warm"}>READY / WARM</span></div><span className={"font-code-md text-[11px] text-text-muted"}>VRAM 22.4 GB</span></div></div><div className={"flex flex-col gap-space-sm mb-space-md pb-space-md border-b border-border-subtle"}><span className={"font-label-sm text-label-sm text-text-subtle uppercase tracking-wider"} data-i18n={"drawer_specifications"}>Specifications</span><div className={"flex flex-col gap-1 text-label-sm font-code-md"}><div className={"flex justify-between py-0.5"}><span className={"text-text-muted"}>Quantization</span><span className={"text-text-main"}>q4_k_m</span></div><div className={"flex justify-between py-0.5"}><span className={"text-text-muted"} data-i18n={"spec_context_window"}>Context Window</span><span className={"text-text-main"}>32,768 tokens</span></div><div className={"flex justify-between py-0.5"}><span className={"text-text-muted"}>Parameter Size</span><span className={"text-text-main"}>32.5B</span></div><div className={"flex justify-between py-0.5"}><span className={"text-text-muted"}>Compute Enclave</span><span className={"text-text-main"}>NPU-0 · Isolated</span></div></div></div><div className={"flex flex-col gap-2 mb-space-md"}><span className={"font-label-sm text-label-sm text-text-subtle uppercase tracking-wider"} data-i18n={"drawer_assigned_capabilities"}>Assigned Capabilities</span><div className={"flex flex-wrap gap-1"}><span className={"px-2 py-1 rounded-DEFAULT bg-[#EFECE4] border border-border-subtle text-text-main font-body-sm text-[11px]"} data-i18n={"cap_1"}>Code generation &amp; refactoring</span><span className={"px-2 py-1 rounded-DEFAULT bg-[#EFECE4] border border-border-subtle text-text-main font-body-sm text-[11px]"} data-i18n={"cap_2"}>Static structural analysis</span><span className={"px-2 py-1 rounded-DEFAULT bg-[#EFECE4] border border-border-subtle text-text-main font-body-sm text-[11px]"} data-i18n={"cap_3"}>Autonomous error localization</span></div></div><div className={"mt-auto flex flex-col gap-2 pt-2"}><button className={"w-full py-2 rounded-DEFAULT text-white font-label-md text-label-md tracking-wider transition-colors duration-150 shadow-sm flex items-center justify-center gap-1.5"} data-i18n={"action_set_default"} style={{"backgroundColor": "#176B5B"}}><span className={"material-symbols-outlined text-[15px]"}>check_circle</span><span className={""}>SET AS DEFAULT CODER</span></button><div className={"flex gap-2"}><button className={"flex-1 py-1.5 rounded-DEFAULT bg-surface-alt hover:bg-border-subtle border border-border-subtle font-label-sm text-label-sm text-text-main transition-colors"} data-i18n={"action_verify_sha"}>VERIFY SHA</button><button className={"flex-1 py-1.5 rounded-DEFAULT bg-surface-alt hover:bg-border-subtle border border-border-subtle font-label-sm text-label-sm text-error transition-colors"} data-i18n={"action_unload"}>UNLOAD</button></div></div></div>{" "}</div>{" "}</div>{" "}</main>{" "}<footer className={"border-t border-border-subtle bg-surface px-margin-desktop py-space-xs"}>{" "}<div className={"flex items-center justify-between font-label-sm text-label-sm text-text-subtle"}><div className={"flex items-center gap-space-sm"}>{" "}<span className={""} style={{"color": "#176B5B"}}>●</span>{" "}<span className={""}>HARDWARE ENCLAVE ACTIVE</span>{" "}<span className={"text-border-subtle"}>/</span>{" "}<span className={""}>ZERO EXTERNAL TELEMETRY</span>{" "}<span className={"text-border-subtle"}>/</span>{" "}<span className={""}>SOVEREIGN AIR-GAP VERIFIED</span>{" "}</div>{" "}<div className={"flex items-center gap-space-md text-text-subtle"}>{" "}<span className={""}>KERNEL: SV-6.4.11-ONPREM</span>{" "}<span className={"font-code-md text-label-sm font-medium"} style={{"color": "#176B5B"}}>SECURE_STATE: LOCKED</span>{" "}</div></div>{" "}</footer>{" "}
    </div>
  )
}
