import { useEffect, useRef } from "react";

export default function LogsScreen({ onNavigate }) {
  const rootRef = useRef(null);
  const navRef = useRef(onNavigate);
  navRef.current = onNavigate;

  useEffect(() => {
    const root = rootRef.current;

    (function () {
      /* --- i18n Translations Dictionary --- */
      const translations = {
        en: {
          nav_chat: "Chat",
          nav_knowledge: "Knowledge",
          nav_code: "Code",
          nav_models: "Models",
          nav_logs: "Logs",
          badge_offline: "OFFLINE",
          settings_btn: "Settings",
          theme_label: "Theme",
          lang_label: "Language",
          title_activity: "Activity",
          badge_airgapped: "AIR-GAPPED",
          badge_requests: "0 external requests",
          filter_all: "All",
          filter_agent: "Agent",
          filter_files: "Files",
          filter_models: "Models",
          filter_tools: "Tools",
          filter_network: "Network",
          filter_placeholder: "FILTER LOG...",
          event_opened: "Opened",
          event_ocr: "OCR completed",
          event_search: "Knowledge search",
          event_model_selected: "Model selected",
          event_sandbox: "Sandbox execution",
          event_artifact: "Artifact generated",
          event_network: "Network verification",
          meta_pages_parsed: "42 pages parsed",
          meta_text_extracted: "Text & tables extracted",
          meta_local_sources: "12 local sources",
          meta_grounding_threshold: "Grounding threshold 99.8%",
          meta_telemetry_ready: "Telemetry log ready",
          meta_stored_vault: "Stored in local encrypted vault",
          meta_killswitch: "Zero-egress hardware killswitch active",
          status_verified: "verified",
          status_ready: "ready",
          status_saved: "saved",
          status_passed: "PASSED",
          drawer_model: "Model",
          drawer_duration: "Duration",
          drawer_input_digest: "Input Digest",
          drawer_isolation: "Isolation",
          drawer_attestation: "Attestation",
          drawer_attestation_val: "Enclave SHA-256 Signature Validated",
          drawer_raw_payload: "RAW PAYLOAD",
          footer_integrity: "INTEGRITY STATUS: SECURE & UNCOMPROMISED",
          footer_recorded_ingests: "7 RECORDED INGESTS",
          footer_no_packets: "NO PACKETS TRANSMITTED OUTBOUND",
          footer_zero_egress: "ZERO-EGRESS VERIFIED",
        },
      };

      /* --- State Management --- */
      let currentTheme = localStorage.getItem("vault_theme") || "system";
      let currentLang = localStorage.getItem("vault_lang") || "en";

      function applyTheme(theme) {
        currentTheme = theme;
        localStorage.setItem("vault_theme", theme);

        const html = document.documentElement;
        const isDark =
          theme === "dark" ||
          (theme === "system" &&
            window.matchMedia("(prefers-color-scheme: dark)").matches);

        if (isDark) {
          html.classList.add("dark");
        } else {
          html.classList.remove("dark");
        }

        // Update switcher active styling
        document.querySelectorAll("#theme-controls button").forEach((btn) => {
          if (btn.getAttribute("data-theme") === theme) {
            btn.className =
              "py-1 px-2 text-label-sm font-label-sm uppercase rounded transition-colors bg-text-primary text-card-bg font-medium shadow-sm";
          } else {
            btn.className =
              "py-1 px-2 text-label-sm font-label-sm uppercase rounded transition-colors text-text-muted hover:text-text-primary";
          }
        });
      }

      function applyLanguage(lang) {
        if (!translations[lang]) lang = "en";
        currentLang = lang;
        localStorage.setItem("vault_lang", lang);
        document.documentElement.lang = lang;

        const dict = translations[lang];

        // Update all data-i18n elements
        document.querySelectorAll("[data-i18n]").forEach((el) => {
          const key = el.getAttribute("data-i18n");
          if (dict[key] !== undefined) {
            el.innerText = dict[key];
          }
        });

        // Update placeholders
        document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
          const key = el.getAttribute("data-i18n-placeholder");
          if (dict[key] !== undefined) {
            el.placeholder = dict[key];
          }
        });

        // Update switcher active styling
        document.querySelectorAll("#lang-controls button").forEach((btn) => {
          const bLang = btn.getAttribute("data-lang");
          if (bLang === lang) {
            btn.className =
              "py-1 px-1.5 text-center text-body-sm font-medium rounded transition-colors bg-text-primary text-card-bg shadow-sm";
          } else {
            btn.className =
              "py-1 px-1.5 text-center text-body-sm font-medium rounded transition-colors text-text-muted hover:text-text-primary";
          }
        });
      }

      // System theme listener
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", () => {
          if (currentTheme === "system") {
            applyTheme("system");
          }
        });

      // Popover toggle & outside click handling
      const settingsTrigger = document.getElementById("settings-trigger");
      const settingsPopover = document.getElementById("settings-popover");

      if (settingsTrigger && settingsPopover) {
        settingsTrigger.addEventListener("click", (e) => {
          e.stopPropagation();
          const isHidden = settingsPopover.classList.contains("hidden");
          if (isHidden) {
            settingsPopover.classList.remove("hidden");
            settingsTrigger.setAttribute("aria-expanded", "true");
          } else {
            settingsPopover.classList.add("hidden");
            settingsTrigger.setAttribute("aria-expanded", "false");
          }
        });

        document.addEventListener("click", (e) => {
          if (
            !settingsPopover.contains(e.target) &&
            !settingsTrigger.contains(e.target)
          ) {
            settingsPopover.classList.add("hidden");
            settingsTrigger.setAttribute("aria-expanded", "false");
          }
        });
      }

      // Bind theme buttons
      document.querySelectorAll("#theme-controls button").forEach((btn) => {
        btn.addEventListener("click", () => {
          applyTheme(btn.getAttribute("data-theme"));
        });
      });

      // Bind lang buttons
      document.querySelectorAll("#lang-controls button").forEach((btn) => {
        btn.addEventListener("click", () => {
          applyLanguage(btn.getAttribute("data-lang"));
        });
      });

      // Initialize Theme and Language
      applyTheme(currentTheme);
      applyLanguage(currentLang);

      /* --- Accordion Logic --- */
      const trigger = document.getElementById("accordion-trigger");
      const content = document.getElementById("accordion-content");
      const arrow = document.getElementById("accordion-arrow");

      if (trigger && content && arrow) {
        trigger.addEventListener("click", () => {
          const isHidden = content.classList.contains("hidden");
          if (isHidden) {
            content.classList.remove("hidden");
            arrow.classList.remove("rotate-180");
          } else {
            content.classList.add("hidden");
            arrow.classList.add("rotate-180");
          }
        });
      }

      /* --- Filter and Search Logic --- */
      const navButtons = document.querySelectorAll("#filter-nav button");
      const rows = document.querySelectorAll("#activity-stream article");
      const searchInput = document.getElementById("search-input");
      const clearBtn = document.getElementById("clear-btn");

      let currentCategory = "all";

      function filterEvents() {
        const query = (searchInput.value || "").toLowerCase().trim();

        rows.forEach((row) => {
          const cat = row.getAttribute("data-category") || "";
          const matchesCategory =
            currentCategory === "all" || cat === currentCategory;
          const text = row.innerText.toLowerCase();
          const matchesQuery = query === "" || text.includes(query);

          if (matchesCategory && matchesQuery) {
            row.style.display = "flex";
          } else {
            row.style.display = "none";
          }
        });
      }

      navButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
          navButtons.forEach((b) => {
            b.classList.remove("text-white", "bg-text-primary");
            b.classList.add("text-text-muted");
          });
          btn.classList.remove("text-text-muted");
          btn.classList.add("text-white", "bg-text-primary");

          currentCategory = btn.getAttribute("data-filter") || "all";
          filterEvents();
        });
      });

      if (searchInput) {
        searchInput.addEventListener("input", filterEvents);
      }

      if (clearBtn && searchInput) {
        clearBtn.addEventListener("click", () => {
          searchInput.value = "";
          currentCategory = "all";
          navButtons.forEach((b, idx) => {
            if (idx === 0) {
              b.classList.add("text-white", "bg-text-primary");
              b.classList.remove("text-text-muted");
            } else {
              b.classList.remove("text-white", "bg-text-primary");
              b.classList.add("text-text-muted");
            }
          });
          filterEvents();
        });
      }
    })();

    const TARGETS = [
      ["chat", ["chat"]],
      ["kb", ["knowledge"]],
      ["code", ["code"]],
      ["models", ["models"]],
      ["logs", ["logs", "activity"]],
    ];
    const sidebar = root.querySelector("aside");
    if (sidebar) {
      sidebar.querySelectorAll('a[href="#"]').forEach((a) => {
        const key = [
          a.id,
          a.dataset.path,
          a.dataset.i18nTitle,
          a.getAttribute("title"),
          a.getAttribute("aria-label"),
          a.textContent,
        ]
          .join(" ")
          .toLowerCase();
        const hit = TARGETS.find(([, words]) =>
          words.some((w) => key.includes(w)),
        );
        if (!hit) return;
        a.addEventListener("click", (e) => {
          e.preventDefault();
          navRef.current && navRef.current(hit[0]);
        });
      });
    }
    root.querySelectorAll("[data-onclick]").forEach((el) => {
      el.addEventListener("click", () => {
        eval(el.getAttribute("data-onclick"));
      });
    });
  }, []);

  return (
    <div
      ref={rootRef}
      className={"bg-page-bg font-body-md text-text-primary antialiased"}
    >
      <main
        className={
          " min-h-screen pb-7 bg-page-bg transition-colors duration-180"
        }
      >
        <div className={"flex flex-col w-full"}>
          {" "}
          <div className={"w-full flex justify-center py-space-xl px-margin"}>
            {" "}
            <div className={"w-full max-w-[820px] flex flex-col"}>
              {" "}
              <section className={"flex flex-col mb-space-lg"}>
                {" "}
                <div
                  className={"flex items-center justify-between pb-space-md"}
                >
                  {" "}
                  <div className={"flex items-center gap-space-md"}>
                    {" "}
                    <h1
                      className={
                        "font-headline-lg text-headline-lg text-text-primary font-semibold tracking-tight"
                      }
                      data-i18n={"title_activity"}
                    >
                      Activity
                    </h1>{" "}
                    <span
                      className={
                        "px-2 py-0.5 bg-chip-bg border border-border-subtle rounded text-text-muted font-label-sm text-label-sm uppercase tracking-wider"
                      }
                    >
                      SESSION #4821-C
                    </span>{" "}
                  </div>{" "}
                  <div
                    className={
                      "flex items-center gap-2 bg-accent-tint px-3 py-1.5 rounded border border-border-subtle transition-colors duration-180"
                    }
                    style={{
                      backgroundColor: "#E8F4F0",
                      borderColor: "#D3E7E1",
                    }}
                  >
                    <span
                      className={
                        "w-2.5 h-2.5 rounded-full bg-[#176B5B] animate-pulse"
                      }
                    ></span>{" "}
                    <span
                      className={
                        "font-label-sm text-label-sm text-[#176B5B] uppercase tracking-wide font-medium"
                      }
                      data-i18n={"badge_airgapped"}
                    >
                      AIR-GAPPED
                    </span>{" "}
                    <span
                      className={
                        "text-[#176B5B]/60 text-label-sm font-label-sm"
                      }
                    >
                      Â·
                    </span>{" "}
                    <span
                      className={"font-label-sm text-label-sm text-[#176B5B]"}
                      data-i18n={"badge_requests"}
                    >
                      0 external requests
                    </span>
                  </div>{" "}
                </div>{" "}
                <div
                  className={
                    "flex items-center justify-between pt-2 border-b border-border-subtle pb-3"
                  }
                >
                  {" "}
                  <nav className={"flex items-center gap-1"} id={"filter-nav"}>
                    {" "}
                    <button
                      className={
                        "px-2.5 py-1 text-white font-label-sm text-label-sm uppercase tracking-wider bg-text-primary rounded transition-colors"
                      }
                      data-filter={"all"}
                      data-i18n={"filter_all"}
                      style={{
                        backgroundColor: "rgb(23, 107, 91)",
                        color: "rgb(255, 255, 255)",
                      }}
                    >
                      All
                    </button>{" "}
                    <button
                      className={
                        "px-2.5 py-1 text-text-muted hover:text-text-primary hover:bg-chip-bg font-label-sm text-label-sm uppercase tracking-wider rounded transition-colors"
                      }
                      data-filter={"agent"}
                      data-i18n={"filter_agent"}
                    >
                      Agent
                    </button>{" "}
                    <button
                      className={
                        "px-2.5 py-1 text-text-muted hover:text-text-primary hover:bg-chip-bg font-label-sm text-label-sm uppercase tracking-wider rounded transition-colors"
                      }
                      data-filter={"files"}
                      data-i18n={"filter_files"}
                    >
                      Files
                    </button>{" "}
                    <button
                      className={
                        "px-2.5 py-1 text-text-muted hover:text-text-primary hover:bg-chip-bg font-label-sm text-label-sm uppercase tracking-wider rounded transition-colors"
                      }
                      data-filter={"models"}
                      data-i18n={"filter_models"}
                    >
                      Models
                    </button>{" "}
                    <button
                      className={
                        "px-2.5 py-1 text-text-muted hover:text-text-primary hover:bg-chip-bg font-label-sm text-label-sm uppercase tracking-wider rounded transition-colors"
                      }
                      data-filter={"tools"}
                      data-i18n={"filter_tools"}
                    >
                      Tools
                    </button>{" "}
                    <button
                      className={
                        "px-2.5 py-1 text-text-muted hover:text-text-primary hover:bg-chip-bg font-label-sm text-label-sm uppercase tracking-wider rounded transition-colors"
                      }
                      data-filter={"network"}
                      data-i18n={"filter_network"}
                    >
                      Network
                    </button>{" "}
                  </nav>{" "}
                  <div className={"flex items-center gap-3"}>
                    {" "}
                    <div className={"relative flex items-center"}>
                      {" "}
                      <span
                        className={
                          "material-symbols-outlined absolute left-2 text-text-placeholder text-[16px] pointer-events-none"
                        }
                      >
                        search
                      </span>{" "}
                      <input
                        className={
                          "bg-card-bg border border-border-subtle rounded pl-7 pr-2.5 py-1 font-code-md text-code-md text-text-primary placeholder:text-text-placeholder focus:outline-none focus:border-[#176B5B] w-48 uppercase transition-colors"
                        }
                        data-i18n-placeholder={"filter_placeholder"}
                        id={"search-input"}
                        placeholder={"FILTER LOG..."}
                        type={"text"}
                      />{" "}
                    </div>{" "}
                    <button
                      className={
                        "flex items-center text-text-muted hover:text-text-primary transition-colors p-1"
                      }
                      id={"clear-btn"}
                      title={"Clear current filter"}
                    >
                      {" "}
                      <span className={"material-symbols-outlined text-[18px]"}>
                        filter_alt_off
                      </span>{" "}
                    </button>{" "}
                  </div>{" "}
                </div>{" "}
              </section>{" "}
              <section
                className={
                  "flex flex-col divide-y divide-border-subtle border-t border-b border-border-subtle rounded-sm transition-colors duration-180 bg-card-bg"
                }
                id={"activity-stream"}
              >
                {" "}
                <article
                  className={
                    "group flex items-start gap-4 py-3 px-3 hover:bg-chip-bg/50 transition-colors"
                  }
                  data-category={"files"}
                >
                  {" "}
                  <span
                    className={
                      "font-code-md text-code-md text-text-muted tracking-tight select-none pt-0.5 w-16 shrink-0"
                    }
                  >
                    08:42:11
                  </span>{" "}
                  <div
                    className={
                      "flex items-center justify-center w-5 h-5 text-text-muted pt-0.5 shrink-0"
                    }
                  >
                    {" "}
                    <span className={"material-symbols-outlined text-[18px]"}>
                      description
                    </span>{" "}
                  </div>{" "}
                  <div
                    className={
                      "flex-1 min-w-0 flex items-baseline justify-between gap-3"
                    }
                  >
                    {" "}
                    <div className={"flex items-baseline gap-2 min-w-0"}>
                      {" "}
                      <span
                        className={
                          "font-body-md text-body-md font-medium text-text-primary shrink-0"
                        }
                        data-i18n={"event_opened"}
                      >
                        Opened
                      </span>{" "}
                      <span
                        className={
                          "font-code-md text-code-md text-text-muted truncate"
                        }
                      >
                        Inspection_Report.pdf
                      </span>{" "}
                      <span
                        className={
                          "text-border-subtle text-label-sm select-none"
                        }
                      >
                        Â·
                      </span>{" "}
                      <span
                        className={
                          "font-body-sm text-body-sm text-text-muted truncate"
                        }
                      >
                        4.2 MB Â· SHA-256 verified
                      </span>{" "}
                    </div>{" "}
                    <div className={"flex items-center gap-2 shrink-0"}>
                      {" "}
                      <span
                        className={
                          "font-label-sm text-label-sm text-text-muted px-1.5 py-0.5 rounded border border-border-subtle"
                        }
                        data-i18n={"status_verified"}
                      >
                        verified
                      </span>{" "}
                    </div>{" "}
                  </div>{" "}
                </article>{" "}
                <article
                  className={
                    "group flex items-start gap-4 py-3 px-3 hover:bg-chip-bg/50 transition-colors"
                  }
                  data-category={"files"}
                >
                  {" "}
                  <span
                    className={
                      "font-code-md text-code-md text-text-muted tracking-tight select-none pt-0.5 w-16 shrink-0"
                    }
                  >
                    08:42:14
                  </span>{" "}
                  <div
                    className={
                      "flex items-center justify-center w-5 h-5 text-text-muted pt-0.5 shrink-0"
                    }
                  >
                    {" "}
                    <span className={"material-symbols-outlined text-[18px]"}>
                      document_scanner
                    </span>{" "}
                  </div>{" "}
                  <div
                    className={
                      "flex-1 min-w-0 flex items-baseline justify-between gap-3"
                    }
                  >
                    {" "}
                    <div className={"flex items-baseline gap-2 min-w-0"}>
                      {" "}
                      <span
                        className={
                          "font-body-md text-body-md font-medium text-text-primary shrink-0"
                        }
                        data-i18n={"event_ocr"}
                      >
                        OCR completed
                      </span>{" "}
                      <span
                        className={
                          "font-code-md text-code-md text-text-muted truncate"
                        }
                        data-i18n={"meta_pages_parsed"}
                      >
                        42 pages parsed
                      </span>{" "}
                      <span
                        className={
                          "text-border-subtle text-label-sm select-none"
                        }
                      >
                        Â·
                      </span>{" "}
                      <span
                        className={
                          "font-body-sm text-body-sm text-text-muted truncate"
                        }
                        data-i18n={"meta_text_extracted"}
                      >
                        Text &amp; tables extracted
                      </span>{" "}
                    </div>{" "}
                    <div className={"flex items-center gap-2 shrink-0"}>
                      {" "}
                      <span
                        className={"font-code-md text-code-md text-text-muted"}
                      >
                        3.12s
                      </span>{" "}
                    </div>{" "}
                  </div>{" "}
                </article>{" "}
                <article
                  className={
                    "group flex items-start gap-4 py-3 px-3 hover:bg-chip-bg/50 transition-colors"
                  }
                  data-category={"agent"}
                >
                  {" "}
                  <span
                    className={
                      "font-code-md text-code-md text-text-muted tracking-tight select-none pt-0.5 w-16 shrink-0"
                    }
                  >
                    08:42:19
                  </span>{" "}
                  <div
                    className={
                      "flex items-center justify-center w-5 h-5 text-text-muted pt-0.5 shrink-0"
                    }
                  >
                    {" "}
                    <span className={"material-symbols-outlined text-[18px]"}>
                      saved_search
                    </span>{" "}
                  </div>{" "}
                  <div
                    className={
                      "flex-1 min-w-0 flex items-baseline justify-between gap-3"
                    }
                  >
                    {" "}
                    <div className={"flex items-baseline gap-2 min-w-0"}>
                      {" "}
                      <span
                        className={
                          "font-body-md text-body-md font-medium text-text-primary shrink-0"
                        }
                        data-i18n={"event_search"}
                      >
                        Knowledge search
                      </span>{" "}
                      <span
                        className={
                          "font-code-md text-code-md text-text-muted truncate"
                        }
                        data-i18n={"meta_local_sources"}
                      >
                        12 local sources
                      </span>{" "}
                      <span
                        className={
                          "text-border-subtle text-label-sm select-none"
                        }
                      >
                        Â·
                      </span>{" "}
                      <span
                        className={
                          "font-body-sm text-body-sm text-text-muted truncate"
                        }
                        data-i18n={"meta_grounding_threshold"}
                      >
                        Grounding threshold 99.8%
                      </span>{" "}
                    </div>{" "}
                    <div className={"flex items-center gap-2 shrink-0"}>
                      {" "}
                      <span
                        className={"font-code-md text-code-md text-text-muted"}
                      >
                        180ms
                      </span>{" "}
                    </div>{" "}
                  </div>{" "}
                </article>{" "}
                <article
                  className={
                    "group flex items-start gap-4 py-3 px-3 hover:bg-chip-bg/50 transition-colors"
                  }
                  data-category={"models"}
                >
                  {" "}
                  <span
                    className={
                      "font-code-md text-code-md text-text-muted tracking-tight select-none pt-0.5 w-16 shrink-0"
                    }
                  >
                    08:42:24
                  </span>{" "}
                  <div
                    className={
                      "flex items-center justify-center w-5 h-5 text-text-muted pt-0.5 shrink-0"
                    }
                  >
                    {" "}
                    <span className={"material-symbols-outlined text-[18px]"}>
                      memory
                    </span>{" "}
                  </div>{" "}
                  <div
                    className={
                      "flex-1 min-w-0 flex items-baseline justify-between gap-3"
                    }
                  >
                    {" "}
                    <div className={"flex items-baseline gap-2 min-w-0"}>
                      {" "}
                      <span
                        className={
                          "font-body-md text-body-md font-medium text-text-primary shrink-0"
                        }
                        data-i18n={"event_model_selected"}
                      >
                        Model selected
                      </span>{" "}
                      <span
                        className={
                          "font-code-md text-code-md text-text-muted truncate"
                        }
                      >
                        Local reasoning 32B
                      </span>{" "}
                      <span
                        className={
                          "text-border-subtle text-label-sm select-none"
                        }
                      >
                        Â·
                      </span>{" "}
                      <span
                        className={
                          "font-body-sm text-body-sm text-text-muted truncate"
                        }
                      >
                        VRAM allocated 22.4 GB
                      </span>{" "}
                    </div>{" "}
                    <div className={"flex items-center gap-2 shrink-0"}>
                      {" "}
                      <span
                        className={"font-code-md text-code-md text-text-muted"}
                        data-i18n={"status_ready"}
                      >
                        ready
                      </span>{" "}
                    </div>{" "}
                  </div>{" "}
                </article>{" "}
                <article
                  className={"flex flex-col bg-chip-bg/40 transition-colors"}
                  data-category={"tools"}
                >
                  {" "}
                  <div
                    className={
                      "flex items-start gap-4 py-3 px-3 cursor-pointer hover:bg-chip-bg/70"
                    }
                    id={"accordion-trigger"}
                  >
                    <span
                      className={
                        "font-code-md text-code-md text-[#176B5B] tracking-tight select-none pt-0.5 w-16 shrink-0 font-medium"
                      }
                    >
                      08:42:31
                    </span>{" "}
                    <div
                      className={
                        "flex items-center justify-center w-5 h-5 text-[#176B5B] pt-0.5 shrink-0"
                      }
                    >
                      {" "}
                      <span className={"material-symbols-outlined text-[18px]"}>
                        terminal
                      </span>{" "}
                    </div>{" "}
                    <div
                      className={
                        "flex-1 min-w-0 flex items-baseline justify-between gap-3"
                      }
                    >
                      {" "}
                      <div className={"flex items-baseline gap-2 min-w-0"}>
                        {" "}
                        <span
                          className={
                            "font-body-md text-body-md font-medium text-text-primary shrink-0"
                          }
                          data-i18n={"event_sandbox"}
                        >
                          Sandbox execution
                        </span>{" "}
                        <span
                          className={
                            "font-code-md text-code-md text-text-primary truncate font-semibold"
                          }
                        >
                          inspection_analyzer.py
                        </span>{" "}
                        <span
                          className={
                            "text-border-subtle text-label-sm select-none"
                          }
                        >
                          Â·
                        </span>{" "}
                        <span
                          className={
                            "font-body-sm text-body-sm text-text-muted truncate"
                          }
                          data-i18n={"meta_telemetry_ready"}
                        >
                          Telemetry log ready
                        </span>{" "}
                      </div>{" "}
                      <div className={"flex items-center gap-2 shrink-0"}>
                        {" "}
                        <span
                          className={
                            "font-code-md text-code-md text-[#176B5B] font-medium"
                          }
                        >
                          4.82s
                        </span>{" "}
                        <span
                          className={
                            "material-symbols-outlined text-[16px] text-[#176B5B] transition-transform duration-200"
                          }
                          id={"accordion-arrow"}
                        >
                          expand_less
                        </span>{" "}
                      </div>{" "}
                    </div>
                  </div>{" "}
                  <div
                    className={"px-3 pb-3 pt-1 pl-[96px]"}
                    id={"accordion-content"}
                  >
                    <div
                      className={
                        "bg-card-bg border border-border-subtle rounded-md p-4 flex flex-col gap-3 font-code-md text-code-md shadow-sm transition-colors duration-180"
                      }
                      style={{
                        backgroundColor: "rgb(240, 247, 238)",
                        borderLeft: "3px solid rgb(229, 224, 213)",
                        borderTopColor: "rgb(229, 224, 213)",
                        borderRightColor: "rgb(229, 224, 213)",
                        borderBottomColor: "rgb(229, 224, 213)",
                      }}
                    >
                      {" "}
                      <div
                        className={
                          "grid grid-cols-[140px_1fr] gap-x-4 gap-y-1.5 text-body-sm"
                        }
                      >
                        {" "}
                        <span
                          className={
                            "text-text-placeholder uppercase text-label-sm font-label-sm pt-0.5"
                          }
                          data-i18n={"drawer_model"}
                        >
                          Model
                        </span>{" "}
                        <span
                          className={
                            "text-text-primary font-code-md text-code-md"
                          }
                        >
                          Local Reasoning 32B (Qwen2.5-Coder Enclave)
                        </span>{" "}
                        <span
                          className={
                            "text-text-placeholder uppercase text-label-sm font-label-sm pt-0.5"
                          }
                          data-i18n={"drawer_duration"}
                        >
                          Duration
                        </span>{" "}
                        <span
                          className={
                            "text-text-primary font-code-md text-code-md"
                          }
                        >
                          4.82s (compute: 4.61s Â· compile: 210ms)
                        </span>{" "}
                        <span
                          className={
                            "text-text-placeholder uppercase text-label-sm font-label-sm pt-0.5"
                          }
                          data-i18n={"drawer_input_digest"}
                        >
                          Input Digest
                        </span>{" "}
                        <div className={"flex items-center gap-2 truncate"}>
                          {" "}
                          <span
                            className={
                              "text-text-primary font-code-md text-code-md"
                            }
                          >
                            Inspection_Report.pdf
                          </span>{" "}
                          <span
                            className={
                              "text-text-muted font-label-sm text-label-sm"
                            }
                          >
                            (SHA256: 7f8c12a4b89df012)
                          </span>{" "}
                        </div>{" "}
                        <span
                          className={
                            "text-text-placeholder uppercase text-label-sm font-label-sm pt-0.5"
                          }
                          data-i18n={"drawer_isolation"}
                        >
                          Isolation
                        </span>{" "}
                        <span
                          className={
                            "text-text-muted font-code-md text-code-md"
                          }
                        >
                          Level-4 cgroup Â· 0 bytes egress Â· RAM peak 412MB
                        </span>{" "}
                        <span
                          className={
                            "text-text-placeholder uppercase text-label-sm font-label-sm pt-0.5"
                          }
                          data-i18n={"drawer_attestation"}
                        >
                          Attestation
                        </span>{" "}
                        <div
                          className={"flex items-center gap-1.5 text-[#176B5B]"}
                        >
                          {" "}
                          <span
                            className={"material-symbols-outlined text-[16px]"}
                          >
                            verified
                          </span>{" "}
                          <span
                            className={
                              "font-label-sm text-label-sm tracking-wide uppercase font-medium"
                            }
                            data-i18n={"drawer_attestation_val"}
                          >
                            Enclave SHA-256 Signature Validated
                          </span>{" "}
                        </div>{" "}
                      </div>{" "}
                      <div
                        className={
                          "border-t border-border-subtle pt-2 flex items-center justify-between text-label-sm font-label-sm text-text-muted"
                        }
                      >
                        {" "}
                        <span className={""}>
                          PID: 88412 Â· UID: 1000 (SEC_CONTAINED)
                        </span>{" "}
                        <span
                          className={
                            "text-[#176B5B] hover:underline cursor-pointer select-none font-medium flex items-center gap-1"
                          }
                        >
                          <span className={""} data-i18n={"drawer_raw_payload"}>
                            RAW PAYLOAD
                          </span>{" "}
                          â†’
                        </span>{" "}
                      </div>{" "}
                    </div>
                  </div>{" "}
                </article>{" "}
                <article
                  className={
                    "group flex items-start gap-4 py-3 px-3 hover:bg-chip-bg/50 transition-colors"
                  }
                  data-category={"files"}
                >
                  {" "}
                  <span
                    className={
                      "font-code-md text-code-md text-text-muted tracking-tight select-none pt-0.5 w-16 shrink-0"
                    }
                  >
                    08:42:39
                  </span>{" "}
                  <div
                    className={
                      "flex items-center justify-center w-5 h-5 text-text-muted pt-0.5 shrink-0"
                    }
                  >
                    {" "}
                    <span className={"material-symbols-outlined text-[18px]"}>
                      draft
                    </span>{" "}
                  </div>{" "}
                  <div
                    className={
                      "flex-1 min-w-0 flex items-baseline justify-between gap-3"
                    }
                  >
                    {" "}
                    <div className={"flex items-baseline gap-2 min-w-0"}>
                      {" "}
                      <span
                        className={
                          "font-body-md text-body-md font-medium text-text-primary shrink-0"
                        }
                        data-i18n={"event_artifact"}
                      >
                        Artifact generated
                      </span>{" "}
                      <span
                        className={
                          "font-code-md text-code-md text-text-muted truncate"
                        }
                      >
                        Approval_Note.docx
                      </span>{" "}
                      <span
                        className={
                          "text-border-subtle text-label-sm select-none"
                        }
                      >
                        Â·
                      </span>{" "}
                      <span
                        className={
                          "font-body-sm text-body-sm text-text-muted truncate"
                        }
                        data-i18n={"meta_stored_vault"}
                      >
                        Stored in local encrypted vault
                      </span>{" "}
                    </div>{" "}
                    <div className={"flex items-center gap-2 shrink-0"}>
                      {" "}
                      <span
                        className={"font-code-md text-code-md text-text-muted"}
                        data-i18n={"status_saved"}
                      >
                        saved
                      </span>{" "}
                    </div>{" "}
                  </div>{" "}
                </article>{" "}
                <article
                  className={
                    "group flex items-start gap-4 py-3 px-3 hover:bg-chip-bg/50 transition-colors"
                  }
                  data-category={"network"}
                >
                  <span
                    className={
                      "font-code-md text-code-md text-text-muted tracking-tight select-none pt-0.5 w-16 shrink-0"
                    }
                  >
                    08:42:42
                  </span>{" "}
                  <div
                    className={
                      "flex items-center justify-center w-5 h-5 text-[#176B5B] pt-0.5 shrink-0"
                    }
                  >
                    {" "}
                    <span className={"material-symbols-outlined text-[18px]"}>
                      lock
                    </span>{" "}
                  </div>{" "}
                  <div
                    className={
                      "flex-1 min-w-0 flex items-baseline justify-between gap-3"
                    }
                  >
                    {" "}
                    <div className={"flex items-baseline gap-2 min-w-0"}>
                      {" "}
                      <span
                        className={
                          "font-body-md text-body-md font-medium text-text-primary shrink-0"
                        }
                        data-i18n={"event_network"}
                      >
                        Network verification
                      </span>{" "}
                      <span
                        className={
                          "font-code-md text-code-md text-[#176B5B] font-medium truncate"
                        }
                        data-i18n={"badge_requests"}
                      >
                        0 external requests
                      </span>{" "}
                      <span
                        className={
                          "text-border-subtle text-label-sm select-none"
                        }
                      >
                        Â·
                      </span>{" "}
                      <span
                        className={
                          "font-body-sm text-body-sm text-text-muted truncate"
                        }
                        data-i18n={"meta_killswitch"}
                      >
                        Zero-egress hardware killswitch active
                      </span>{" "}
                    </div>{" "}
                    <div className={"flex items-center gap-2 shrink-0"}>
                      {" "}
                      <span
                        className={
                          "font-label-sm text-label-sm text-[#176B5B] font-medium px-1.5 py-0.5 rounded border border-border-subtle bg-accent-tint"
                        }
                        data-i18n={"status_passed"}
                        style={{
                          backgroundColor: "#E8F4F0",
                          borderColor: "#D3E7E1",
                          color: "#176B5B",
                        }}
                      >
                        PASSED
                      </span>{" "}
                    </div>{" "}
                  </div>
                </article>{" "}
              </section>{" "}
              <footer
                className={
                  "mt-space-lg flex items-center justify-between text-text-muted font-label-sm text-label-sm border-t border-border-subtle bg-card-bg py-3 px-3 rounded-sm shadow-sm transition-colors duration-180"
                }
              >
                {" "}
                <div className={"flex items-center gap-2"}>
                  <span
                    className={"w-1.5 h-1.5 rounded-full bg-[#176B5B]"}
                  ></span>{" "}
                  <span
                    className={"text-text-primary font-medium"}
                    data-i18n={"footer_integrity"}
                  >
                    INTEGRITY STATUS: SECURE &amp; UNCOMPROMISED
                  </span>
                </div>{" "}
                <div className={"flex items-center gap-4"}>
                  {" "}
                  <span
                    className={"text-text-primary"}
                    data-i18n={"footer_recorded_ingests"}
                  >
                    7 RECORDED INGESTS
                  </span>{" "}
                  <span className={"text-border-subtle"}>Â·</span>{" "}
                  <span className={""} data-i18n={"footer_no_packets"}>
                    NO PACKETS TRANSMITTED OUTBOUND
                  </span>{" "}
                </div>{" "}
              </footer>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </main>
      <footer
        className={
          "fixed bottom-0 left-16 right-0 z-40 h-7 bg-card-bg border-t border-border-subtle px-4 flex items-center justify-between font-label-sm text-label-sm uppercase tracking-wider text-text-placeholder transition-colors duration-180"
        }
      >
        <div className={"flex items-center gap-space-lg"}>
          <span className={""}>VAULT KERNEL v4.19-AIRGAP</span>
          <span className={"text-border-subtle"}>|</span>
          <span className={""}>MEM: 128GB LOCK</span>
        </div>
        <div className={"flex items-center gap-space-lg"}>
          <span className={""}>SEC: LEVEL-5</span>
          <span className={"text-border-subtle"}>|</span>
          <span
            className={"text-[#176B5B] font-semibold"}
            data-i18n={"footer_zero_egress"}
          >
            ZERO-EGRESS VERIFIED
          </span>
        </div>
      </footer>{" "}
    </div>
  );
}
