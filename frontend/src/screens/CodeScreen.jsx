import { useEffect, useRef } from "react";

export default function CodeScreen({ onNavigate, hidden }) {
  const rootRef = useRef(null);
  const navRef = useRef(onNavigate);
  navRef.current = onNavigate;

  useEffect(() => {
    const root = rootRef.current;

    // Translations dictionary strictly adhering to localization specifications
    const translations = {
      en: {
        nav_chat: "Chat",
        nav_knowledge: "Knowledge",
        nav_code: "Code",
        nav_models: "Models",
        nav_logs: "Logs",
        offline_badge: "OFFLINE",
        settings_title: "PREFERENCES",
        theme_label: "THEME",
        language_label: "LANGUAGE",
        explorer_header: "EXPLORER",
        ctrl_new_file: "New Isolated File",
        ctrl_new_folder: "New Folder",
        ctrl_refresh: "Refresh Tree",
        sandboxed_badge: "SANDBOXED",
        agent_header: "AI AGENT",
        agent_tag: "LOCAL Â· CODER",
        task_title: "CURRENT TASK",
        task_sync: "AUTO-SYNC",
        task_content:
          "Generate an automated script to parse industrial sensor inspection records and flag variance spikes over 3Ïƒ threshold.",
        plan_title: "EXECUTION PLAN",
        plan_step_1: "Read inspection dataset",
        plan_step_2: "Generate statistical routine",
        plan_step_3: "Execute inside cgroup sandbox",
        plan_step_4: "Verify zero-egress invariants",
        stream_title: "STREAM TELEMETRY",
        btn_apply: "Apply Changes",
        btn_run: "Run Sandbox",
        btn_interrupt: "Interrupt",
        term_tab_terminal: "TERMINAL",
        term_tab_problems: "PROBLEMS",
        term_tab_output: "OUTPUT",
        term_tab_enclave: "ENCLAVE SANDBOX",
        term_status_problems: "Problems: 0",
        term_status_warnings: "Warnings: 1 (pandas FutureType)",
        term_status_exec: "Execution: 1.82s",
      },
    };

    // State Management
    const STORAGE_THEME_KEY = "vault_ide_theme";
    const STORAGE_LANG_KEY = "vault_ide_lang";

    let currentTheme = localStorage.getItem(STORAGE_THEME_KEY) || "light";
    let currentLang = localStorage.getItem(STORAGE_LANG_KEY) || "en";

    // Elements
    const settingsBtn = root.querySelector("#settings-trigger");
    const settingsPopover = root.querySelector("#settings-popover");
    const themeBtns = document.querySelectorAll("[data-theme]");
    const langBtns = document.querySelectorAll("[data-lang]");

    // Toggle Settings Popover
    if (settingsBtn && settingsPopover) {
      settingsBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        settingsPopover.classList.toggle("hidden");
      });

      document.addEventListener("click", (e) => {
        if (
          !settingsPopover.contains(e.target) &&
          !settingsBtn.contains(e.target)
        ) {
          settingsPopover.classList.add("hidden");
        }
      });
    }

    // Apply Theme
    function applyTheme(theme) {
      currentTheme = theme;
      localStorage.setItem(STORAGE_THEME_KEY, theme);

      const root = document.documentElement;
      if (theme === "system") {
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)",
        ).matches;
        root.classList.toggle("dark", prefersDark);
        root.classList.toggle("light", !prefersDark);
      } else if (theme === "dark") {
        root.classList.add("dark");
        root.classList.remove("light");
      } else {
        root.classList.remove("dark");
        root.classList.add("light");
      }

      // Update buttons
      themeBtns.forEach((btn) => {
        if (btn.getAttribute("data-theme") === theme) {
          btn.classList.add(
            "bg-surface",
            "shadow-sm",
            "text-primary",
            "font-semibold",
          );
          btn.classList.remove("text-on-surface");
        } else {
          btn.classList.remove(
            "bg-surface",
            "shadow-sm",
            "text-primary",
            "font-semibold",
          );
          btn.classList.add("text-on-surface");
        }
      });
    }

    // Apply Language
    function applyLanguage(lang) {
      if (!translations[lang]) lang = "en";
      currentLang = lang;
      localStorage.setItem(STORAGE_LANG_KEY, lang);
      document.documentElement.lang = lang;

      // Translate DOM elements
      document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        if (translations[lang][key]) {
          el.textContent = translations[lang][key];
        }
      });

      // Translate Tooltips
      const ctrlNewFile = root.querySelector("#ctrl-new-file");
      const ctrlNewFolder = root.querySelector("#ctrl-new-folder");
      const ctrlRefresh = root.querySelector("#ctrl-refresh");
      if (ctrlNewFile) ctrlNewFile.title = translations[lang].ctrl_new_file;
      if (ctrlNewFolder)
        ctrlNewFolder.title = translations[lang].ctrl_new_folder;
      if (ctrlRefresh) ctrlRefresh.title = translations[lang].ctrl_refresh;

      // Update buttons
      langBtns.forEach((btn) => {
        if (btn.getAttribute("data-lang") === lang) {
          btn.classList.add(
            "bg-surface",
            "shadow-sm",
            "text-primary",
            "font-semibold",
          );
          btn.classList.remove("text-on-surface");
        } else {
          btn.classList.remove(
            "bg-surface",
            "shadow-sm",
            "text-primary",
            "font-semibold",
          );
          btn.classList.add("text-on-surface");
        }
      });
    }

    // Event Listeners for theme choices
    themeBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        applyTheme(btn.getAttribute("data-theme"));
      });
    });

    // Event Listeners for lang choices
    langBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        applyLanguage(btn.getAttribute("data-lang"));
      });
    });

    // Listen for system theme change
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", () => {
        if (currentTheme === "system") {
          applyTheme("system");
        }
      });

    // Initialize
    applyTheme(currentTheme);
    applyLanguage(currentLang);

    const TARGETS = [
      ["chat", ["chat"]],
      ["kb", ["knowledge"]],
      ["models", ["models"]],
      ["code", ["code"]],
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
      className={
        "bg-background font-body-md text-on-surface antialiased selection:bg-primary-container selection:text-primary transition-colors duration-150 pl-16"
      }
      style={{ display: hidden ? "none" : undefined }}
    >
      <main className={"w-full pb-7 bg-background min-h-screen"}>
        <div
          className={
            "flex flex-col w-full select-none bg-background text-on-surface overflow-hidden"
          }
          style={{ height: "calc(100vh - 1.75rem)" }}
        >
          {" "}
          <div
            className={
              "flex flex-1 w-full min-h-0 divide-x divide-outline-variant overflow-hidden"
            }
          >
            {" "}
            <div
              className={
                "flex flex-col w-[220px] shrink-0 h-full bg-surface border-r border-outline-variant min-w-0"
              }
            >
              <div
                className={
                  "h-8 px-space-sm flex items-center justify-between border-b border-outline-variant text-on-surface-variant shrink-0"
                }
              >
                <span
                  className={
                    "font-label-sm text-label-sm tracking-wider uppercase text-on-surface font-semibold"
                  }
                  data-i18n={"explorer_header"}
                >
                  EXPLORER
                </span>
                <div className={"flex items-center space-x-1"}>
                  <button
                    className={
                      "w-5 h-5 flex items-center justify-center hover:bg-surface-variant text-on-surface-variant hover:text-on-surface rounded transition-colors"
                    }
                    id={"ctrl-new-file"}
                    title={"New Isolated File"}
                  >
                    <span className={"material-symbols-outlined text-[14px]"}>
                      note_add
                    </span>
                  </button>
                  <button
                    className={
                      "w-5 h-5 flex items-center justify-center hover:bg-surface-variant text-on-surface-variant hover:text-on-surface rounded transition-colors"
                    }
                    id={"ctrl-new-folder"}
                    title={"New Folder"}
                  >
                    <span className={"material-symbols-outlined text-[14px]"}>
                      create_new_folder
                    </span>
                  </button>
                  <button
                    className={
                      "w-5 h-5 flex items-center justify-center hover:bg-surface-variant text-on-surface-variant hover:text-on-surface rounded transition-colors"
                    }
                    id={"ctrl-refresh"}
                    title={"Refresh Tree"}
                  >
                    <span className={"material-symbols-outlined text-[14px]"}>
                      refresh
                    </span>
                  </button>
                  <button
                    className={
                      "w-5 h-5 flex items-center justify-center hover:bg-surface-variant text-on-surface-variant hover:text-on-surface rounded transition-colors"
                    }
                    title={"Collapse All"}
                  >
                    <span className={"material-symbols-outlined text-[14px]"}>
                      collapse_all
                    </span>
                  </button>
                </div>
              </div>
              <div
                className={
                  "px-space-sm py-1.5 flex items-center space-x-1.5 text-on-surface border-b border-outline-variant bg-background shrink-0"
                }
              >
                <span
                  className={
                    "material-symbols-outlined text-[15px] text-on-surface-variant"
                  }
                >
                  expand_more
                </span>
                <span
                  className={
                    "font-label-sm text-label-sm font-semibold tracking-wider text-on-surface uppercase font-mono"
                  }
                >
                  VAULT-AGENT
                </span>
                <span
                  className={
                    "text-[10px] text-primary font-mono ml-auto font-medium"
                  }
                  data-i18n={"sandboxed_badge"}
                >
                  SANDBOXED
                </span>
              </div>
              <div
                className={
                  "flex-1 overflow-y-auto py-1 font-mono text-code-md min-h-0 text-on-surface"
                }
              >
                <div
                  className={
                    "flex items-center h-6 px-space-sm space-x-1 text-on-surface-variant hover:bg-surface-variant cursor-pointer"
                  }
                >
                  <span
                    className={
                      "material-symbols-outlined text-[14px] text-on-surface-variant"
                    }
                  >
                    expand_more
                  </span>
                  <span
                    className={
                      "material-symbols-outlined text-[15px] text-primary"
                    }
                  >
                    folder
                  </span>
                  <span
                    className={
                      "text-xs tracking-normal text-on-surface font-mono"
                    }
                  >
                    src
                  </span>
                </div>
                <div
                  className={
                    "flex items-center h-6 pl-6 pr-2 space-x-1.5 bg-primary-container text-on-surface border-l-2 border-primary cursor-pointer"
                  }
                >
                  <span
                    className={
                      "material-symbols-outlined text-[14px] text-primary"
                    }
                  >
                    terminal
                  </span>
                  <span
                    className={
                      "text-xs truncate font-medium text-on-surface font-mono"
                    }
                  >
                    main.py
                  </span>
                  <span
                    className={"ml-auto w-1.5 h-1.5 rounded-full bg-primary"}
                    title={"Unsaved alterations"}
                  ></span>
                </div>
                <div
                  className={
                    "flex items-center h-6 pl-6 pr-2 space-x-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant cursor-pointer transition-colors"
                  }
                >
                  <span
                    className={
                      "material-symbols-outlined text-[14px] text-outline"
                    }
                  >
                    terminal
                  </span>
                  <span className={"text-xs truncate font-mono"}>
                    analyzer.py
                  </span>
                </div>
                <div
                  className={
                    "flex items-center h-6 pl-6 pr-2 space-x-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant cursor-pointer transition-colors"
                  }
                >
                  <span
                    className={
                      "material-symbols-outlined text-[14px] text-outline"
                    }
                  >
                    terminal
                  </span>
                  <span className={"text-xs truncate font-mono"}>
                    parser.py
                  </span>
                </div>
                <div
                  className={
                    "flex items-center h-6 px-space-sm space-x-1 text-on-surface-variant hover:bg-surface-variant cursor-pointer mt-1"
                  }
                >
                  <span
                    className={
                      "material-symbols-outlined text-[14px] text-on-surface-variant"
                    }
                  >
                    expand_more
                  </span>
                  <span
                    className={
                      "material-symbols-outlined text-[15px] text-on-surface-variant"
                    }
                  >
                    folder
                  </span>
                  <span
                    className={
                      "text-xs tracking-normal text-on-surface font-mono"
                    }
                  >
                    data
                  </span>
                </div>
                <div
                  className={
                    "flex items-center h-6 pl-6 pr-2 space-x-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant cursor-pointer transition-colors"
                  }
                >
                  <span
                    className={
                      "material-symbols-outlined text-[14px] text-outline"
                    }
                  >
                    table_chart
                  </span>
                  <span className={"text-xs truncate font-mono"}>
                    inspection_report.csv
                  </span>
                </div>
                <div
                  className={
                    "flex items-center h-6 pl-6 pr-2 space-x-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant cursor-pointer transition-colors"
                  }
                >
                  <span
                    className={
                      "material-symbols-outlined text-[14px] text-outline"
                    }
                  >
                    data_object
                  </span>
                  <span className={"text-xs truncate font-mono"}>
                    results.json
                  </span>
                </div>
                <div
                  className={
                    "flex items-center h-6 px-space-sm space-x-1 text-on-surface-variant hover:bg-surface-variant cursor-pointer mt-1"
                  }
                >
                  <span
                    className={
                      "material-symbols-outlined text-[14px] text-on-surface-variant"
                    }
                  >
                    expand_more
                  </span>
                  <span
                    className={
                      "material-symbols-outlined text-[15px] text-on-surface-variant"
                    }
                  >
                    folder
                  </span>
                  <span
                    className={
                      "text-xs tracking-normal text-on-surface font-mono"
                    }
                  >
                    tests
                  </span>
                </div>
                <div
                  className={
                    "flex items-center h-6 pl-6 pr-2 space-x-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant cursor-pointer transition-colors"
                  }
                >
                  <span
                    className={
                      "material-symbols-outlined text-[14px] text-outline"
                    }
                  >
                    bug_report
                  </span>
                  <span className={"text-xs truncate font-mono"}>
                    test_parser.py
                  </span>
                </div>
                <div
                  className={
                    "flex items-center h-6 pl-4 pr-2 space-x-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant cursor-pointer mt-1 transition-colors"
                  }
                >
                  <span
                    className={
                      "material-symbols-outlined text-[14px] text-outline"
                    }
                  >
                    tune
                  </span>
                  <span className={"text-xs truncate font-mono"}>
                    requirements.txt
                  </span>
                </div>
                <div
                  className={
                    "flex items-center h-6 pl-4 pr-2 space-x-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant cursor-pointer transition-colors"
                  }
                >
                  <span
                    className={
                      "material-symbols-outlined text-[14px] text-outline"
                    }
                  >
                    description
                  </span>
                  <span className={"text-xs truncate font-mono"}>
                    README.md
                  </span>
                </div>
              </div>
              <div
                className={
                  "h-8 px-space-sm bg-surface border-t border-outline-variant flex items-center justify-between text-outline shrink-0 font-label-sm text-label-sm"
                }
              >
                <div className={"flex items-center space-x-1.5 truncate"}>
                  <span
                    className={
                      "material-symbols-outlined text-[13px] text-primary"
                    }
                  >
                    lock_clock
                  </span>
                  <span
                    className={
                      "truncate tracking-wider uppercase text-[10px] text-outline font-mono"
                    }
                  >
                    AIRGAP // SHA: 9f8a2c
                  </span>
                </div>
                <span
                  className={
                    "px-1 py-0.5 rounded bg-surface-variant text-primary text-[9px] uppercase tracking-widest font-mono font-medium"
                  }
                >
                  clean
                </span>
              </div>
            </div>{" "}
            <div
              className={
                "flex-1 flex flex-col h-full min-w-0 bg-[#F1F0EB] dark:bg-[#121312]"
              }
            >
              {" "}
              <div
                className={
                  "h-9 bg-surface border-b border-outline-variant flex items-center justify-between shrink-0 select-none"
                }
              >
                {" "}
                <div
                  className={"flex items-center h-full overflow-x-auto min-w-0"}
                >
                  {" "}
                  <div
                    className={
                      "h-full px-space-md bg-[#181918] dark:bg-[#141514] text-[#f2f1ed] border-t-2 border-primary border-r border-[#2d2e2b] flex items-center space-x-2 shrink-0 cursor-pointer group"
                    }
                    style={{ borderTopColor: "rgb(23, 107, 91)" }}
                  >
                    <span
                      className={
                        "material-symbols-outlined text-[15px] text-primary"
                      }
                    >
                      terminal
                    </span>
                    <span
                      className={
                        "font-code-md text-code-md font-medium text-[#f2f1ed] font-mono"
                      }
                    >
                      main.py
                    </span>
                    <span
                      className={
                        "w-2 h-2 rounded-full bg-primary group-hover:hidden"
                      }
                    ></span>
                    <button
                      className={
                        "hidden group-hover:flex w-4 h-4 items-center justify-center rounded hover:bg-[#2d2e2b] text-[#8a8984] hover:text-[#f2f1ed]"
                      }
                    >
                      <span className={"material-symbols-outlined text-[12px]"}>
                        close
                      </span>
                    </button>
                  </div>{" "}
                  <div
                    className={
                      "h-full px-space-md bg-surface text-on-surface-variant hover:text-on-surface border-r border-outline-variant flex items-center space-x-2 shrink-0 cursor-pointer group transition-colors"
                    }
                  >
                    {" "}
                    <span
                      className={
                        "material-symbols-outlined text-[15px] text-outline"
                      }
                    >
                      terminal
                    </span>{" "}
                    <span className={"font-code-md text-code-md font-mono"}>
                      analyzer.py
                    </span>{" "}
                    <button
                      className={
                        "opacity-0 group-hover:opacity-100 w-4 h-4 flex items-center justify-center rounded hover:bg-surface-variant text-on-surface-variant hover:text-on-surface transition-opacity"
                      }
                    >
                      {" "}
                      <span className={"material-symbols-outlined text-[12px]"}>
                        close
                      </span>{" "}
                    </button>{" "}
                  </div>{" "}
                  <div
                    className={
                      "h-full px-space-md bg-surface text-on-surface-variant hover:text-on-surface border-r border-outline-variant flex items-center space-x-2 shrink-0 cursor-pointer group transition-colors"
                    }
                  >
                    {" "}
                    <span
                      className={
                        "material-symbols-outlined text-[15px] text-outline"
                      }
                    >
                      terminal
                    </span>{" "}
                    <span className={"font-code-md text-code-md font-mono"}>
                      parser.py
                    </span>{" "}
                    <button
                      className={
                        "opacity-0 group-hover:opacity-100 w-4 h-4 flex items-center justify-center rounded hover:bg-surface-variant text-on-surface-variant hover:text-on-surface transition-opacity"
                      }
                    >
                      {" "}
                      <span className={"material-symbols-outlined text-[12px]"}>
                        close
                      </span>{" "}
                    </button>{" "}
                  </div>{" "}
                </div>{" "}
                <div
                  className={
                    "flex items-center space-x-1 px-space-sm text-on-surface-variant shrink-0"
                  }
                >
                  {" "}
                  <button
                    className={
                      "w-6 h-6 flex items-center justify-center hover:bg-surface-variant hover:text-on-surface rounded transition-colors"
                    }
                    title={"Split Editor Right"}
                  >
                    {" "}
                    <span className={"material-symbols-outlined text-[16px]"}>
                      vertical_split
                    </span>{" "}
                  </button>{" "}
                  <button
                    className={
                      "w-6 h-6 flex items-center justify-center hover:bg-surface-variant hover:text-on-surface rounded transition-colors"
                    }
                    title={"Inline Telemetry Diff"}
                  >
                    {" "}
                    <span className={"material-symbols-outlined text-[16px]"}>
                      difference
                    </span>{" "}
                  </button>{" "}
                  <button
                    className={
                      "w-6 h-6 flex items-center justify-center hover:bg-surface-variant hover:text-on-surface rounded transition-colors"
                    }
                    title={"More Editor Actions"}
                  >
                    {" "}
                    <span className={"material-symbols-outlined text-[16px]"}>
                      more_vert
                    </span>{" "}
                  </button>{" "}
                </div>{" "}
              </div>{" "}
              <div
                className={
                  "h-[26px] bg-[#141514] border-b border-[#282927] px-space-md flex items-center space-x-2 text-[11px] font-mono text-[#8e8d87] shrink-0"
                }
              >
                <span className={""}>vault-agent</span>
                <span className={"text-[#525350]"}>â€º</span>
                <span className={""}>src</span>
                <span className={"text-[#525350]"}>â€º</span>
                <span className={"text-[#e3e2df] font-medium"}>main.py</span>
                <span className={"text-[#525350]"}>â€º</span>
                <div className={"flex items-center space-x-1 text-[#89d5c1]"}>
                  <span className={"material-symbols-outlined text-[12px]"}>
                    function
                  </span>
                  <span className={"font-medium"}>analyse_report</span>
                </div>
              </div>{" "}
              <div
                className={
                  "flex-1 overflow-y-auto font-code-md text-code-md min-h-0 bg-[#181918] dark:bg-[#141514] relative flex select-text"
                }
              >
                <div
                  className={
                    "w-12 py-3 bg-[#141514] dark:bg-[#101110] text-right pr-3 select-none text-[#5c5d59] font-mono text-[12px] leading-6 shrink-0 border-r border-[#282927]"
                  }
                >
                  <div className={""}>1</div>
                  <div className={""}>2</div>
                  <div className={""}>3</div>
                  <div className={""}>4</div>
                  <div className={""}>5</div>
                  <div className={""}>6</div>
                  <div className={""}>7</div>
                  <div className={""}>8</div>
                  <div className={""}>9</div>
                  <div className={""}>10</div>
                  <div className={""}>11</div>
                  <div className={""}>12</div>
                  <div className={""}>13</div>
                  <div className={""}>14</div>
                  <div className={"text-[#89d5c1] font-semibold"}>15</div>
                  <div className={""}>16</div>
                  <div className={""}>17</div>
                  <div className={""}>18</div>
                  <div className={""}>19</div>
                  <div className={""}>20</div>
                  <div className={""}>21</div>
                  <div className={""}>22</div>
                  <div className={""}>23</div>
                  <div className={""}>24</div>
                </div>
                <div
                  className={
                    "flex-1 py-3 px-4 overflow-x-auto leading-6 text-[#e3e2df] font-mono text-[13px] whitespace-pre min-w-0"
                  }
                >
                  <div>
                    <span className={"text-[#767873]"}>"""</span>
                  </div>
                  <div>
                    <span className={"text-[#767873]"}>
                      {" "}
                      VAULT Sovereign Air-Gapped Analysis Routine
                    </span>
                  </div>
                  <div>
                    <span className={"text-[#767873]"}>
                      {" "}
                      Task: Automated defect extraction &amp; statistical triage
                    </span>
                  </div>
                  <div>
                    <span className={"text-[#767873]"}>"""</span>
                  </div>
                  <div className={""}>
                    <span className={"text-[#ff9d66] font-medium"}>import</span>{" "}
                    pandas{" "}
                    <span className={"text-[#ff9d66] font-medium"}>as</span> pd
                  </div>
                  <div className={""}>
                    <span className={"text-[#ff9d66] font-medium"}>import</span>{" "}
                    numpy{" "}
                    <span className={"text-[#ff9d66] font-medium"}>as</span> np
                  </div>
                  <div className={""}>
                    <span className={"text-[#ff9d66] font-medium"}>from</span>{" "}
                    pathlib{" "}
                    <span className={"text-[#ff9d66] font-medium"}>import</span>{" "}
                    Path
                  </div>
                  <div></div>
                  <div className={""}>
                    <span className={"text-[#ff9d66] font-medium"}>def</span>{" "}
                    <span className={"text-[#bbe9ff] font-semibold"}>
                      analyse_report
                    </span>
                    (path: <span className={"text-[#67d3fd]"}>str</span>) -&gt;
                    pd.<span className={"text-[#67d3fd]"}>DataFrame</span>:
                  </div>
                  <div>
                    {" "}
                    <span className={"text-[#767873]"}>
                      """Parses industrial telemetry and extracts anomalous
                      variance."""
                    </span>
                  </div>
                  <div className={""}>
                    {" "}
                    target_file = <span className={"text-[#e3e2df]"}>Path</span>
                    (path)
                  </div>
                  <div className={""}>
                    {" "}
                    <span className={"text-[#ff9d66] font-medium"}>
                      if not
                    </span>{" "}
                    target_file.<span className={"text-[#bbe9ff]"}>exists</span>
                    ():
                  </div>
                  <div className={""}>
                    {" "}
                    <span className={"text-[#ff9d66] font-medium"}>
                      raise
                    </span>{" "}
                    <span className={"text-[#ff8577] font-medium"}>
                      FileNotFoundError
                    </span>
                    (
                    <span className={"text-[#9be4a8]"}>
                      f"Local enclave dataset missing: {"{"}path{"}"}"
                    </span>
                    )
                  </div>
                  <div> </div>
                  <div
                    className={
                      "bg-[#262825] -mx-4 px-4 flex items-center relative"
                    }
                  >
                    <span
                      className={
                        "absolute left-0 top-0 bottom-0 w-[2px] bg-primary"
                      }
                      style={{ backgroundColor: "rgb(23, 107, 91)" }}
                    ></span>
                    <span className={""}>
                      {" "}
                      df = pd.<span className={"text-[#bbe9ff]"}>read_csv</span>
                      (target_file)
                    </span>
                    <span
                      className={
                        "inline-block w-2 h-4 bg-primary ml-0.5 animate-pulse"
                      }
                      style={{ backgroundColor: "rgb(23, 107, 91)" }}
                    ></span>
                  </div>
                  <div>
                    {" "}
                    <span className={"text-[#767873]"}>
                      # Compute statistical bounds within isolated memory block
                    </span>
                  </div>
                  <div className={""}>
                    {" "}
                    summary = df.
                    <span className={"text-[#bbe9ff]"}>describe</span>()
                  </div>
                  <div className={""}>
                    {" "}
                    <span className={"text-[#ff9d66] font-medium"}>
                      return
                    </span>{" "}
                    summary
                  </div>
                  <div></div>
                  <div></div>
                  <div className={""}>
                    <span className={"text-[#ff9d66] font-medium"}>if</span>{" "}
                    __name__ =={" "}
                    <span className={"text-[#9be4a8]"}>"__main__"</span>:
                  </div>
                  <div className={""}>
                    {" "}
                    <span className={"text-[#e3e2df]"}>print</span>(
                    <span className={"text-[#9be4a8]"}>
                      "[VAULT-EXEC] Processing confidential telemetry..."
                    </span>
                    )
                  </div>
                  <div className={""}>
                    {" "}
                    report_summary ={" "}
                    <span className={"text-[#bbe9ff]"}>analyse_report</span>(
                    <span className={"text-[#9be4a8]"}>
                      "data/inspection_report.csv"
                    </span>
                    )
                  </div>
                  <div className={""}>
                    {" "}
                    <span className={"text-[#e3e2df]"}>print</span>
                    (report_summary)
                  </div>
                </div>
                <div
                  className={
                    "absolute right-6 top-48 bg-[#1B211E] border border-[#176B5B] rounded px-space-sm py-1.5 shadow-md flex items-center space-x-3 pointer-events-auto"
                  }
                >
                  <div
                    className={
                      "flex items-center space-x-1.5 text-[#fffbff] font-label-sm text-label-sm font-medium"
                    }
                  >
                    <span
                      className={
                        "material-symbols-outlined text-[15px] text-[#89d5c1]"
                      }
                    >
                      auto_awesome
                    </span>
                    <span className={""}>Inline Agent Diff Pending</span>
                  </div>
                  <span className={"text-[#464745]"}>|</span>
                  <span className={"text-[#a7a6a1] font-mono text-[11px]"}>
                    +18 / -2
                  </span>
                  <span
                    className={
                      "px-2 py-0.5 rounded bg-primary text-[#fffbff] font-label-sm text-[10px] uppercase font-semibold tracking-wider font-mono"
                    }
                    style={{ backgroundColor: "rgb(23, 107, 91)" }}
                  >
                    Tab to Accept
                  </span>
                </div>
              </div>{" "}
              <div
                className={
                  "h-56 bg-surface-variant border-t border-outline-variant flex flex-col shrink-0"
                }
              >
                {" "}
                <div
                  className={
                    "h-8 px-space-sm bg-surface-variant border-b border-outline-variant flex items-center justify-between select-none"
                  }
                >
                  {" "}
                  <div className={"flex items-center space-x-4 h-full"}>
                    {" "}
                    <div
                      className={
                        "flex items-center space-x-1.5 h-full border-b-2 border-primary text-on-surface font-label-sm text-label-sm uppercase px-1 font-semibold font-mono"
                      }
                    >
                      {" "}
                      <span
                        className={
                          "w-1.5 h-1.5 rounded-full bg-primary inline-block"
                        }
                      ></span>{" "}
                      <span className={""} data-i18n={"term_tab_terminal"}>
                        TERMINAL
                      </span>{" "}
                    </div>{" "}
                    <div
                      className={
                        "flex items-center space-x-1 text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm uppercase cursor-pointer font-mono"
                      }
                    >
                      {" "}
                      <span className={""} data-i18n={"term_tab_problems"}>
                        PROBLEMS
                      </span>{" "}
                      <span
                        className={
                          "px-1 rounded bg-outline-variant text-on-surface text-[10px] font-medium"
                        }
                      >
                        1
                      </span>{" "}
                    </div>{" "}
                    <div
                      className={
                        "text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm uppercase cursor-pointer font-mono"
                      }
                      data-i18n={"term_tab_output"}
                    >
                      OUTPUT
                    </div>{" "}
                    <div
                      className={
                        "text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm uppercase cursor-pointer font-mono"
                      }
                      data-i18n={"term_tab_enclave"}
                    >
                      ENCLAVE SANDBOX
                    </div>{" "}
                  </div>{" "}
                  <div
                    className={
                      "flex items-center space-x-1 text-on-surface-variant"
                    }
                  >
                    {" "}
                    <button
                      className={
                        "w-5 h-5 flex items-center justify-center hover:bg-outline-variant hover:text-on-surface rounded transition-colors"
                      }
                      title={"Split Terminal Instance"}
                    >
                      {" "}
                      <span className={"material-symbols-outlined text-[14px]"}>
                        add
                      </span>{" "}
                    </button>{" "}
                    <button
                      className={
                        "w-5 h-5 flex items-center justify-center hover:bg-outline-variant hover:text-on-surface rounded transition-colors"
                      }
                      title={"Clear Buffer"}
                    >
                      {" "}
                      <span className={"material-symbols-outlined text-[14px]"}>
                        delete
                      </span>{" "}
                    </button>{" "}
                    <button
                      className={
                        "w-5 h-5 flex items-center justify-center hover:bg-outline-variant hover:text-on-surface rounded transition-colors"
                      }
                      title={"Toggle Terminal Size"}
                    >
                      {" "}
                      <span className={"material-symbols-outlined text-[14px]"}>
                        keyboard_arrow_up
                      </span>{" "}
                    </button>{" "}
                    <button
                      className={
                        "w-5 h-5 flex items-center justify-center hover:bg-outline-variant hover:text-on-surface rounded transition-colors"
                      }
                      title={"Close Panel"}
                    >
                      {" "}
                      <span className={"material-symbols-outlined text-[14px]"}>
                        close
                      </span>{" "}
                    </button>{" "}
                  </div>{" "}
                </div>{" "}
                <div
                  className={
                    "flex-1 p-3 font-mono text-[12px] leading-relaxed text-tertiary overflow-y-auto select-text space-y-0.5"
                  }
                >
                  {" "}
                  <div className={"text-on-surface-variant"}>
                    <span className={"text-primary font-semibold"}>
                      vault@sov-01
                    </span>
                    :<span className={"text-on-surface"}>~/vault-agent</span>$
                    python main.py
                  </div>{" "}
                  <div className={"text-on-surface-variant"}>
                    [AIRGAP-ENV] Virtual environment active: .venv-vault-311
                  </div>{" "}
                  <div className={"text-tertiary"}>
                    [LOADER] Inspection report loaded: 4,120 records verified
                    (SHA256: 7f8c12a4b8)
                  </div>{" "}
                  <div className={"text-tertiary"}>
                    [ANALYTICS] Analysis completed across 8 industrial sensor
                    channels
                  </div>{" "}
                  <div
                    className={"text-tertiary flex items-center space-x-1.5"}
                  >
                    {" "}
                    <span
                      className={
                        "material-symbols-outlined text-[13px] text-primary"
                      }
                    >
                      check_circle
                    </span>{" "}
                    <span className={""}>
                      Sandbox execution completed in isolated cgroup // peak
                      RAM: 412MB
                    </span>{" "}
                  </div>{" "}
                  <div
                    className={"text-tertiary flex items-center space-x-1.5"}
                  >
                    {" "}
                    <span
                      className={
                        "material-symbols-outlined text-[13px] text-primary"
                      }
                    >
                      format_image_left
                    </span>{" "}
                    <span className={""}>
                      Zero external network requests detected (egress packet
                      monitor: 0 bytes)
                    </span>{" "}
                  </div>{" "}
                  <div className={"flex items-center text-tertiary pt-1"}>
                    {" "}
                    <span className={"text-primary font-semibold"}>
                      vault@sov-01
                    </span>
                    :<span className={"text-on-surface"}>~/vault-agent</span>
                    $&nbsp;
                    <span
                      className={"inline-block w-2 h-3.5 bg-primary"}
                    ></span>{" "}
                  </div>{" "}
                </div>{" "}
                <div
                  className={
                    "h-6 px-space-md bg-outline-variant/30 border-t border-outline-variant flex items-center justify-between font-mono text-[10px] text-on-surface-variant"
                  }
                >
                  {" "}
                  <div className={"flex items-center space-x-3"}>
                    {" "}
                    <span
                      className={""}
                      data-i18n={"term_status_problems"}
                      id={"term-status-problems"}
                    >
                      Problems: 0
                    </span>{" "}
                    <span className={"text-outline"}>|</span>{" "}
                    <span
                      className={"text-primary font-medium"}
                      data-i18n={"term_status_warnings"}
                      id={"term-status-warnings"}
                    >
                      Warnings: 1 (pandas FutureType)
                    </span>{" "}
                    <span className={"text-outline"}>|</span>{" "}
                    <span
                      className={""}
                      data-i18n={"term_status_exec"}
                      id={"term-status-exec"}
                    >
                      Execution: 1.82s
                    </span>{" "}
                  </div>{" "}
                  <div
                    className={
                      "flex items-center space-x-2 text-on-surface-variant"
                    }
                  >
                    {" "}
                    <span
                      className={"w-1.5 h-1.5 rounded-full bg-primary"}
                    ></span>{" "}
                    <span
                      className={
                        "uppercase tracking-wider font-medium text-on-surface"
                      }
                    >
                      SANDBOX: LEVEL-4 ISOLATED CGROUP
                    </span>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
            <div
              className={
                "w-[280px] shrink-0 h-full bg-background border-l border-outline-variant flex flex-col min-w-0 justify-between"
              }
            >
              {" "}
              <div
                className={
                  "flex-1 overflow-y-auto p-space-sm space-y-space-md min-h-0"
                }
              >
                {" "}
                <div
                  className={
                    "flex items-center justify-between pb-space-xs border-b border-outline-variant"
                  }
                >
                  {" "}
                  <div className={"flex items-center space-x-2"}>
                    {" "}
                    <span
                      className={
                        "font-label-md text-label-md font-semibold text-on-surface uppercase tracking-wider"
                      }
                      data-i18n={"agent_header"}
                    >
                      AI AGENT
                    </span>{" "}
                    <span
                      className={
                        "px-1.5 py-0.5 rounded bg-primary-container text-primary font-label-sm text-[10px] uppercase font-semibold"
                      }
                      data-i18n={"agent_tag"}
                      style={{
                        backgroundColor: "rgb(241, 247, 245)",
                        color: "rgb(23, 107, 91)",
                      }}
                    >
                      LOCAL Â· CODER
                    </span>{" "}
                  </div>{" "}
                  <button
                    className={
                      "w-5 h-5 flex items-center justify-center text-on-surface-variant hover:text-on-surface rounded transition-colors"
                    }
                    title={"Collapse Panel"}
                  >
                    {" "}
                    <span className={"material-symbols-outlined text-[15px]"}>
                      dock_to_right
                    </span>{" "}
                  </button>{" "}
                </div>{" "}
                <div className={"space-y-1.5"}>
                  {" "}
                  <div className={"flex items-center justify-between"}>
                    {" "}
                    <span
                      className={
                        "font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant"
                      }
                      data-i18n={"task_title"}
                    >
                      CURRENT TASK
                    </span>{" "}
                    <span
                      className={
                        "text-[10px] text-primary font-mono font-medium"
                      }
                      data-i18n={"task_sync"}
                    >
                      AUTO-SYNC
                    </span>{" "}
                  </div>{" "}
                  <div
                    className={
                      "p-space-sm rounded bg-surface border border-outline-variant text-on-surface font-body-sm text-body-sm leading-relaxed shadow-sm"
                    }
                    data-i18n={"task_content"}
                  >
                    Generate an automated script to parse industrial sensor
                    inspection records and flag variance spikes over 3Ïƒ
                    threshold.
                  </div>{" "}
                </div>{" "}
                <div className={"space-y-2"}>
                  {" "}
                  <span
                    className={
                      "font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant"
                    }
                    data-i18n={"plan_title"}
                  >
                    EXECUTION PLAN
                  </span>{" "}
                  <div
                    className={
                      "space-y-1.5 bg-surface p-space-sm rounded border border-outline-variant text-[11px] shadow-sm"
                    }
                  >
                    {" "}
                    <div className={"flex items-center space-x-2 text-primary"}>
                      {" "}
                      <span
                        className={
                          "material-symbols-outlined text-[14px] text-primary"
                        }
                      >
                        check
                      </span>{" "}
                      <span
                        className={"line-through text-on-surface-variant"}
                        data-i18n={"plan_step_1"}
                      >
                        Read inspection dataset
                      </span>{" "}
                    </div>{" "}
                    <div className={"flex items-center space-x-2 text-primary"}>
                      {" "}
                      <span
                        className={
                          "material-symbols-outlined text-[14px] text-primary"
                        }
                      >
                        check
                      </span>{" "}
                      <span
                        className={"line-through text-on-surface-variant"}
                        data-i18n={"plan_step_2"}
                      >
                        Generate statistical routine
                      </span>{" "}
                    </div>{" "}
                    <div
                      className={
                        "flex items-center space-x-2 text-on-surface font-medium"
                      }
                    >
                      {" "}
                      <span
                        className={
                          "w-3.5 h-3.5 rounded-full border border-primary flex items-center justify-center shrink-0"
                        }
                      >
                        {" "}
                        <span
                          className={
                            "w-1.5 h-1.5 rounded-full bg-primary animate-pulse"
                          }
                          style={{ backgroundColor: "rgb(23, 107, 91)" }}
                        ></span>{" "}
                      </span>{" "}
                      <span className={""} data-i18n={"plan_step_3"}>
                        Execute inside cgroup sandbox
                      </span>{" "}
                    </div>{" "}
                    <div
                      className={
                        "flex items-center space-x-2 text-on-surface-variant pl-5"
                      }
                    >
                      {" "}
                      <span
                        className={
                          "w-1.5 h-1.5 rounded-full bg-outline shrink-0"
                        }
                      ></span>{" "}
                      <span className={""} data-i18n={"plan_step_4"}>
                        Verify zero-egress invariants
                      </span>{" "}
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
                <div className={"space-y-1.5"}>
                  {" "}
                  <div className={"flex items-center justify-between"}>
                    {" "}
                    <span
                      className={
                        "font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant"
                      }
                      data-i18n={"stream_title"}
                    >
                      STREAM TELEMETRY
                    </span>{" "}
                    <span
                      className={
                        "flex items-center space-x-1 text-[10px] text-primary font-mono font-semibold"
                      }
                    >
                      {" "}
                      <span
                        className={"w-1.5 h-1.5 rounded-full bg-primary"}
                      ></span>{" "}
                      <span className={""}>92 t/s</span>{" "}
                    </span>{" "}
                  </div>{" "}
                  <div
                    className={
                      "bg-surface-variant p-space-sm rounded border border-outline-variant font-mono text-[11px] space-y-1.5 text-on-surface-variant max-h-40 overflow-y-auto"
                    }
                  >
                    {" "}
                    <div className={""}>
                      {" "}
                      <span className={"text-outline"}>[14:32:01]</span> Reading
                      data/inspection_report.csv (4,120 rows)
                    </div>{" "}
                    <div className={""}>
                      {" "}
                      <span className={"text-outline"}>[14:32:03]</span>{" "}
                      Generating analysis function in src/main.py
                    </div>{" "}
                    <div className={"text-primary font-medium"}>
                      {" "}
                      <span className={"text-outline"}>[14:32:04]</span> Diff
                      proposed: +18 lines, -2 lines
                    </div>{" "}
                    <div className={"text-on-surface-variant text-[10px]"}>
                      {" "}
                      <span className={"text-outline"}>[14:32:05]</span> Enclave
                      SHA256 verified against local weights
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
                <div
                  className={
                    "p-2 rounded bg-surface border border-outline-variant space-y-1 shadow-sm"
                  }
                >
                  {" "}
                  <div
                    className={
                      "flex items-center justify-between text-[10px] font-label-sm text-on-surface-variant uppercase font-mono"
                    }
                  >
                    {" "}
                    <span className={""}>Model Anchor</span>{" "}
                    <span className={"text-primary font-mono font-medium"}>
                      GPU 0 ACTIVE
                    </span>{" "}
                  </div>{" "}
                  <div
                    className={
                      "text-xs font-mono text-on-surface font-medium truncate"
                    }
                  >
                    Qwen2.5-Coder-32B-Instruct
                  </div>{" "}
                  <div
                    className={
                      "flex items-center justify-between text-[10px] text-on-surface-variant font-mono"
                    }
                  >
                    {" "}
                    <span className={""}>VRAM: 22.4 / 24.0 GB</span>{" "}
                    <span className={""}>Quant: FP16</span>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
              <div
                className={
                  "p-space-sm bg-surface border-t border-outline-variant space-y-2 shrink-0"
                }
              >
                {" "}
                <button
                  className={
                    "w-full py-2 px-3 rounded bg-primary hover:bg-surface-variant text-[#FFFFFF] font-label-md text-label-md uppercase font-semibold transition-colors flex items-center justify-center space-x-1.5 shadow-sm active:translate-y-px"
                  }
                  style={{ backgroundColor: "rgb(23, 107, 91)" }}
                >
                  <span className={"material-symbols-outlined text-[15px]"}>
                    done_all
                  </span>
                  <span className={""} data-i18n={"btn_apply"}>
                    Apply Changes
                  </span>
                </button>{" "}
                <div className={"grid grid-cols-2 gap-2"}>
                  {" "}
                  <button
                    className={
                      "py-1.5 px-3 rounded bg-surface hover:bg-surface-variant text-on-surface border border-outline-variant font-label-md text-[11px] uppercase transition-colors flex items-center justify-center space-x-1 font-medium"
                    }
                  >
                    {" "}
                    <span
                      className={
                        "material-symbols-outlined text-[14px] text-primary"
                      }
                    >
                      play_arrow
                    </span>{" "}
                    <span className={""} data-i18n={"btn_run"}>
                      Run Sandbox
                    </span>{" "}
                  </button>{" "}
                  <button
                    className={
                      "py-1.5 px-3 rounded bg-surface hover:bg-surface-variant text-on-surface border border-outline-variant font-label-md text-[11px] uppercase transition-colors flex items-center justify-center space-x-1 font-medium"
                    }
                  >
                    {" "}
                    <span
                      className={
                        "material-symbols-outlined text-[14px] text-outline"
                      }
                    >
                      stop
                    </span>{" "}
                    <span className={""} data-i18n={"btn_interrupt"}>
                      Interrupt
                    </span>{" "}
                  </button>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </div>
      </main>
    </div>
  );
}
