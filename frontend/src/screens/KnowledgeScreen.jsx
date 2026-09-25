import { useEffect, useRef } from 'react'

export default function KnowledgeScreen({ onNavigate, hidden }) {
  const rootRef = useRef(null)
  const navRef = useRef(onNavigate)
  navRef.current = onNavigate

  useEffect(() => {
    const root = rootRef.current;

        (function () {
          // 1. Translations dictionary for EN, HI, KN
          const i18nData = {
            en: {
              "nav.chat": "Chat",
              "nav.knowledge": "Knowledge",
              "nav.code": "Code",
              "nav.models": "Models",
              "nav.logs": "Logs",
              "status.offline": "OFFLINE",
              "settings.title": "Workspace Preferences",
              "settings.theme": "Appearance",
              "settings.language": "Language",
              "theme.light": "Light",
              "theme.dark": "Dark",
              "theme.system": "Auto",
              "sidebar.sources": "Sources",
              "sidebar.add": "+ Add",
              "sidebar.enclave": "Local Enclave",
              "sidebar.enclave_sub": "4 sources indexed locally · Enclave memory active",
              "workspace.title": "Knowledge",
              "workspace.grounding": "Grounding",
              "workspace.source_count": "4 sources",
              "workspace.strict_btn": "Grounding: Strict",
              "synthesis.query_heading": "What are the shutdown requirements?",
              "synthesis.badge": "VAULT SYNTHESIS",
              "synthesis.deterministic": "Deterministic verification: 99.8%",
              "synthesis.lead": "The maintenance procedure mandates a strict multi-staged physical isolation protocol prior to cold-loop inspection. Cross-document grounding references three compulsory gates:",
              "point1.title": "Primary Loop Depressurization",
              "point1.body": "Isolation valves IV-102 through IV-108 must be mechanically dogged and padlock-tagged. Differential telemetry must confirm zero bar (gauge) across bypass manifold B-7 before breaking flange seals.",
              "point2.title": "Residual Thermal Dissipation Window",
              "point2.body": "Auxiliary cooling pumps must remain locked on forced-circulation bypass until all primary core thermocouple clusters register below 42°C for a continuous, uninterrupted 60-minute interval.",
              "point3.title": "Secondary Containment Atmospheric Assurance",
              "point3.body": "Atmospheric sensor verification for volatile fluorocarbons must be logged at 15-minute intervals across all four facility quadrants. Manual technician hatch interlocks will refuse authorization until scrubbers complete two volume exchanges.",
              "synthesis.guarantee": "Grounded purely against local air-gapped cryptographic volumes. Zero hallucination tolerance.",
              "synthesis.audit": "Audit Log",
              "prompt.sugg1": '"What are the shutdown requirements?"',
              "prompt.sugg2": '"Find previous corrosion findings."',
              "prompt.sugg3": '"Summarize the inspection report."',
              "composer.placeholder": "Ask your private knowledge base...",
              "drawer.header_sub": "Page 18 of 64 · Section 4.2 Depressurization",
              "drawer.citation_match": "Exact Citation Match",
              "drawer.target_badge": "Grounding Target · Excerpt #1",
              "drawer.snippet_body": '"During scheduled or emergency cycle shutdowns, isolation valves IV-102 through IV-108 shall be mechanically dogged and padlock-tagged. Differential telemetry must confirm zero bar (gauge) across bypass manifold B-7 before breaking flange seals..."',
              "drawer.preview": "PAGE PREVIEW (18)",
              "drawer.prev": "← Prev",
              "drawer.next": "Next →",
              "drawer.jump": "Jump:",
              "footer.kernel": "VAULT KERNEL v4.19-AIRGAP",
              "footer.egress": "ZERO-EGRESS VERIFIED"
            },
            hi: {
              "nav.chat": "चैट",
              "nav.knowledge": "ज्ञान",
              "nav.code": "कोड",
              "nav.models": "मॉडल",
              "nav.logs": "लॉग्स",
              "status.offline": "ऑफलाइन",
              "settings.title": "कार्यक्षेत्र प्राथमिकताएं",
              "settings.theme": "थीम (रूप)",
              "settings.language": "भाषा (Language)",
              "theme.light": "लाइट",
              "theme.dark": "डार्क",
              "theme.system": "सिस्टम",
              "sidebar.sources": "स्रोत",
              "sidebar.add": "+ जोड़ें",
              "sidebar.enclave": "लोकल एन्क्लेव",
              "sidebar.enclave_sub": "4 स्थानीय स्रोत अनुक्रमित · एन्क्लेव मेमोरी सक्रिय",
              "workspace.title": "ज्ञान",
              "workspace.grounding": "ग्राउंडिंग",
              "workspace.source_count": "4 स्रोत",
              "workspace.strict_btn": "ग्राउंडिंग: सख्त",
              "synthesis.query_heading": "शटडाउन की क्या आवश्यकताएं हैं?",
              "synthesis.badge": "वॉल्ट संश्लेषण",
              "synthesis.deterministic": "नियत सत्यापन: 99.8%",
              "synthesis.lead": "रखरखाव प्रक्रिया कोल्ड-लूप निरीक्षण से पहले एक सख्त बहु-स्तरीय भौतिक अलगाव प्रोटोकॉल अनिवार्य करती है। क्रॉस-दस्तावेज़ ग्राउंडिंग तीन अनिवार्य द्वारों को संदर्भित करता है:",
              "point1.title": "प्राथमिक लूप डीप्रेसराइजेशन",
              "point1.body": "आइसोलेशन वाल्व IV-102 से IV-108 को यांत्रिक रूप से लॉक और पैडलॉक-टैग किया जाना चाहिए। निकला हुआ किनारा सील तोड़ने से पहले बाईपास मैनिफोल्ड B-7 पर विभेदक टेलीमेट्री द्वारा शून्य बार (गेज) सुनिश्चित किया जाना अनिवार्य है।",
              "point2.title": "अवशिष्ट थर्मल अपव्यय खिड़की",
              "point2.body": "सहायक शीतलन पंप तब तक मजबूर परिसंचरण बाईपास पर बंद रहने चाहिए जब तक कि सभी प्राथमिक कोर थर्मोकपल क्लस्टर लगातार 60 मिनट के लिए 42°C से नीचे दर्ज न हों।",
              "point3.title": "द्वितीयक नियंत्रण वायुमंडलीय आश्वासन",
              "point3.body": "वाष्पशील फ्लोरोकार्बन के लिए वायुमंडलीय सेंसर सत्यापन को सभी चार सुविधा क्षेत्रों में 15 मिनट के अंतराल पर लॉग किया जाना चाहिए। जब तक स्क्रबर दो वॉल्यूम एक्सचेंज पूरा नहीं कर लेते, तब तक मैनुअल तकनीशियन हैच इंटरलॉक्स प्राधिकरण अस्वीकार करेंगे।",
              "synthesis.guarantee": "पूरी तरह से स्थानीय एयर-गैप्ड क्रिप्टोग्राफ़िक वॉल्यूम पर आधारित। शून्य भ्रम सहिष्णुता।",
              "synthesis.audit": "ऑडिट लॉग",
              "prompt.sugg1": '"शटडाउन की क्या आवश्यकताएं हैं?"',
              "prompt.sugg2": '"पिछले जंग के निष्कर्ष खोजें।"',
              "prompt.sugg3": '"निरीक्षण रिपोर्ट का सारांश दें।"',
              "composer.placeholder": "अपने निजी ज्ञान कोष से पूछें...",
              "drawer.header_sub": "पृष्ठ 18 / 64 · अनुभाग 4.2 डीप्रेसराइजेशन",
              "drawer.citation_match": "सटीक उद्धरण मिलान",
              "drawer.target_badge": "ग्राउंडिंग लक्ष्य · उद्धरण #1",
              "drawer.snippet_body": '"अनुसूचित या आपातकालीन शटडाउन के दौरान, आइसोलेशन वाल्व IV-102 से IV-108 को यांत्रिक रूप से लॉक और पैडलॉक-टैग किया जाएगा। निकला हुआ किनारा सील तोड़ने से पहले बाईपास मैनिफोल्ड B-7 पर विभेदक टेलीमेट्री शून्य बार की पुष्टि करनी चाहिए..."',
              "drawer.preview": "पृष्ठ पूर्वावलोकन (18)",
              "drawer.prev": "← पिछला",
              "drawer.next": "अगला →",
              "drawer.jump": "जाएं:",
              "footer.kernel": "वॉल्ट कर्नेल v4.19-एयरगैप",
              "footer.egress": "शून्य-निर्गमन सत्यापित"
            },
            kn: {
              "nav.chat": "ಚಾಟ್",
              "nav.knowledge": "ಜ್ಞಾನ",
              "nav.code": "ಕೋಡ್",
              "nav.models": "ಮಾದರಿಗಳು",
              "nav.logs": "ಲಾಗ್‌ಗಳು",
              "status.offline": "ಆಫ್‌ಲೈನ್",
              "settings.title": "ಕಾರ್ಯಕ್ಷೇತ್ರದ ಆದ್ಯತೆಗಳು",
              "settings.theme": "ರೂಪ (ಥೀಮ್)",
              "settings.language": "ಭಾಷೆ (Language)",
              "theme.light": "ಲೈಟ್",
              "theme.dark": "ಡಾರ್ಕ್",
              "theme.system": "ಸ್ವಯಂ",
              "sidebar.sources": "ಮೂಲಗಳು",
              "sidebar.add": "+ ಸೇರಿಸಿ",
              "sidebar.enclave": "ಸ್ಥಳೀಯ ಎನ್‌ಕ್ಲೇವ್",
              "sidebar.enclave_sub": "4 ಮೂಲಗಳನ್ನು ಸ್ಥಳೀಯವಾಗಿ ಸೂಚಿಕೆ ಮಾಡಲಾಗಿದೆ · ಎನ್‌ಕ್ಲೇವ್ ಸಕ್ರಿಯ",
              "workspace.title": "ಜ್ಞಾನ",
              "workspace.grounding": "ಗ್ರೌಂಡಿಂಗ್",
              "workspace.source_count": "4 ಮೂಲಗಳು",
              "workspace.strict_btn": "ಗ್ರೌಂಡಿಂಗ್: ಕಟ್ಟುನಿಟ್ಟಾದ",
              "synthesis.query_heading": "ಸ್ಥಗಿತಗೊಳಿಸುವಿಕೆಯ ಅಗತ್ಯತೆಗಳೇನು?",
              "synthesis.badge": "ವಾಲ್ಟ್ ಸಂಶ್ಲೇಷಣೆ",
              "synthesis.deterministic": "ದೃಢೀಕೃತ ಪರಿಶೀಲನೆ: 99.8%",
              "synthesis.lead": "ಕೋಲ್ಡ್-ಲೂಪ್ ತಪಾಸಣೆಗೆ ಮುಂಚಿತವಾಗಿ ನಿರ್ವಹಣಾ ಕಾರ್ಯವಿಧಾನವು ಕಟ್ಟುನಿಟ್ಟಾದ ಬಹು-ಹಂತದ ಭೌತಿಕ ಪ್ರತ್ಯೇಕತೆಯ ಪ್ರೋಟೋಕಾಲ್ ಅನ್ನು ಕಡ್ಡಾಯಗೊಳಿಸುತ್ತದೆ. ಮೂರು ಕಡ್ಡಾಯ ಗೇಟ್‌ಗಳ ಉಲ್ಲೇಖ:",
              "point1.title": "ಪ್ರಾಥಮಿಕ ಲೂಪ್ ಒತ್ತಡ ನಿವಾರಣೆ",
              "point1.body": "ಪ್ರತ್ಯೇಕಿಸುವ ವಾಲ್ವ್‌ಗಳು IV-102 ರಿಂದ IV-108 ವರೆಗೆ ಯಾಂತ್ರಿಕವಾಗಿ ಲಾಕ್ ಮತ್ತು ಪ್ಯಾಡ್‌ಲಾಕ್ ಮಾಡಬೇಕು. ಫ್ಲೇಂಜ್ ಸೀಲುಗಳನ್ನು ತೆರೆಯುವ ಮೊದಲು ಬೈಪಾಸ್ ಮ್ಯಾನಿಫೋಲ್ಡ್ B-7 ನಲ್ಲಿ ಶೂನ್ಯ ಬಾರ್ (ಗೇಜ್) ಇರುವುದನ್ನು ಟೆಲಿಮೆಟ್ರಿ ಖಚಿತಪಡಿಸಬೇಕು.",
              "point2.title": "ಉಳಿದ ಉಷ್ಣ ಪ್ರಸರಣ ಅವಧಿ",
              "point2.body": "ಎಲ್ಲಾ ಪ್ರಾಥಮಿಕ ಕೋರ್ ಥರ್ಮೋಕಪಲ್ ಕ್ಲಸ್ಟರ್‌ಗಳು ನಿರಂತರ 60 ನಿಮಿಷಗಳ ಕಾಲ 42°C ಗಿಂತ ಕಡಿಮೆಯಾಗುವವರೆಗೆ ಸಹಾಯಕ ಕೂಲಿಂಗ್ ಪಂಪ್‌ಗಳು ಬಲವಂತದ ಪರಿಚಲನೆ ಬೈಪಾಸ್‌ನಲ್ಲಿ ಲಾಕ್ ಆಗಿರಬೇಕು.",
              "point3.title": "ದ್ವಿತೀಯ ನಿಯಂತ್ರಣ ವಾತಾವರಣ ಭರವಸೆ",
              "point3.body": "ಬಾಷ್ಪಶೀಲ ಫ್ಲೋರೋಕಾರ್ಬನ್‌ಗಳಿಗಾಗಿ ವಾತಾವರಣದ ಸಂವೇದಕ ಪರಿಶೀಲನೆಯನ್ನು ಎಲ್ಲಾ ನಾಲ್ಕು ವಲಯಗಳಲ್ಲಿ ಪ್ರತಿ 15 ನಿಮಿಷಗಳಿಗೊಮ್ಮೆ ದಾಖಲಿಸಬೇಕು. ಸ್ಕ್ರಬ್ಬರ್‌ಗಳು ಎರಡು ವಾಲ್ಯೂಮ್ ವಿನಿಮಯವನ್ನು ಪೂರ್ಣಗೊಳಿಸುವವರೆಗೆ ಹ್ಯಾಚ್ ಇಂಟರ್‌ಲಾಕ್‌ಗಳು ಪ್ರವೇಶ ನಿರಾಕರಿಸುತ್ತವೆ.",
              "synthesis.guarantee": "ಸಂಪೂರ್ಣವಾಗಿ ಸ್ಥಳೀಯ ಏರ್‌ಗ್ಯಾಪ್ಡ್ ಕ್ರಿಪ್ಟೋಗ್ರಾಫಿಕ್ ವಾಲ್ಯೂಮ್ ಆಧಾರಿತ. ಶೂನ್ಯ ಭ್ರಮೆ ಸಹಿಷ್ಣುತೆ.",
              "synthesis.audit": "ಆಡಿಟ್ ಲಾಗ್",
              "prompt.sugg1": '"ಸ್ಥಗಿತಗೊಳಿಸುವಿಕೆಯ ಅಗತ್ಯತೆಗಳೇನು?"',
              "prompt.sugg2": '"ಹಿಂದಿನ ತುಕ್ಕು ಸಂಶೋಧನೆಗಳನ್ನು ಹುಡುಕಿ."',
              "prompt.sugg3": '"ತಪಾಸಣಾ ವರದಿಯನ್ನು ಸಂಕ್ಷೇಪಿಸಿ."',
              "composer.placeholder": "ನಿಮ್ಮ ಖಾಸಗಿ ಜ್ಞಾನ ಸಂಗ್ರಹವನ್ನು ಕೇಳಿ...",
              "drawer.header_sub": "ಪುಟ 18 / 64 · ವಿಭಾಗ 4.2 ಒತ್ತಡ ನಿವಾರಣೆ",
              "drawer.citation_match": "ನಿಖರವಾದ ಉಲ್ಲೇಖ ಹೊಂದಾಣಿಕೆ",
              "drawer.target_badge": "ಗ್ರೌಂಡಿಂಗ್ ಗುರಿ · ಉಲ್ಲೇಖ #1",
              "drawer.snippet_body": '"ನಿಗದಿತ ಅಥವಾ ತುರ್ತು ಸ್ಥಗಿತಗೊಳಿಸುವ ಸಮಯದಲ್ಲಿ, ಪ್ರತ್ಯೇಕಿಸುವ ವಾಲ್ವ್‌ಗಳು IV-102 ರಿಂದ IV-108 ವರೆಗೆ ಯಾಂತ್ರಿಕವಾಗಿ ಲಾಕ್ ಮಾಡಬೇಕು. ಫ್ಲೇಂಜ್ ಸೀಲುಗಳನ್ನು ಮುರಿಯುವ ಮೊದಲು ಬೈಪಾಸ್ ಮ್ಯಾನಿಫೋಲ್ಡ್ B-7 ನಲ್ಲಿ ಶೂನ್ಯ ಬಾರ್ ಇರುವುದನ್ನು ಟೆಲಿಮೆಟ್ರಿ ಖಚಿತಪಡಿಸಬೇಕು..."',
              "drawer.preview": "ಪುಟ ಪೂರ್ವವೀಕ್ಷಣೆ (18)",
              "drawer.prev": "← ಹಿಂದಿನ",
              "drawer.next": "ಮುಂದಿನ →",
              "drawer.jump": "ಪುಟ:",
              "footer.kernel": "ವಾಲ್ಟ್ ಕರ್ನಲ್ v4.19-ಏರ್‌ಗ್ಯಾಪ್",
              "footer.egress": "ಶೂನ್ಯ-ಹೊರಹರಿವು ಪರಿಶೀಲಿಸಲಾಗಿದೆ"
            }
          };

          // State
          let currentTheme = localStorage.getItem("vault_theme") || "light";
          let currentLang = localStorage.getItem("vault_lang") || "en";

          // 2. Theme Applier
          function applyTheme(theme) {
            currentTheme = theme;
            localStorage.setItem("vault_theme", theme);
            const root = document.documentElement;

            if (theme === "system") {
              const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
              if (prefersDark) {
                root.classList.add("dark");
              } else {
                root.classList.remove("dark");
              }
            } else if (theme === "dark") {
              root.classList.add("dark");
            } else {
              root.classList.remove("dark");
            }

            // Update theme segmented control buttons style
            document.querySelectorAll(".theme-option-btn").forEach(btn => {
              const val = btn.getAttribute("data-theme-val");
              if (val === theme) {
                btn.className = "theme-option-btn flex items-center justify-center gap-1 py-1 rounded font-mono text-[11px] bg-v-surface text-v-accent font-semibold shadow-xs border border-v-border";
              } else {
                btn.className = "theme-option-btn flex items-center justify-center gap-1 py-1 rounded font-mono text-[11px] text-v-text-sec hover:text-v-text transition-all";
              }
            });
          }

          // Listen for system theme changes if set to system
          window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", e => {
            if (currentTheme === "system") {
              applyTheme("system");
            }
          });

          // 3. Language Applier
          function applyLanguage(lang) {
            if (!i18nData[lang]) lang = "en";
            currentLang = lang;
            localStorage.setItem("vault_lang", lang);

            // Update trigger button indicator
            const langCodeDisplay = root.querySelector("#current-lang-code");
            if (langCodeDisplay) langCodeDisplay.textContent = lang.toUpperCase();

            // Update elements with data-i18n
            const dict = i18nData[lang];
            document.querySelectorAll("[data-i18n]").forEach(elem => {
              const key = elem.getAttribute("data-i18n");
              if (dict[key]) {
                elem.textContent = dict[key];
              }
            });

            // Update input placeholder
            const composerInput = root.querySelector("#main-composer-input");
            if (composerInput && dict["composer.placeholder"]) {
              composerInput.placeholder = dict["composer.placeholder"];
            }

            // Update language options checkmarks in popover
            document.querySelectorAll(".lang-option-btn").forEach(btn => {
              const val = btn.getAttribute("data-lang-val");
              const checkIcon = btn.querySelector(".check-icon");
              if (val === lang) {
                btn.classList.add("bg-v-surface-sec", "text-v-accent", "font-medium");
                if (checkIcon) checkIcon.classList.remove("opacity-0");
              } else {
                btn.classList.remove("bg-v-surface-sec", "text-v-accent", "font-medium");
                if (checkIcon) checkIcon.classList.add("opacity-0");
              }
            });
          }

          // 4. Popover Toggle & Global Interactions
          const settingsBtn = root.querySelector("#settings-trigger");
          const settingsPopover = root.querySelector("#settings-popover");

          if (settingsBtn && settingsPopover) {
            settingsBtn.addEventListener("click", function (e) {
              e.stopPropagation();
              const isOpen = !settingsPopover.classList.contains("hidden");
              if (isOpen) {
                settingsPopover.classList.add("hidden");
                settingsBtn.setAttribute("aria-expanded", "false");
              } else {
                settingsPopover.classList.remove("hidden");
                settingsBtn.setAttribute("aria-expanded", "true");
              }
            });

            // Close popover when clicking outside
            document.addEventListener("click", function (e) {
              if (!settingsPopover.contains(e.target) && !settingsBtn.contains(e.target)) {
                settingsPopover.classList.add("hidden");
                settingsBtn.setAttribute("aria-expanded", "false");
              }
            });
          }

          // Bind Theme Option clicks
          document.querySelectorAll(".theme-option-btn").forEach(btn => {
            btn.addEventListener("click", function () {
              const val = this.getAttribute("data-theme-val");
              applyTheme(val);
            });
          });

          // Bind Language Option clicks
          document.querySelectorAll(".lang-option-btn").forEach(btn => {
            btn.addEventListener("click", function () {
              const val = this.getAttribute("data-lang-val");
              applyLanguage(val);
            });
          });

          // Initial Mount
          applyTheme(currentTheme);
          applyLanguage(currentLang);
        })();
  

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
    <div ref={rootRef} className={"w-full h-screen flex flex-col select-none relative bg-v-bg font-sans text-v-text antialiased selection:bg-v-tint selection:text-v-accent pl-16"} style={{ display: hidden ? 'none' : undefined }}>
      {" "}<aside className={"group/sidebar fixed top-0 left-0 bottom-0 h-screen w-16 hover:w-56 bg-card-bg border-r border-border-subtle z-50 flex flex-col justify-between py-4 px-2.5 transition-all duration-200 ease-in-out shadow-sm overflow-hidden select-none"}><div className={"flex flex-col w-full gap-4"}><div className={"flex items-center gap-3 px-1.5 overflow-hidden"}><div className={"w-8 h-8 rounded bg-[#176B5B] flex items-center justify-center text-white font-semibold text-[14px] shrink-0 shadow-sm"} title={"VAULT SOV-01"}><span className={"w-2.5 h-2.5 bg-white rounded-[1px]"}></span></div><div className={"flex flex-col whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 min-w-0"}><span className={"font-code-md text-code-md font-semibold text-text-primary tracking-wide leading-tight truncate"}>VAULT SOV-01</span><span className={"font-label-sm text-[10px] text-text-muted uppercase tracking-wider"}>AIR-GAP v4.19</span></div></div><nav className={"flex flex-col w-full gap-1.5 mt-2"}><a className={"flex items-center gap-3 h-10 px-2 rounded-md text-text-muted hover:text-text-primary hover:bg-chip-bg transition-colors whitespace-nowrap overflow-hidden"} data-i18n-title={"nav_chat"} href={"#"} title={"Chat"}><span className={"material-symbols-outlined text-[20px] shrink-0"}>chat</span><span className={"font-body-md text-body-md font-medium opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200"} data-i18n={"nav_chat"}>Chat</span></a><a className={"relative flex items-center gap-3 h-10 px-2 rounded-md bg-accent-tint text-[#176B5B] transition-colors whitespace-nowrap overflow-hidden"} data-i18n-title={"nav_knowledge"} href={"#"} style={{"backgroundColor": "rgb(241, 247, 245)", "color": "rgb(23, 107, 91)"}} title={"Knowledge"}><span className={"absolute left-0 top-2 bottom-2 w-0.5 bg-[#176B5B] rounded-r"}></span><span className={"material-symbols-outlined text-[20px] shrink-0"}>menu_book</span><span className={"font-body-md text-body-md font-semibold opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 text-[#176B5B]"} data-i18n={"nav_knowledge"}>Knowledge</span></a><a className={"flex items-center gap-3 h-10 px-2 rounded-md text-text-muted hover:text-text-primary hover:bg-chip-bg transition-colors whitespace-nowrap overflow-hidden"} data-i18n-title={"nav_code"} href={"#"} title={"Code"}><span className={"material-symbols-outlined text-[20px] shrink-0"}>code</span><span className={"font-body-md text-body-md font-medium opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200"} data-i18n={"nav_code"}>Code</span></a><a className={"flex items-center gap-3 h-10 px-2 rounded-md text-text-muted hover:text-text-primary hover:bg-chip-bg transition-colors whitespace-nowrap overflow-hidden"} data-i18n-title={"nav_models"} href={"#"} title={"Models"}><span className={"material-symbols-outlined text-[20px] shrink-0"}>deployed_code</span><span className={"font-body-md text-body-md font-medium opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200"} data-i18n={"nav_models"}>Models</span></a><a className={"flex items-center gap-3 h-10 px-2 rounded-md text-text-muted hover:text-text-primary hover:bg-chip-bg transition-colors whitespace-nowrap overflow-hidden"} data-i18n-title={"nav_logs"} href={"#"} title={"Logs"}><span className={"material-symbols-outlined text-[20px] shrink-0"}>receipt_long</span><span className={"font-body-md text-body-md font-medium opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200"} data-i18n={"nav_logs"}>Logs</span></a></nav></div><div className={"flex flex-col w-full gap-3"}><div className={"flex items-center gap-3 px-2 py-1.5 rounded hover:bg-chip-bg/50 transition-colors cursor-pointer overflow-hidden whitespace-nowrap"} title={"OFFLINE · Air-gapped environment"}><div className={"w-6 flex items-center justify-center shrink-0"}><span className={"w-2.5 h-2.5 rounded-full bg-[#176B5B] animate-pulse"}></span></div><div className={"flex flex-col opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 min-w-0"}><span className={"font-label-sm text-[11px] text-[#176B5B] font-semibold uppercase tracking-wider leading-none"} data-i18n={"badge_offline"}>OFFLINE</span><span className={"font-body-sm text-[11px] text-text-muted leading-tight truncate"}>Air-gapped safe</span></div></div><div className={"relative flex items-center"}><button aria-expanded={"false"} aria-haspopup={"true"} className={"w-full h-10 px-2 rounded-md flex items-center gap-3 text-text-muted hover:text-text-primary hover:bg-chip-bg border border-border-subtle transition-colors overflow-hidden whitespace-nowrap"} id={"settings-trigger"} title={"Settings"}><span className={"material-symbols-outlined text-[20px] shrink-0"}>tune</span><span className={"font-body-md text-body-md font-medium opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200"} data-i18n={"settings_btn"}>Settings</span></button><div className={"hidden absolute left-full bottom-0 ml-2 w-64 bg-card-bg border border-border-subtle rounded shadow-lg p-3 z-50 flex flex-col gap-3 font-sans transition-colors duration-180"} id={"settings-popover"}><div className={"flex flex-col gap-1.5"}><label className={"font-label-sm text-label-sm text-text-muted uppercase tracking-wider"} data-i18n={"theme_label"}>Theme</label><div className={"grid grid-cols-3 gap-1 bg-chip-bg p-1 rounded border border-border-subtle"} id={"theme-controls"}><button className={"py-1 px-2 text-label-sm font-label-sm uppercase rounded transition-colors"} data-theme={"light"}>Light</button><button className={"py-1 px-2 text-label-sm font-label-sm uppercase rounded transition-colors"} data-theme={"dark"}>Dark</button><button className={"py-1 px-2 text-label-sm font-label-sm uppercase rounded transition-colors"} data-theme={"system"}>System</button></div></div><div className={"flex flex-col gap-1.5"}><label className={"font-label-sm text-label-sm text-text-muted uppercase tracking-wider"} data-i18n={"lang_label"}>Language</label><div className={"grid grid-cols-3 gap-1 bg-chip-bg p-1 rounded border border-border-subtle"} id={"lang-controls"}><button className={"py-1 px-1.5 text-center text-label-sm font-medium rounded transition-colors"} data-lang={"en"}>EN</button><button className={"py-1 px-1.5 text-center text-body-sm font-medium rounded transition-colors"} data-lang={"hi"}>हिन्दी</button><button className={"py-1 px-1.5 text-center text-body-sm font-medium rounded transition-colors"} data-lang={"kn"}>ಕನ್ನಡ</button></div></div></div></div></div></aside>{" "}<main className={"w-full min-h-screen bg-v-bg"}>{" "}<div className={"flex flex-col w-full text-v-text"}>{" "}<div className={"flex w-full select-none bg-v-bg h-screen overflow-hidden"}>{" "}<aside className={"w-[260px] flex-shrink-0 flex flex-col justify-between bg-v-surface border-r border-v-border px-5 py-6"} style={{"backgroundColor": "#F5F2EB"}}>{" "}<div className={"flex flex-col gap-6"}>{" "}<div className={"flex items-center justify-between"}>{" "}<div className={"flex items-center gap-2"}>{" "}<span className={"font-mono text-xs uppercase tracking-wider text-v-text font-semibold"} data-i18n={"sidebar.sources"}>Sources</span>{" "}<span className={"font-mono text-[11px] text-v-text-dim px-1.5 py-0.2 bg-v-surface-sec rounded"}>4</span>{" "}</div>{" "}<button className={"flex items-center gap-1 px-2 py-0.5 rounded border border-v-accent bg-v-accent text-white hover:opacity-90 transition-colors font-mono text-[11px]"} title={"Add source"} type={"button"}>{" "}<span className={"material-symbols-outlined text-[14px]"}>add</span>{" "}<span className={""} data-i18n={"sidebar.add"}>+ Add</span>{" "}</button>{" "}</div>{" "}<nav className={"flex flex-col gap-1"}>{" "}<div className={"group relative flex items-center gap-2.5 px-2.5 py-2 rounded bg-v-tint border border-v-border cursor-pointer transition-all"}>{" "}<span className={"w-1.5 h-1.5 rounded-full bg-v-accent flex-shrink-0"}></span>{" "}<span className={"material-symbols-outlined text-[17px] text-v-accent flex-shrink-0"}>description</span>{" "}<span className={"text-xs text-v-text truncate font-medium"}>Inspection Report.pdf</span>{" "}</div>{" "}<div className={"group relative flex items-center gap-2.5 px-2.5 py-2 rounded hover:bg-v-surface-sec cursor-pointer transition-all"}>{" "}<span className={"w-1.5 h-1.5 rounded-full bg-v-accent/40 flex-shrink-0"}></span>{" "}<span className={"material-symbols-outlined text-[17px] text-v-text-sec group-hover:text-v-text transition-colors flex-shrink-0"}>description</span>{" "}<span className={"text-xs text-v-text-sec group-hover:text-v-text truncate transition-colors"}>Maintenance SOP.pdf</span>{" "}</div>{" "}<div className={"group relative flex items-center gap-2.5 px-2.5 py-2 rounded hover:bg-v-surface-sec cursor-pointer transition-all"}>{" "}<span className={"w-1.5 h-1.5 rounded-full bg-v-text-dim flex-shrink-0"}></span>{" "}<span className={"material-symbols-outlined text-[17px] text-v-text-sec group-hover:text-v-text transition-colors flex-shrink-0"}>description</span>{" "}<span className={"text-xs text-v-text-sec group-hover:text-v-text truncate transition-colors"}>Safety Manual.pdf</span>{" "}</div>{" "}<div className={"group relative flex items-center gap-2.5 px-2.5 py-2 rounded hover:bg-v-surface-sec cursor-pointer transition-all"}>{" "}<span className={"w-1.5 h-1.5 rounded-full bg-v-text-dim flex-shrink-0"}></span>{" "}<span className={"material-symbols-outlined text-[17px] text-v-text-sec group-hover:text-v-text transition-colors flex-shrink-0"}>account_tree</span>{" "}<span className={"text-xs text-v-text-sec group-hover:text-v-text truncate transition-colors"}>P&amp;ID_Unit_04.pdf</span>{" "}</div>{" "}</nav>{" "}</div>{" "}<div className={"pt-4 border-t border-v-border flex flex-col gap-1.5"}>{" "}<div className={"flex items-center gap-2"}>{" "}<span className={"w-1.5 h-1.5 rounded-full bg-v-accent animate-pulse"}></span>{" "}<span className={"font-mono text-[11px] text-v-text-dim tracking-wider uppercase"} data-i18n={"sidebar.enclave"}>Local Enclave</span>{" "}</div>{" "}<p className={"font-mono text-[11px] leading-tight text-v-text-dim"} data-i18n={"sidebar.enclave_sub"}>
      4 sources indexed locally · Enclave memory active
      </p>{" "}</div>{" "}</aside>{" "}<section className={"flex-1 flex flex-col min-w-0 bg-v-bg relative"}>{" "}<div className={"h-12 px-8 flex items-center justify-between border-b border-v-border bg-v-surface/80 backdrop-blur-sm flex-shrink-0"}>{" "}<div className={"flex items-center gap-3"}>{" "}<h1 className={"text-lg font-medium tracking-tight text-v-text"} data-i18n={"workspace.title"}>Knowledge</h1>{" "}<span className={"text-v-text-dim text-sm"}>/</span>{" "}<div className={"flex items-center gap-1.5"}>{" "}<span className={"font-mono text-xs text-v-text-sec uppercase tracking-wider"} data-i18n={"workspace.grounding"}>Grounding</span>{" "}<span className={"font-mono text-[11px] text-v-text-sec px-1.5 py-0.5 bg-v-surface-sec border border-v-border rounded"} data-i18n={"workspace.source_count"}>4 sources</span>{" "}</div>{" "}</div>{" "}<div className={"flex items-center gap-3"}>{" "}<button className={"flex items-center gap-1.5 px-2.5 py-1 rounded border border-v-border bg-v-surface text-v-text-sec hover:text-v-text text-xs font-mono uppercase transition-colors shadow-sm"} type={"button"}>{" "}<span className={"material-symbols-outlined text-[14px]"}>tune</span>{" "}<span className={"text-v-accent font-medium"} data-i18n={"workspace.strict_btn"}>Grounding: Strict</span>{" "}</button>{" "}<button className={"w-7 h-7 rounded border border-v-border bg-v-surface flex items-center justify-center text-v-text-sec hover:text-v-text transition-colors shadow-sm"} title={"Export session synthesis"} type={"button"}>{" "}<span className={"material-symbols-outlined text-[16px]"}>file_download</span>{" "}</button>{" "}</div>{" "}</div>{" "}<div className={"flex-1 overflow-y-auto py-8 flex flex-col items-center select-text px-6"}>{" "}<div className={"w-full max-w-[760px] flex flex-col pb-36"}>{" "}<div className={"flex items-baseline justify-between mb-8 pb-4 border-b border-v-border"}>{" "}<h2 className={"text-2xl font-normal text-v-text tracking-tight"} data-i18n={"synthesis.query_heading"}>
      What are the shutdown requirements?
      </h2>{" "}<span className={"font-mono text-xs text-v-text-dim ml-4 flex-shrink-0"}>QUERY_ID #8902</span>{" "}</div>{" "}<article className={"flex flex-col gap-6"}>{" "}<div className={"flex items-center gap-2"}>{" "}<span className={"font-mono text-xs uppercase text-v-accent font-semibold tracking-widest px-2 py-0.5 bg-v-tint border border-v-border rounded"} data-i18n={"synthesis.badge"}>VAULT SYNTHESIS</span>{" "}<span className={"font-mono text-[11px] text-v-text-dim"} data-i18n={"synthesis.deterministic"}>Deterministic verification: 99.8%</span>{" "}</div>{" "}<p className={"text-base text-v-text-sec leading-relaxed font-normal"} data-i18n={"synthesis.lead"}>
      The maintenance procedure mandates a strict multi-staged physical isolation protocol prior to cold-loop inspection. Cross-document grounding references three compulsory gates:
      </p>{" "}<div className={"flex flex-col gap-3 pl-4 border-l-2 border-v-accent bg-v-surface border border-v-border p-4 rounded-r shadow-xs"}>{" "}<div className={"flex items-start gap-3"}>{" "}<span className={"font-mono text-xs text-v-accent font-semibold"}>01</span>{" "}<div className={"flex flex-col gap-2"}>{" "}<h3 className={"text-base font-medium text-v-text tracking-normal"} data-i18n={"point1.title"}>
      Primary Loop Depressurization
      </h3>{" "}<p className={"text-sm text-v-text-sec leading-relaxed"} data-i18n={"point1.body"}>
      Isolation valves <code className={"font-mono text-xs px-1 py-0.5 bg-v-surface-sec border border-v-border text-v-text rounded"}>IV-102</code> through <code className={"font-mono text-xs px-1 py-0.5 bg-v-surface-sec border border-v-border text-v-text rounded"}>IV-108</code> must be mechanically dogged and padlock-tagged. Differential telemetry must confirm zero bar (gauge) across bypass manifold B-7 before breaking flange seals.
      </p>{" "}<div className={"mt-1 flex items-center"}>{" "}<button className={"inline-flex items-center gap-2 px-2.5 py-1 rounded bg-v-surface border border-v-border text-v-accent hover:bg-v-tint transition-colors shadow-sm cursor-pointer"} type={"button"}>{" "}<span className={"material-symbols-outlined text-[14px]"}>auto_stories</span>{" "}<span className={"font-mono text-xs font-medium tracking-wide"}>Maintenance SOP · p.18</span>{" "}<span className={"w-1.5 h-1.5 rounded-full bg-v-accent"}></span>{" "}</button>{" "}</div>{" "}</div>{" "}</div>{" "}</div>{" "}<div className={"flex flex-col gap-3 pl-4 border-l border-v-border p-3.5 bg-v-surface/40 rounded"}>{" "}<div className={"flex items-start gap-3"}>{" "}<span className={"font-mono text-xs text-v-accent font-semibold"}>02</span>{" "}<div className={"flex flex-col gap-2"}>{" "}<h3 className={"text-base font-medium text-v-text tracking-normal"} data-i18n={"point2.title"}>
      Residual Thermal Dissipation Window
      </h3>{" "}<p className={"text-sm text-v-text-sec leading-relaxed"} data-i18n={"point2.body"}>
      Auxiliary cooling pumps must remain locked on forced-circulation bypass until all primary core thermocouple clusters register below 42°C for a continuous, uninterrupted 60-minute interval.
      </p>{" "}<div className={"mt-1 flex items-center"}>{" "}<button className={"inline-flex items-center gap-2 px-2.5 py-1 rounded bg-v-tint border border-v-border text-v-accent hover:border-v-accent/50 transition-colors shadow-xs cursor-pointer"} type={"button"}>{" "}<span className={"material-symbols-outlined text-[14px]"}>auto_stories</span>{" "}<span className={"font-mono text-xs font-medium tracking-wide"}>Inspection Report · p.23</span>{" "}</button>{" "}</div>{" "}</div>{" "}</div>{" "}</div>{" "}<div className={"flex flex-col gap-3 pl-4 border-l border-v-border p-4 bg-v-surface rounded border shadow-xs"}>{" "}<div className={"flex items-start gap-3"}>{" "}<span className={"font-mono text-xs text-v-accent font-semibold"}>03</span>{" "}<div className={"flex flex-col gap-2"}>{" "}<h3 className={"text-base font-medium text-v-text tracking-normal"} data-i18n={"point3.title"}>
      Secondary Containment Atmospheric Assurance
      </h3>{" "}<p className={"text-sm text-v-text-sec leading-relaxed"} data-i18n={"point3.body"}>
      Atmospheric sensor verification for volatile fluorocarbons must be logged at 15-minute intervals across all four facility quadrants. Manual technician hatch interlocks will refuse authorization until scrubbers complete two volume exchanges.
      </p>{" "}<div className={"mt-1 flex items-center"}>{" "}<button className={"inline-flex items-center gap-2 px-2.5 py-1 rounded bg-v-tint border border-v-border text-v-accent hover:border-v-accent/50 transition-colors shadow-xs cursor-pointer"} type={"button"}>{" "}<span className={"material-symbols-outlined text-[14px]"}>auto_stories</span>{" "}<span className={"font-mono text-xs font-medium tracking-wide"}>Safety Manual · p.91</span>{" "}</button>{" "}</div>{" "}</div>{" "}</div>{" "}</div>{" "}<div className={"flex flex-col gap-3 pl-4 border-l border-v-border p-4 bg-v-surface rounded border shadow-xs"}>{" "}<div className={"flex items-center gap-3"}>{" "}<span className={"material-symbols-outlined text-v-text-dim text-[18px]"}>verified_user</span>{" "}</div>{" "}<button className={"font-mono text-xs text-v-text-sec hover:text-v-text uppercase underline tracking-wider"} data-i18n={"synthesis.audit"} type={"button"}>Audit Log</button>{" "}</div>{" "}</article>{" "}</div>{" "}</div>{" "}<div className={"absolute bottom-0 left-0 right-0 p-6 flex flex-col items-center bg-gradient-to-t from-v-bg via-v-bg/95 to-transparent pointer-events-none"}>{" "}<div className={"w-full max-w-[740px] flex flex-col gap-2.5 pointer-events-auto"}>{" "}<div className={"flex items-center justify-center gap-3 overflow-x-auto py-1"}>{" "}<button className={"font-mono text-[11px] text-v-text-sec hover:text-v-accent transition-colors cursor-pointer truncate"} data-i18n={"prompt.sugg1"} type={"button"}>
      "What are the shutdown requirements?"
      </button>{" "}<span className={"text-v-text-dim font-mono text-[10px]"}>·</span>{" "}<button className={"font-mono text-[11px] text-v-text-sec hover:text-v-accent transition-colors cursor-pointer truncate"} data-i18n={"prompt.sugg2"} type={"button"}>
      "Find previous corrosion findings."
      </button>{" "}<span className={"text-v-text-dim font-mono text-[10px]"}>·</span>{" "}<button className={"font-mono text-[11px] text-v-text-sec hover:text-v-accent transition-colors cursor-pointer truncate"} data-i18n={"prompt.sugg3"} type={"button"}>
      "Summarize the inspection report."
      </button>{" "}</div>{" "}<div className={"w-full flex items-center bg-v-surface border border-v-border rounded-full px-3 py-2 shadow-lg focus-within:border-v-accent/70 transition-all pl-2.5 pr-2.5"}><button className={"w-8 h-8 rounded-full flex items-center justify-center text-v-text-sec hover:text-v-text transition-colors flex-shrink-0 hover:bg-v-surface-sec"} title={"Add local document to context"} type={"button"}><span className={"material-symbols-outlined text-[20px]"}>add</span></button><input className={"flex-1 bg-transparent px-3 text-sm text-v-text placeholder:text-v-text-dim focus:outline-none"} id={"main-composer-input"} placeholder={"Ask your private knowledge base..."} type={"text"} /><div className={"flex items-center gap-1.5 flex-shrink-0"}><span className={"font-mono text-[10px] text-v-text-sec px-2 py-0.5 bg-v-surface-sec rounded-full border border-v-border"}>⌘K</span><button className={"w-8 h-8 rounded-full bg-v-accent text-white flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer shadow-sm"} title={"Submit Query"} type={"button"}><span className={"material-symbols-outlined text-[18px]"}>arrow_upward</span></button></div></div>{" "}</div>{" "}</div>{" "}</section>{" "}<aside className={"flex-shrink-0 flex flex-col bg-v-surface border-l border-v-border overflow-hidden select-text w-64"}>{" "}<div className={"p-4 border-b border-v-border flex items-start justify-between bg-v-surface"}>{" "}<div className={"flex flex-col min-w-0 pr-2"}>{" "}<div className={"flex items-center gap-2"}>{" "}<span className={"material-symbols-outlined text-[16px] text-v-accent"}>menu_book</span>{" "}<h4 className={"text-sm font-medium text-v-text truncate"}>Maintenance SOP.pdf</h4>{" "}</div>{" "}<span className={"font-mono text-xs text-v-text-sec mt-1 truncate"} data-i18n={"drawer.header_sub"}>
      Page 18 of 64 · Section 4.2 Depressurization
      </span>{" "}</div>{" "}<button aria-label={"Close document drawer"} className={"w-6 h-6 rounded flex items-center justify-center text-v-text-sec hover:text-v-text hover:bg-v-surface-sec transition-colors flex-shrink-0"} type={"button"}>{" "}<span className={"material-symbols-outlined text-[16px]"}>close</span>{" "}</button>{" "}</div>{" "}<div className={"px-4 py-2 bg-v-tint border-b border-v-border flex items-center justify-between"}>{" "}<span className={"font-mono text-[11px] text-v-accent uppercase tracking-wider flex items-center gap-1.5 font-medium"}>{" "}<span className={"w-1.5 h-1.5 rounded-full bg-v-accent"}></span>{" "}<span className={""} data-i18n={"drawer.citation_match"}>Exact Citation Match</span>{" "}</span>{" "}<span className={"font-mono text-[10px] text-v-text-dim"}>OCR SHA-256: 7f8c</span>{" "}</div>{" "}<div className={"flex-1 overflow-y-auto p-4 flex flex-col gap-4 font-mono text-xs text-v-text-sec leading-relaxed bg-v-surface"}>{" "}<div className={"border-b border-v-border pb-3 text-v-text-dim text-[11px] space-y-0.5"}>{" "}<div className={""}>DOCUMENT ID: SOP-MECH-449-REV8</div>{" "}<div className={""}>CLASSIFICATION: RESTRICTED ACCESS // AIRGAP</div>{" "}<div className={""}>SOURCE TIMESTAMP: 2024-11-04 03:12:00 UTC</div>{" "}</div>{" "}<p className={"text-v-text-sec text-xs leading-normal"}>
      [4.1 PRE-ISOLATION VERIFICATION]<br />
      Notify Central Monitoring Desk before manipulating primary manifolds. Tagout log entry must be witnessed by two Level-3 technicians.
      </p>{" "}<div className={"p-3 rounded bg-v-bg border-l-4 border-l-v-accent border border-v-border relative"}>{" "}<div className={"text-[10px] tracking-wider uppercase font-semibold text-v-accent mb-2 flex items-center justify-between"}>{" "}<span className={""} data-i18n={"drawer.target_badge"}>Grounding Target · Excerpt #1</span>{" "}<span className={"px-1.5 py-0.5 bg-v-tint text-v-accent rounded border border-v-border font-mono text-[10px]"}>99.8% Match</span>{" "}</div>{" "}<div className={"text-v-text text-xs leading-relaxed space-y-2"}>{" "}<p className={"font-medium text-v-accent"}>
      SECTION 4.2 — COLD-LOOP VALVE ISOLATION PROTOCOL
      </p>{" "}<p className={"bg-v-surface text-v-text p-2 rounded border border-v-border"} data-i18n={"drawer.snippet_body"}>
      "During scheduled or emergency cycle shutdowns, isolation valves IV-102 through IV-108 shall be mechanically dogged and padlock-tagged. Differential telemetry must confirm zero bar (gauge) across bypass manifold B-7 before breaking flange seals..."
      </p>{" "}</div>{" "}</div>{" "}<p className={"text-v-text-sec text-xs leading-normal"}>
      [4.3 SEAL EXTRACTION PROCEDURES]<br />
      Flange bolts 1 through 12 shall be loosened in star formation sequence at 30° increments. Any detection of persistent head pressure aborts cold-loop clearance immediately.
      </p>{" "}<div className={"mt-4 p-3 bg-v-surface-sec border border-v-border rounded flex flex-col gap-2"}>{" "}<div className={"flex items-center justify-between text-[11px] text-v-text-sec font-mono"}>{" "}<span className={"font-medium"} data-i18n={"drawer.preview"}>PAGE PREVIEW (18)</span>{" "}<span className={"material-symbols-outlined text-[14px]"}>aspect_ratio</span>{" "}</div>{" "}<div className={"w-full h-24 bg-v-surface rounded border border-v-border p-2 flex flex-col gap-1.5 overflow-hidden opacity-90"}>{" "}<div className={"w-2/3 h-1.5 bg-v-border rounded"}></div>{" "}<div className={"w-full h-1 bg-v-surface-sec rounded"}></div>{" "}<div className={"w-5/6 h-1 bg-v-surface-sec rounded"}></div>{" "}<div className={"w-4/5 h-2 bg-v-tint border border-v-accent/30 rounded mt-1"}></div>{" "}<div className={"w-full h-1 bg-v-surface-sec rounded"}></div>{" "}<div className={"w-1/2 h-1 bg-v-surface-sec rounded"}></div>{" "}</div>{" "}</div>{" "}</div>{" "}<div className={"p-3 border-t border-v-border bg-v-surface flex items-center justify-between"}>{" "}<div className={"flex items-center gap-1 font-mono"}>{" "}<button className={"px-2 py-1 rounded bg-v-surface border border-v-border text-v-text-sec hover:text-v-text hover:bg-v-surface-sec text-xs transition-colors shadow-xs"} data-i18n={"drawer.prev"} type={"button"}>
      ← Prev
      </button>{" "}<button className={"px-2 py-1 rounded bg-v-surface border border-v-border text-v-text-sec hover:text-v-text hover:bg-v-surface-sec text-xs transition-colors shadow-xs"} data-i18n={"drawer.next"} type={"button"}>
      Next →
      </button>{" "}</div>{" "}<div className={"flex items-center gap-1.5 font-mono"}>{" "}<span className={"text-[11px] text-v-text-sec"} data-i18n={"drawer.jump"}>Jump:</span>{" "}<input className={"w-9 text-center bg-v-surface border border-v-border rounded text-xs text-v-text py-0.5 focus:outline-none focus:border-v-accent"} type={"text"} defaultValue={"18"} />{" "}</div>{" "}</div>{" "}</aside>{" "}</div>{" "}</div>{" "}</main>{" "}<footer className={"w-full bg-v-surface border-t border-v-border py-2 ml-16"}>{" "}<div className={"w-full px-6 flex items-center justify-between font-mono text-[11px] text-v-text-dim"}>{" "}<span className={""} data-i18n={"footer.kernel"}>VAULT KERNEL v4.19-AIRGAP</span>{" "}<div className={"flex items-center gap-4"}>{" "}<span className={""}>MEM: 128GB LOCK</span>{" "}<span className={""}>SEC: LEVEL-5</span>{" "}<span className={""} data-i18n={"footer.egress"}>ZERO-EGRESS VERIFIED</span>{" "}</div>{" "}</div>{" "}</footer>{" "}
    </div>
  )
}
