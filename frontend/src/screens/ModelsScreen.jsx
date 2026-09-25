import { useEffect, useRef } from "react";

export default function ModelsScreen({ onNavigate }) {
  const rootRef = useRef(null);
  const navRef = useRef(onNavigate);
  navRef.current = onNavigate;

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
        autoroute_desc:
          "Vault automatically selects the appropriate local model for each query and pipeline task.",
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
        action_unload: "UNLOAD",
      },
      hi: {
        nav_chat: "à¤šà¥ˆà¤Ÿ",
        nav_knowledge: "à¤œà¥à¤žà¤¾à¤¨à¤•à¥‹à¤·",
        nav_code: "à¤•à¥‹à¤¡",
        nav_models: "à¤®à¥‰à¤¡à¤²",
        nav_logs: "à¤²à¥‰à¤—à¥à¤¸",
        badge_offline: "à¤‘à¤«à¤¼à¤²à¤¾à¤‡à¤¨",
        settings_title: "à¤ªà¥à¤°à¤¾à¤¥à¤®à¤¿à¤•à¤¤à¤¾à¤à¤‚",
        settings_theme: "à¤¥à¥€à¤®",
        settings_lang: "à¤­à¤¾à¤·à¤¾",
        page_title: "à¤®à¥‰à¤¡à¤²",
        page_desc: "Vault à¤•à¥‡ à¤²à¤¿à¤ à¤‰à¤ªà¤²à¤¬à¥à¤§ à¤¸à¥à¤¥à¤¾à¤¨à¥€à¤¯ à¤¬à¥à¤¦à¥à¤§à¤¿à¤®à¤¤à¥à¤¤à¤¾à¥¤",
        btn_add_model: "+ à¤®à¥‰à¤¡à¤² à¤œà¥‹à¤¡à¤¼à¥‡à¤‚",
        autoroute_label: "à¤¸à¥à¤µà¤¤à¤ƒ à¤°à¥‚à¤Ÿà¤¿à¤‚à¤—",
        autoroute_desc:
          "Vault à¤ªà¥à¤°à¤¤à¥à¤¯à¥‡à¤• à¤•à¥à¤µà¥‡à¤°à¥€ à¤”à¤° à¤ªà¤¾à¤‡à¤ªà¤²à¤¾à¤‡à¤¨ à¤•à¤¾à¤°à¥à¤¯ à¤•à¥‡ à¤²à¤¿à¤ à¤¸à¥à¤µà¤šà¤¾à¤²à¤¿à¤¤ à¤°à¥‚à¤ª à¤¸à¥‡ à¤‰à¤ªà¤¯à¥à¤•à¥à¤¤ à¤¸à¥à¤¥à¤¾à¤¨à¥€à¤¯ à¤®à¥‰à¤¡à¤² à¤•à¤¾ à¤šà¤¯à¤¨ à¤•à¤°à¤¤à¤¾ à¤¹à¥ˆà¥¤",
        state_active: "à¤¸à¤•à¥à¤°à¤¿à¤¯",
        col_model: "à¤®à¥‰à¤¡à¤²",
        col_capability: "à¤•à¥à¤·à¤®à¤¤à¤¾",
        col_weights: "à¤†à¤•à¤¾à¤°/à¤µà¤œà¤¨",
        col_state: "à¤¸à¥à¤¥à¤¿à¤¤à¤¿",
        state_ready: "à¤¤à¥ˆà¤¯à¤¾à¤°",
        state_standby: "à¤¸à¥à¤Ÿà¥ˆà¤‚à¤¡à¤¬à¤¾à¤¯",
        drawer_pane_title: "à¤¨à¤¿à¤°à¥€à¤•à¥à¤·à¤£ à¤«à¤²à¤•",
        drawer_assigned_capabilities: "à¤…à¤¸à¤¾à¤‡à¤¨ à¤•à¥€ à¤—à¤ˆ à¤•à¥à¤·à¤®à¤¤à¤¾à¤à¤‚",
        drawer_specifications: "à¤µà¤¿à¤¨à¤¿à¤°à¥à¤¦à¥‡à¤¶",
        spec_context_window: "à¤¸à¤‚à¤¦à¤°à¥à¤­ à¤µà¤¿à¤‚à¤¡à¥‹",
        drawer_runtime_status: "à¤°à¤¨à¤Ÿà¤¾à¤‡à¤® à¤¸à¥à¤¥à¤¿à¤¤à¤¿",
        runtime_state: "à¤¸à¥à¤¥à¤¿à¤¤à¤¿",
        runtime_ready_warm: "à¤¤à¥ˆà¤¯à¤¾à¤° / à¤¸à¤•à¥à¤°à¤¿à¤¯",
        cap_1: "à¤•à¥‹à¤¡ à¤¨à¤¿à¤°à¥à¤®à¤¾à¤£ à¤”à¤° à¤ªà¥à¤¨à¤°à¥à¤—à¤ à¤¨",
        cap_2: "à¤¸à¥à¤¥à¤¿à¤° à¤¸à¤‚à¤°à¤šà¤¨à¤¾à¤¤à¥à¤®à¤• à¤µà¤¿à¤¶à¥à¤²à¥‡à¤·à¤£",
        cap_3: "à¤¸à¥à¤µà¤¾à¤¯à¤¤à¥à¤¤ à¤¤à¥à¤°à¥à¤Ÿà¤¿ à¤¸à¥à¤¥à¤¾à¤¨ à¤¨à¤¿à¤°à¥à¤§à¤¾à¤°à¤£",
        cap_4: "à¤¨à¤¿à¤¯à¤¤à¤¾à¤¤à¥à¤®à¤• à¤ªà¤°à¥€à¤•à¥à¤·à¤£ à¤¸à¤‚à¤¶à¥à¤²à¥‡à¤·à¤£",
        action_set_default: "à¤¡à¤¿à¤«à¤¼à¥‰à¤²à¥à¤Ÿ à¤•à¥‹à¤¡à¤° à¤•à¥‡ à¤°à¥‚à¤ª à¤®à¥‡à¤‚ à¤¸à¥‡à¤Ÿ à¤•à¤°à¥‡à¤‚",
        action_verify_sha: "SHA à¤¸à¤¤à¥à¤¯à¤¾à¤ªà¤¿à¤¤ à¤•à¤°à¥‡à¤‚",
        action_unload: "à¤…à¤¨à¤²à¥‹à¤¡ à¤•à¤°à¥‡à¤‚",
      },
      kn: {
        nav_chat: "à²šà²¾à²Ÿà³",
        nav_knowledge: "à²œà³à²žà²¾à²¨à²•à³‹à²¶",
        nav_code: "à²•à³‹à²¡à³",
        nav_models: "à²®à²¾à²¦à²°à²¿à²—à²³à³",
        nav_logs: "à²²à²¾à²—à³â€Œà²—à²³à³",
        badge_offline: "à²†à²«à³â€Œà²²à³ˆà²¨à³",
        settings_title: "à²†à²¦à³à²¯à²¤à³†à²—à²³à³",
        settings_theme: "à²¥à³€à²®à³",
        settings_lang: "à²­à²¾à²·à³†",
        page_title: "à²®à²¾à²¦à²°à²¿à²—à²³à³",
        page_desc: "Vault à²—à³† à²²à²­à³à²¯à²µà²¿à²°à³à²µ à²¸à³à²¥à²³à³€à²¯ à²¬à³à²¦à³à²§à²¿à²µà²‚à²¤à²¿à²•à³†.",
        btn_add_model: "+ à²®à²¾à²¦à²°à²¿ à²¸à³‡à²°à²¿à²¸à²¿",
        autoroute_label: "à²¸à³à²µà²¯à²‚ à²°à³‚à²Ÿà²¿à²‚à²—à³",
        autoroute_desc:
          "à²ªà³à²°à²¤à²¿à²¯à³Šà²‚à²¦à³ à²ªà³à²°à²¶à³à²¨à³† à²®à²¤à³à²¤à³ à²ªà³ˆà²ªà³â€Œà²²à³ˆà²¨à³ à²•à²¾à²°à³à²¯à²•à³à²•à²¾à²—à²¿ Vault à²¸à³à²µà²¯à²‚à²šà²¾à²²à²¿à²¤à²µà²¾à²—à²¿ à²¸à³‚à²•à³à²¤à²µà²¾à²¦ à²¸à³à²¥à²³à³€à²¯ à²®à²¾à²¦à²°à²¿à²¯à²¨à³à²¨à³ à²†à²¯à³à²•à³† à²®à²¾à²¡à³à²¤à³à²¤à²¦à³†.",
        state_active: "à²¸à²•à³à²°à²¿à²¯",
        col_model: "à²®à²¾à²¦à²°à²¿",
        col_capability: "à²¸à²¾à²®à²°à³à²¥à³à²¯",
        col_weights: "à²—à²¾à²¤à³à²°/à²¤à³‚à²•",
        col_state: "à²¸à³à²¥à²¿à²¤à²¿",
        state_ready: "à²¸à²¿à²¦à³à²§à²µà²¾à²—à²¿à²¦à³†",
        state_standby: "à²¸à³à²Ÿà³à²¯à²¾à²‚à²¡à³â€Œà²¬à³ˆ",
        drawer_pane_title: "à²ªà²°à²¿à²¶à³€à²²à²¨à²¾ à²«à²²à²•",
        drawer_assigned_capabilities: "à²¨à²¿à²¯à³‹à²œà²¿à²¸à²²à²¾à²¦ à²¸à²¾à²®à²°à³à²¥à³à²¯à²—à²³à³",
        drawer_specifications: "à²µà²¿à²µà²°à²£à³†à²—à²³à³",
        spec_context_window: "à²¸à²‚à²¦à²°à³à²­ à²µà²¿à²‚à²¡à³‹",
        drawer_runtime_status: "à²°à²¨à³â€Œà²Ÿà³ˆà²®à³ à²¸à³à²¥à²¿à²¤à²¿",
        runtime_state: "à²¸à³à²¥à²¿à²¤à²¿",
        runtime_ready_warm: "à²¸à²¿à²¦à³à²§à²µà²¾à²—à²¿à²¦à³† / à²¸à²•à³à²°à²¿à²¯",
        cap_1: "à²•à³‹à²¡à³ à²œà²¨à²°à³‡à²·à²¨à³ à²®à²¤à³à²¤à³ à²°à²¿à²«à³à²¯à²¾à²•à³à²Ÿà²°à²¿à²‚à²—à³",
        cap_2: "à²¸à³à²¥à²¿à²° à²°à²šà²¨à²¾à²¤à³à²®à²• à²µà²¿à²¶à³à²²à³‡à²·à²£à³†",
        cap_3: "à²¸à³à²µà²¾à²¯à²¤à³à²¤ à²¦à³‹à²· à²ªà²¤à³à²¤à³†",
        cap_4: "à²¨à²¿à²°à³à²£à²¾à²¯à²• à²ªà²°à³€à²•à³à²·à²¾ à²¸à²‚à²¶à³à²²à³‡à²·à²£à³†",
        action_set_default: "à²¡à³€à²«à²¾à²²à³à²Ÿà³ à²•à³‹à²¡à²°à³ à²†à²—à²¿ à²¹à³Šà²‚à²¦à²¿à²¸à²¿",
        action_verify_sha: "SHA à²ªà²°à²¿à²¶à³€à²²à²¿à²¸à²¿",
        action_unload: "à²…à²¨à³â€Œà²²à³‹à²¡à³ à²®à²¾à²¡à²¿",
      },
    };

    // State Management
    let currentTheme = localStorage.getItem("vault_theme") || "system";
    let currentLang = localStorage.getItem("vault_lang") || "en";

    const htmlEl = document.documentElement;
    const settingsBtn = document.getElementById("settings-trigger");
    const settingsPopover = document.getElementById("settings-popover");
    const themeButtons = document.querySelectorAll(".theme-btn");
    const langButtons = document.querySelectorAll(".lang-btn");

    function applyTheme(theme) {
      currentTheme = theme;
      localStorage.setItem("vault_theme", theme);

      const isSystemDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      if (theme === "dark" || (theme === "system" && isSystemDark)) {
        htmlEl.classList.add("dark");
      } else {
        htmlEl.classList.remove("dark");
      }

      themeButtons.forEach((btn) => {
        const active = btn.getAttribute("data-theme-val") === theme;
        btn.className = `theme-btn py-1 text-center font-label-sm text-label-sm rounded-DEFAULT transition-all ${
          active
            ? "bg-surface text-primary shadow-xs font-semibold border border-border-subtle"
            : "text-text-muted hover:text-text-main"
        }`;
      });
    }

    function applyLanguage(lang) {
      currentLang = lang;
      localStorage.setItem("vault_lang", lang);
      htmlEl.setAttribute("lang", lang);

      const dict = translations[lang] || translations.en;
      document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        if (dict[key]) {
          el.textContent = dict[key];
        }
      });

      langButtons.forEach((btn) => {
        const active = btn.getAttribute("data-lang-val") === lang;
        btn.className = `lang-btn py-1 text-center font-label-sm text-label-sm rounded-DEFAULT transition-all ${
          active
            ? "bg-surface text-primary shadow-xs font-semibold border border-border-subtle"
            : "text-text-muted hover:text-text-main"
        }`;
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

    // Settings popover toggling
    if (settingsBtn && settingsPopover) {
      settingsBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        settingsPopover.classList.toggle("hidden");
      });

      document.addEventListener("click", (e) => {
        if (!settingsPopover.contains(e.target) && e.target !== settingsBtn) {
          settingsPopover.classList.add("hidden");
        }
      });
    }

    // Attach control listeners
    themeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        applyTheme(btn.getAttribute("data-theme-val"));
      });
    });

    langButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        applyLanguage(btn.getAttribute("data-lang-val"));
      });
    });

    // Initialize
    applyTheme(currentTheme);
    applyLanguage(currentLang);

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
    <div ref={rootRef} className={"min-h-screen bg-background text-text-main"}>
      {" "}
      <main
        className={
          "min-h-[calc(100vh-2.5rem)] px-margin-desktop py-gutter-desktop "
        }
      >
        {" "}
        <div className={"flex flex-col w-full"}>
          {" "}
          <div
            className={
              "flex flex-col lg:flex-row min-h-[calc(100vh-6.5rem)] gap-space-lg"
            }
          >
            {" "}
            <div className={"flex-1 flex flex-col min-w-0 pr-0 lg:pr-space-md"}>
              {" "}
              <div className={"flex items-end justify-between pb-space-lg"}>
                {" "}
                <div>
                  {" "}
                  <h1
                    className={
                      "font-headline-xl text-headline-xl text-text-main tracking-tight font-normal"
                    }
                    data-i18n={"page_title"}
                  >
                    Models
                  </h1>{" "}
                  <p
                    className={"font-body-md text-body-md text-text-muted mt-1"}
                    data-i18n={"page_desc"}
                  >
                    Local intelligence available to Vault.
                  </p>{" "}
                </div>{" "}
                <div className={"flex items-center gap-space-sm"}>
                  {" "}
                  <button
                    className={
                      "inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-DEFAULT text-white font-label-md text-label-md tracking-wider transition-colors duration-150 shadow-sm"
                    }
                    style={{ backgroundColor: "rgb(23, 107, 91)" }}
                  >
                    {" "}
                    <span
                      className={
                        "material-symbols-outlined text-[15px] text-white"
                      }
                    >
                      add
                    </span>{" "}
                    <span className={""} data-i18n={"btn_add_model"}>
                      + ADD MODEL
                    </span>{" "}
                  </button>{" "}
                </div>{" "}
              </div>{" "}
              <div
                className={
                  "flex items-center justify-between py-2.5 px-space-md bg-surface rounded-md border border-border-subtle mb-space-md shadow-sm"
                }
              >
                <div className={"flex items-center gap-space-sm min-w-0"}>
                  {" "}
                  <span
                    className={
                      "font-label-sm text-label-sm tracking-widest uppercase shrink-0 font-medium"
                    }
                    data-i18n={"autoroute_label"}
                    style={{ color: "#176B5B" }}
                  >
                    AUTO ROUTING
                  </span>{" "}
                  <span className={"text-border-subtle text-label-sm"}>/</span>{" "}
                  <span
                    className={
                      "font-body-sm text-body-sm text-text-muted truncate"
                    }
                    data-i18n={"autoroute_desc"}
                  >
                    Vault automatically selects the appropriate local model for
                    each query and pipeline task.
                  </span>{" "}
                </div>{" "}
                <div className={"flex items-center gap-2 shrink-0 pl-space-md"}>
                  {" "}
                  <span
                    className={"font-label-sm text-label-sm font-code-md"}
                    data-i18n={"state_active"}
                    style={{ color: "#176B5B" }}
                  >
                    ACTIVE
                  </span>{" "}
                  <span
                    className={"w-1.5 h-1.5 rounded-full"}
                    style={{ backgroundColor: "#176B5B" }}
                  ></span>{" "}
                </div>
              </div>{" "}
              <div
                className={
                  "flex flex-col bg-surface rounded-DEFAULT border border-border-subtle overflow-hidden shadow-sm"
                }
              >
                {" "}
                <div
                  className={
                    "grid grid-cols-12 px-space-md py-space-sm text-text-subtle font-label-sm text-label-sm tracking-wider border-b border-border-subtle bg-surface-alt"
                  }
                >
                  {" "}
                  <div
                    className={"col-span-5 flex items-center"}
                    data-i18n={"col_model"}
                  >
                    MODEL
                  </div>{" "}
                  <div
                    className={"col-span-3 flex items-center"}
                    data-i18n={"col_capability"}
                  >
                    CAPABILITY
                  </div>{" "}
                  <div
                    className={"col-span-2 flex items-center"}
                    data-i18n={"col_weights"}
                  >
                    WEIGHTS
                  </div>{" "}
                  <div
                    className={"col-span-2 flex items-center justify-end"}
                    data-i18n={"col_state"}
                  >
                    STATE
                  </div>{" "}
                </div>{" "}
                <div
                  className={
                    "grid grid-cols-12 px-space-md py-3.5 items-center bg-primary-tint border-l-[3px] border-l-primary border-b border-border-subtle cursor-pointer transition-colors duration-150 group"
                  }
                  style={{
                    backgroundColor: "rgb(241, 247, 245)",
                    borderLeftColor: "rgb(23, 107, 91)",
                  }}
                >
                  {" "}
                  <div
                    className={
                      "col-span-5 flex flex-col justify-center min-w-0 pr-space-sm"
                    }
                  >
                    {" "}
                    <div className={"flex items-center gap-space-sm"}>
                      {" "}
                      <span
                        className={
                          "font-headline-md text-headline-md text-text-main font-normal tracking-tight truncate"
                        }
                      >
                        Qwen Coder
                      </span>{" "}
                      <span
                        className={
                          "px-1.5 py-0.5 rounded-DEFAULT border border-[#176B5B]/20 text-[#176B5B] bg-[#E4F0EC] font-label-sm text-[0.625rem] tracking-wider shrink-0 font-code-md"
                        }
                        style={{
                          backgroundColor: "rgb(228, 240, 236)",
                          color: "rgb(23, 107, 91)",
                          borderColor: "rgb(192, 222, 214)",
                        }}
                      >
                        ACTIVE IN CODESPACE
                      </span>{" "}
                    </div>{" "}
                    <span
                      className={
                        "font-code-md text-label-sm text-text-muted tracking-tight mt-0.5 truncate"
                      }
                    >
                      Qwen2.5-Coder-32B-Instruct Â· q4_k_m
                    </span>{" "}
                  </div>{" "}
                  <div className={"col-span-3 flex items-center"}>
                    {" "}
                    <span
                      className={"font-body-sm text-body-sm text-text-main"}
                    >
                      Coding &amp; Syntax
                    </span>{" "}
                  </div>{" "}
                  <div className={"col-span-2 flex items-center"}>
                    {" "}
                    <span
                      className={"font-code-md text-body-sm text-text-main"}
                    >
                      32B
                    </span>{" "}
                  </div>{" "}
                  <div
                    className={
                      "col-span-2 flex items-center justify-end gap-space-sm"
                    }
                  >
                    {" "}
                    <span
                      className={"w-1.5 h-1.5 rounded-full bg-primary"}
                      style={{ backgroundColor: "rgb(23, 107, 91)" }}
                    ></span>{" "}
                    <span
                      className={
                        "font-label-sm text-label-sm text-text-main tracking-wider font-medium"
                      }
                      data-i18n={"state_ready"}
                    >
                      READY
                    </span>{" "}
                    <span
                      className={
                        "material-symbols-outlined text-text-muted text-[16px] ml-1"
                      }
                    >
                      chevron_right
                    </span>{" "}
                  </div>{" "}
                </div>{" "}
                <div
                  className={
                    "grid grid-cols-12 px-space-md py-3.5 items-center bg-surface hover:bg-surface-alt border-b border-border-subtle cursor-pointer transition-colors duration-150 group"
                  }
                >
                  {" "}
                  <div
                    className={
                      "col-span-5 flex flex-col justify-center min-w-0 pr-space-sm"
                    }
                  >
                    {" "}
                    <div className={"flex items-center gap-space-sm"}>
                      {" "}
                      <span
                        className={
                          "font-headline-md text-headline-md text-text-main font-normal tracking-tight truncate group-hover:text-black dark:group-hover:text-white"
                        }
                      >
                        Llama
                      </span>{" "}
                    </div>{" "}
                    <span
                      className={
                        "font-code-md text-label-sm text-text-muted tracking-tight mt-0.5 truncate"
                      }
                    >
                      Llama-3.3-70B-Instruct Â· q5_k_m
                    </span>{" "}
                  </div>{" "}
                  <div className={"col-span-3 flex items-center"}>
                    {" "}
                    <span
                      className={"font-body-sm text-body-sm text-text-main"}
                    >
                      Reasoning &amp; Synthesis
                    </span>{" "}
                  </div>{" "}
                  <div className={"col-span-2 flex items-center"}>
                    {" "}
                    <span
                      className={"font-code-md text-body-sm text-text-main"}
                    >
                      70B
                    </span>{" "}
                  </div>{" "}
                  <div
                    className={
                      "col-span-2 flex items-center justify-end gap-space-sm"
                    }
                  >
                    {" "}
                    <span
                      className={"w-1.5 h-1.5 rounded-full bg-primary"}
                      style={{ backgroundColor: "rgb(23, 107, 91)" }}
                    ></span>{" "}
                    <span
                      className={
                        "font-label-sm text-label-sm text-text-main tracking-wider font-medium"
                      }
                      data-i18n={"state_ready"}
                    >
                      READY
                    </span>{" "}
                    <span
                      className={
                        "material-symbols-outlined text-text-muted group-hover:text-text-main text-[16px] ml-1"
                      }
                    >
                      chevron_right
                    </span>{" "}
                  </div>{" "}
                </div>{" "}
                <div
                  className={
                    "grid grid-cols-12 px-space-md py-3.5 items-center bg-surface hover:bg-surface-alt border-b border-border-subtle cursor-pointer transition-colors duration-150 group"
                  }
                >
                  {" "}
                  <div
                    className={
                      "col-span-5 flex flex-col justify-center min-w-0 pr-space-sm"
                    }
                  >
                    {" "}
                    <div className={"flex items-center gap-space-sm"}>
                      {" "}
                      <span
                        className={
                          "font-headline-md text-headline-md text-text-main font-normal tracking-tight truncate group-hover:text-black dark:group-hover:text-white"
                        }
                      >
                        Vision Model
                      </span>{" "}
                    </div>{" "}
                    <span
                      className={
                        "font-code-md text-label-sm text-text-muted tracking-tight mt-0.5 truncate"
                      }
                    >
                      Pixtral-12B Â· Enclave Vision-OCR
                    </span>{" "}
                  </div>{" "}
                  <div className={"col-span-3 flex items-center"}>
                    {" "}
                    <span
                      className={"font-body-sm text-body-sm text-text-main"}
                    >
                      Multimodal &amp; Schematics
                    </span>{" "}
                  </div>{" "}
                  <div className={"col-span-2 flex items-center"}>
                    {" "}
                    <span
                      className={"font-code-md text-body-sm text-text-main"}
                    >
                      12B
                    </span>{" "}
                  </div>{" "}
                  <div
                    className={
                      "col-span-2 flex items-center justify-end gap-space-sm"
                    }
                  >
                    {" "}
                    <span
                      className={"w-1.5 h-1.5 rounded-full bg-primary"}
                      style={{ backgroundColor: "rgb(23, 107, 91)" }}
                    ></span>{" "}
                    <span
                      className={
                        "font-label-sm text-label-sm text-text-main tracking-wider font-medium"
                      }
                      data-i18n={"state_ready"}
                    >
                      READY
                    </span>{" "}
                    <span
                      className={
                        "material-symbols-outlined text-text-muted group-hover:text-text-main text-[16px] ml-1"
                      }
                    >
                      chevron_right
                    </span>{" "}
                  </div>{" "}
                </div>{" "}
                <div
                  className={
                    "grid grid-cols-12 px-space-md py-3.5 items-center bg-surface hover:bg-surface-alt cursor-pointer transition-colors duration-150 group"
                  }
                >
                  {" "}
                  <div
                    className={
                      "col-span-5 flex flex-col justify-center min-w-0 pr-space-sm"
                    }
                  >
                    {" "}
                    <div className={"flex items-center gap-space-sm"}>
                      {" "}
                      <span
                        className={
                          "font-headline-md text-headline-md text-text-main font-normal tracking-tight truncate group-hover:text-black dark:group-hover:text-white"
                        }
                      >
                        DeepSeek R1
                      </span>{" "}
                    </div>{" "}
                    <span
                      className={
                        "font-code-md text-label-sm text-text-muted tracking-tight mt-0.5 truncate"
                      }
                    >
                      DeepSeek-R1-Distill-Qwen-32B Â· f16
                    </span>{" "}
                  </div>{" "}
                  <div className={"col-span-3 flex items-center"}>
                    {" "}
                    <span
                      className={"font-body-sm text-body-sm text-text-main"}
                    >
                      Deterministic Verification
                    </span>{" "}
                  </div>{" "}
                  <div className={"col-span-2 flex items-center"}>
                    {" "}
                    <span
                      className={"font-code-md text-body-sm text-text-main"}
                    >
                      32B
                    </span>{" "}
                  </div>{" "}
                  <div
                    className={
                      "col-span-2 flex items-center justify-end gap-space-sm"
                    }
                  >
                    {" "}
                    <span
                      className={"w-1.5 h-1.5 rounded-full bg-text-subtle"}
                    ></span>{" "}
                    <span
                      className={
                        "font-label-sm text-label-sm text-text-subtle tracking-wider font-medium"
                      }
                      data-i18n={"state_standby"}
                    >
                      STANDBY
                    </span>{" "}
                    <span
                      className={
                        "material-symbols-outlined text-text-muted group-hover:text-text-main text-[16px] ml-1"
                      }
                    >
                      chevron_right
                    </span>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
              <div
                className={
                  "mt-space-lg flex items-center justify-between text-text-subtle font-label-sm text-label-sm px-1"
                }
              >
                {" "}
                <div className={"flex items-center gap-space-sm"}>
                  {" "}
                  <span className={"text-text-subtle"}>
                    MODEL INTEGRITY:
                  </span>{" "}
                  <span className={"text-text-muted font-code-md"}>
                    ATTESTED BY SECURE ENCLAVE 0x9AF0
                  </span>{" "}
                </div>{" "}
                <div className={"flex items-center gap-space-sm"}>
                  {" "}
                  <span className={"text-text-subtle"}>STORE:</span>{" "}
                  <span className={"font-code-md text-text-muted"}>
                    /dev/nvme0n1p3/vault_models
                  </span>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
            <div
              className={
                "w-full lg:w-80 shrink-0 flex flex-col bg-surface rounded-DEFAULT border border-border-subtle shadow-sm overflow-hidden p-space-md"
              }
            >
              <div
                className={
                  "flex items-center justify-between pb-space-sm border-b border-border-subtle mb-space-md"
                }
              >
                <div className={"flex items-center gap-2"}>
                  <span
                    className={
                      "material-symbols-outlined text-[18px] text-[#176B5B]"
                    }
                  >
                    verified
                  </span>
                  <span
                    className={
                      "font-label-sm text-label-sm uppercase tracking-wider text-text-muted font-medium"
                    }
                    data-i18n={"drawer_pane_title"}
                  >
                    INSPECTION PANE
                  </span>
                </div>
                <span
                  className={
                    "px-1.5 py-0.5 rounded-DEFAULT bg-[#EFECE4] text-text-muted font-code-md text-[10px] uppercase border border-border-subtle"
                  }
                >
                  v2.5
                </span>
              </div>
              <div className={"flex flex-col gap-1 mb-space-md"}>
                <div className={"flex items-center justify-between"}>
                  <h2
                    className={
                      "font-headline-md text-headline-md text-text-main font-semibold tracking-tight"
                    }
                  >
                    Qwen Coder
                  </h2>
                  <span
                    className={
                      "px-1.5 py-0.5 rounded-DEFAULT border border-[#176B5B]/20 text-[#176B5B] bg-[#E4F0EC] font-label-sm text-[0.625rem] tracking-wider font-code-md"
                    }
                  >
                    ACTIVE
                  </span>
                </div>
                <span className={"font-code-md text-label-sm text-text-muted"}>
                  Qwen2.5-Coder-32B-Instruct
                </span>
              </div>
              <div
                className={
                  "flex flex-col gap-space-sm mb-space-md pb-space-md border-b border-border-subtle"
                }
              >
                <span
                  className={
                    "font-label-sm text-label-sm text-text-subtle uppercase tracking-wider"
                  }
                  data-i18n={"drawer_runtime_status"}
                >
                  Runtime Status
                </span>
                <div
                  className={
                    "flex items-center justify-between bg-surface-alt p-2 rounded-DEFAULT border border-border-subtle"
                  }
                >
                  <div className={"flex items-center gap-2"}>
                    <span
                      className={"w-2 h-2 rounded-full bg-primary"}
                      style={{ backgroundColor: "#176B5B" }}
                    ></span>
                    <span
                      className={
                        "font-code-md text-label-sm text-text-main font-medium"
                      }
                      data-i18n={"runtime_ready_warm"}
                    >
                      READY / WARM
                    </span>
                  </div>
                  <span className={"font-code-md text-[11px] text-text-muted"}>
                    VRAM 22.4 GB
                  </span>
                </div>
              </div>
              <div
                className={
                  "flex flex-col gap-space-sm mb-space-md pb-space-md border-b border-border-subtle"
                }
              >
                <span
                  className={
                    "font-label-sm text-label-sm text-text-subtle uppercase tracking-wider"
                  }
                  data-i18n={"drawer_specifications"}
                >
                  Specifications
                </span>
                <div
                  className={"flex flex-col gap-1 text-label-sm font-code-md"}
                >
                  <div className={"flex justify-between py-0.5"}>
                    <span className={"text-text-muted"}>Quantization</span>
                    <span className={"text-text-main"}>q4_k_m</span>
                  </div>
                  <div className={"flex justify-between py-0.5"}>
                    <span
                      className={"text-text-muted"}
                      data-i18n={"spec_context_window"}
                    >
                      Context Window
                    </span>
                    <span className={"text-text-main"}>32,768 tokens</span>
                  </div>
                  <div className={"flex justify-between py-0.5"}>
                    <span className={"text-text-muted"}>Parameter Size</span>
                    <span className={"text-text-main"}>32.5B</span>
                  </div>
                  <div className={"flex justify-between py-0.5"}>
                    <span className={"text-text-muted"}>Compute Enclave</span>
                    <span className={"text-text-main"}>NPU-0 Â· Isolated</span>
                  </div>
                </div>
              </div>
              <div className={"flex flex-col gap-2 mb-space-md"}>
                <span
                  className={
                    "font-label-sm text-label-sm text-text-subtle uppercase tracking-wider"
                  }
                  data-i18n={"drawer_assigned_capabilities"}
                >
                  Assigned Capabilities
                </span>
                <div className={"flex flex-wrap gap-1"}>
                  <span
                    className={
                      "px-2 py-1 rounded-DEFAULT bg-[#EFECE4] border border-border-subtle text-text-main font-body-sm text-[11px]"
                    }
                    data-i18n={"cap_1"}
                  >
                    Code generation &amp; refactoring
                  </span>
                  <span
                    className={
                      "px-2 py-1 rounded-DEFAULT bg-[#EFECE4] border border-border-subtle text-text-main font-body-sm text-[11px]"
                    }
                    data-i18n={"cap_2"}
                  >
                    Static structural analysis
                  </span>
                  <span
                    className={
                      "px-2 py-1 rounded-DEFAULT bg-[#EFECE4] border border-border-subtle text-text-main font-body-sm text-[11px]"
                    }
                    data-i18n={"cap_3"}
                  >
                    Autonomous error localization
                  </span>
                </div>
              </div>
              <div className={"mt-auto flex flex-col gap-2 pt-2"}>
                <button
                  className={
                    "w-full py-2 rounded-DEFAULT text-white font-label-md text-label-md tracking-wider transition-colors duration-150 shadow-sm flex items-center justify-center gap-1.5"
                  }
                  data-i18n={"action_set_default"}
                  style={{ backgroundColor: "#176B5B" }}
                >
                  <span className={"material-symbols-outlined text-[15px]"}>
                    check_circle
                  </span>
                  <span className={""}>SET AS DEFAULT CODER</span>
                </button>
                <div className={"flex gap-2"}>
                  <button
                    className={
                      "flex-1 py-1.5 rounded-DEFAULT bg-surface-alt hover:bg-border-subtle border border-border-subtle font-label-sm text-label-sm text-text-main transition-colors"
                    }
                    data-i18n={"action_verify_sha"}
                  >
                    VERIFY SHA
                  </button>
                  <button
                    className={
                      "flex-1 py-1.5 rounded-DEFAULT bg-surface-alt hover:bg-border-subtle border border-border-subtle font-label-sm text-label-sm text-error transition-colors"
                    }
                    data-i18n={"action_unload"}
                  >
                    UNLOAD
                  </button>
                </div>
              </div>
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </main>{" "}
      <footer
        className={
          "border-t border-border-subtle bg-surface px-margin-desktop py-space-xs "
        }
      >
        {" "}
        <div
          className={
            "flex items-center justify-between font-label-sm text-label-sm text-text-subtle"
          }
        >
          <div className={"flex items-center gap-space-sm"}>
            {" "}
            <span className={""} style={{ color: "#176B5B" }}>
              â—
            </span>{" "}
            <span className={""}>HARDWARE ENCLAVE ACTIVE</span>{" "}
            <span className={"text-border-subtle"}>/</span>{" "}
            <span className={""}>ZERO EXTERNAL TELEMETRY</span>{" "}
            <span className={"text-border-subtle"}>/</span>{" "}
            <span className={""}>SOVEREIGN AIR-GAP VERIFIED</span>{" "}
          </div>{" "}
          <div className={"flex items-center gap-space-md text-text-subtle"}>
            {" "}
            <span className={""}>KERNEL: SV-6.4.11-ONPREM</span>{" "}
            <span
              className={"font-code-md text-label-sm font-medium"}
              style={{ color: "#176B5B" }}
            >
              SECURE_STATE: LOCKED
            </span>{" "}
          </div>
        </div>{" "}
      </footer>{" "}
    </div>
  );
}
