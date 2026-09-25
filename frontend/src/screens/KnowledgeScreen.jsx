import { useEffect, useRef } from "react";

export default function KnowledgeScreen({ onNavigate }) {
  const rootRef = useRef(null);
  const navRef = useRef(onNavigate);
  navRef.current = onNavigate;

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
          "sidebar.enclave_sub":
            "4 sources indexed locally Â· Enclave memory active",
          "workspace.title": "Knowledge",
          "workspace.grounding": "Grounding",
          "workspace.source_count": "4 sources",
          "workspace.strict_btn": "Grounding: Strict",
          "synthesis.query_heading": "What are the shutdown requirements?",
          "synthesis.badge": "VAULT SYNTHESIS",
          "synthesis.deterministic": "Deterministic verification: 99.8%",
          "synthesis.lead":
            "The maintenance procedure mandates a strict multi-staged physical isolation protocol prior to cold-loop inspection. Cross-document grounding references three compulsory gates:",
          "point1.title": "Primary Loop Depressurization",
          "point1.body":
            "Isolation valves IV-102 through IV-108 must be mechanically dogged and padlock-tagged. Differential telemetry must confirm zero bar (gauge) across bypass manifold B-7 before breaking flange seals.",
          "point2.title": "Residual Thermal Dissipation Window",
          "point2.body":
            "Auxiliary cooling pumps must remain locked on forced-circulation bypass until all primary core thermocouple clusters register below 42Â°C for a continuous, uninterrupted 60-minute interval.",
          "point3.title": "Secondary Containment Atmospheric Assurance",
          "point3.body":
            "Atmospheric sensor verification for volatile fluorocarbons must be logged at 15-minute intervals across all four facility quadrants. Manual technician hatch interlocks will refuse authorization until scrubbers complete two volume exchanges.",
          "synthesis.guarantee":
            "Grounded purely against local air-gapped cryptographic volumes. Zero hallucination tolerance.",
          "synthesis.audit": "Audit Log",
          "prompt.sugg1": '"What are the shutdown requirements?"',
          "prompt.sugg2": '"Find previous corrosion findings."',
          "prompt.sugg3": '"Summarize the inspection report."',
          "composer.placeholder": "Ask your private knowledge base...",
          "drawer.header_sub": "Page 18 of 64 Â· Section 4.2 Depressurization",
          "drawer.citation_match": "Exact Citation Match",
          "drawer.target_badge": "Grounding Target Â· Excerpt #1",
          "drawer.snippet_body":
            '"During scheduled or emergency cycle shutdowns, isolation valves IV-102 through IV-108 shall be mechanically dogged and padlock-tagged. Differential telemetry must confirm zero bar (gauge) across bypass manifold B-7 before breaking flange seals..."',
          "drawer.preview": "PAGE PREVIEW (18)",
          "drawer.prev": "â† Prev",
          "drawer.next": "Next â†’",
          "drawer.jump": "Jump:",
          "footer.kernel": "VAULT KERNEL v4.19-AIRGAP",
          "footer.egress": "ZERO-EGRESS VERIFIED",
        },
        hi: {
          "nav.chat": "à¤šà¥ˆà¤Ÿ",
          "nav.knowledge": "à¤œà¥à¤žà¤¾à¤¨",
          "nav.code": "à¤•à¥‹à¤¡",
          "nav.models": "à¤®à¥‰à¤¡à¤²",
          "nav.logs": "à¤²à¥‰à¤—à¥à¤¸",
          "status.offline": "à¤‘à¤«à¤²à¤¾à¤‡à¤¨",
          "settings.title": "à¤•à¤¾à¤°à¥à¤¯à¤•à¥à¤·à¥‡à¤¤à¥à¤° à¤ªà¥à¤°à¤¾à¤¥à¤®à¤¿à¤•à¤¤à¤¾à¤à¤‚",
          "settings.theme": "à¤¥à¥€à¤® (à¤°à¥‚à¤ª)",
          "settings.language": "à¤­à¤¾à¤·à¤¾ (Language)",
          "theme.light": "à¤²à¤¾à¤‡à¤Ÿ",
          "theme.dark": "à¤¡à¤¾à¤°à¥à¤•",
          "theme.system": "à¤¸à¤¿à¤¸à¥à¤Ÿà¤®",
          "sidebar.sources": "à¤¸à¥à¤°à¥‹à¤¤",
          "sidebar.add": "+ à¤œà¥‹à¤¡à¤¼à¥‡à¤‚",
          "sidebar.enclave": "à¤²à¥‹à¤•à¤² à¤à¤¨à¥à¤•à¥à¤²à¥‡à¤µ",
          "sidebar.enclave_sub":
            "4 à¤¸à¥à¤¥à¤¾à¤¨à¥€à¤¯ à¤¸à¥à¤°à¥‹à¤¤ à¤…à¤¨à¥à¤•à¥à¤°à¤®à¤¿à¤¤ Â· à¤à¤¨à¥à¤•à¥à¤²à¥‡à¤µ à¤®à¥‡à¤®à¥‹à¤°à¥€ à¤¸à¤•à¥à¤°à¤¿à¤¯",
          "workspace.title": "à¤œà¥à¤žà¤¾à¤¨",
          "workspace.grounding": "à¤—à¥à¤°à¤¾à¤‰à¤‚à¤¡à¤¿à¤‚à¤—",
          "workspace.source_count": "4 à¤¸à¥à¤°à¥‹à¤¤",
          "workspace.strict_btn": "à¤—à¥à¤°à¤¾à¤‰à¤‚à¤¡à¤¿à¤‚à¤—: à¤¸à¤–à¥à¤¤",
          "synthesis.query_heading": "à¤¶à¤Ÿà¤¡à¤¾à¤‰à¤¨ à¤•à¥€ à¤•à¥à¤¯à¤¾ à¤†à¤µà¤¶à¥à¤¯à¤•à¤¤à¤¾à¤à¤‚ à¤¹à¥ˆà¤‚?",
          "synthesis.badge": "à¤µà¥‰à¤²à¥à¤Ÿ à¤¸à¤‚à¤¶à¥à¤²à¥‡à¤·à¤£",
          "synthesis.deterministic": "à¤¨à¤¿à¤¯à¤¤ à¤¸à¤¤à¥à¤¯à¤¾à¤ªà¤¨: 99.8%",
          "synthesis.lead":
            "à¤°à¤–à¤°à¤–à¤¾à¤µ à¤ªà¥à¤°à¤•à¥à¤°à¤¿à¤¯à¤¾ à¤•à¥‹à¤²à¥à¤¡-à¤²à¥‚à¤ª à¤¨à¤¿à¤°à¥€à¤•à¥à¤·à¤£ à¤¸à¥‡ à¤ªà¤¹à¤²à¥‡ à¤à¤• à¤¸à¤–à¥à¤¤ à¤¬à¤¹à¥-à¤¸à¥à¤¤à¤°à¥€à¤¯ à¤­à¥Œà¤¤à¤¿à¤• à¤…à¤²à¤—à¤¾à¤µ à¤ªà¥à¤°à¥‹à¤Ÿà¥‹à¤•à¥‰à¤² à¤…à¤¨à¤¿à¤µà¤¾à¤°à¥à¤¯ à¤•à¤°à¤¤à¥€ à¤¹à¥ˆà¥¤ à¤•à¥à¤°à¥‰à¤¸-à¤¦à¤¸à¥à¤¤à¤¾à¤µà¥‡à¤œà¤¼ à¤—à¥à¤°à¤¾à¤‰à¤‚à¤¡à¤¿à¤‚à¤— à¤¤à¥€à¤¨ à¤…à¤¨à¤¿à¤µà¤¾à¤°à¥à¤¯ à¤¦à¥à¤µà¤¾à¤°à¥‹à¤‚ à¤•à¥‹ à¤¸à¤‚à¤¦à¤°à¥à¤­à¤¿à¤¤ à¤•à¤°à¤¤à¤¾ à¤¹à¥ˆ:",
          "point1.title": "à¤ªà¥à¤°à¤¾à¤¥à¤®à¤¿à¤• à¤²à¥‚à¤ª à¤¡à¥€à¤ªà¥à¤°à¥‡à¤¸à¤°à¤¾à¤‡à¤œà¥‡à¤¶à¤¨",
          "point1.body":
            "à¤†à¤‡à¤¸à¥‹à¤²à¥‡à¤¶à¤¨ à¤µà¤¾à¤²à¥à¤µ IV-102 à¤¸à¥‡ IV-108 à¤•à¥‹ à¤¯à¤¾à¤‚à¤¤à¥à¤°à¤¿à¤• à¤°à¥‚à¤ª à¤¸à¥‡ à¤²à¥‰à¤• à¤”à¤° à¤ªà¥ˆà¤¡à¤²à¥‰à¤•-à¤Ÿà¥ˆà¤— à¤•à¤¿à¤¯à¤¾ à¤œà¤¾à¤¨à¤¾ à¤šà¤¾à¤¹à¤¿à¤à¥¤ à¤¨à¤¿à¤•à¤²à¤¾ à¤¹à¥à¤† à¤•à¤¿à¤¨à¤¾à¤°à¤¾ à¤¸à¥€à¤² à¤¤à¥‹à¤¡à¤¼à¤¨à¥‡ à¤¸à¥‡ à¤ªà¤¹à¤²à¥‡ à¤¬à¤¾à¤ˆà¤ªà¤¾à¤¸ à¤®à¥ˆà¤¨à¤¿à¤«à¥‹à¤²à¥à¤¡ B-7 à¤ªà¤° à¤µà¤¿à¤­à¥‡à¤¦à¤• à¤Ÿà¥‡à¤²à¥€à¤®à¥‡à¤Ÿà¥à¤°à¥€ à¤¦à¥à¤µà¤¾à¤°à¤¾ à¤¶à¥‚à¤¨à¥à¤¯ à¤¬à¤¾à¤° (à¤—à¥‡à¤œ) à¤¸à¥à¤¨à¤¿à¤¶à¥à¤šà¤¿à¤¤ à¤•à¤¿à¤¯à¤¾ à¤œà¤¾à¤¨à¤¾ à¤…à¤¨à¤¿à¤µà¤¾à¤°à¥à¤¯ à¤¹à¥ˆà¥¤",
          "point2.title": "à¤…à¤µà¤¶à¤¿à¤·à¥à¤Ÿ à¤¥à¤°à¥à¤®à¤² à¤…à¤ªà¤µà¥à¤¯à¤¯ à¤–à¤¿à¤¡à¤¼à¤•à¥€",
          "point2.body":
            "à¤¸à¤¹à¤¾à¤¯à¤• à¤¶à¥€à¤¤à¤²à¤¨ à¤ªà¤‚à¤ª à¤¤à¤¬ à¤¤à¤• à¤®à¤œà¤¬à¥‚à¤° à¤ªà¤°à¤¿à¤¸à¤‚à¤šà¤°à¤£ à¤¬à¤¾à¤ˆà¤ªà¤¾à¤¸ à¤ªà¤° à¤¬à¤‚à¤¦ à¤°à¤¹à¤¨à¥‡ à¤šà¤¾à¤¹à¤¿à¤ à¤œà¤¬ à¤¤à¤• à¤•à¤¿ à¤¸à¤­à¥€ à¤ªà¥à¤°à¤¾à¤¥à¤®à¤¿à¤• à¤•à¥‹à¤° à¤¥à¤°à¥à¤®à¥‹à¤•à¤ªà¤² à¤•à¥à¤²à¤¸à¥à¤Ÿà¤° à¤²à¤—à¤¾à¤¤à¤¾à¤° 60 à¤®à¤¿à¤¨à¤Ÿ à¤•à¥‡ à¤²à¤¿à¤ 42Â°C à¤¸à¥‡ à¤¨à¥€à¤šà¥‡ à¤¦à¤°à¥à¤œ à¤¨ à¤¹à¥‹à¤‚à¥¤",
          "point3.title": "à¤¦à¥à¤µà¤¿à¤¤à¥€à¤¯à¤• à¤¨à¤¿à¤¯à¤‚à¤¤à¥à¤°à¤£ à¤µà¤¾à¤¯à¥à¤®à¤‚à¤¡à¤²à¥€à¤¯ à¤†à¤¶à¥à¤µà¤¾à¤¸à¤¨",
          "point3.body":
            "à¤µà¤¾à¤·à¥à¤ªà¤¶à¥€à¤² à¤«à¥à¤²à¥‹à¤°à¥‹à¤•à¤¾à¤°à¥à¤¬à¤¨ à¤•à¥‡ à¤²à¤¿à¤ à¤µà¤¾à¤¯à¥à¤®à¤‚à¤¡à¤²à¥€à¤¯ à¤¸à¥‡à¤‚à¤¸à¤° à¤¸à¤¤à¥à¤¯à¤¾à¤ªà¤¨ à¤•à¥‹ à¤¸à¤­à¥€ à¤šà¤¾à¤° à¤¸à¥à¤µà¤¿à¤§à¤¾ à¤•à¥à¤·à¥‡à¤¤à¥à¤°à¥‹à¤‚ à¤®à¥‡à¤‚ 15 à¤®à¤¿à¤¨à¤Ÿ à¤•à¥‡ à¤…à¤‚à¤¤à¤°à¤¾à¤² à¤ªà¤° à¤²à¥‰à¤— à¤•à¤¿à¤¯à¤¾ à¤œà¤¾à¤¨à¤¾ à¤šà¤¾à¤¹à¤¿à¤à¥¤ à¤œà¤¬ à¤¤à¤• à¤¸à¥à¤•à¥à¤°à¤¬à¤° à¤¦à¥‹ à¤µà¥‰à¤²à¥à¤¯à¥‚à¤® à¤à¤•à¥à¤¸à¤šà¥‡à¤‚à¤œ à¤ªà¥‚à¤°à¤¾ à¤¨à¤¹à¥€à¤‚ à¤•à¤° à¤²à¥‡à¤¤à¥‡, à¤¤à¤¬ à¤¤à¤• à¤®à¥ˆà¤¨à¥à¤…à¤² à¤¤à¤•à¤¨à¥€à¤¶à¤¿à¤¯à¤¨ à¤¹à¥ˆà¤š à¤‡à¤‚à¤Ÿà¤°à¤²à¥‰à¤•à¥à¤¸ à¤ªà¥à¤°à¤¾à¤§à¤¿à¤•à¤°à¤£ à¤…à¤¸à¥à¤µà¥€à¤•à¤¾à¤° à¤•à¤°à¥‡à¤‚à¤—à¥‡à¥¤",
          "synthesis.guarantee":
            "à¤ªà¥‚à¤°à¥€ à¤¤à¤°à¤¹ à¤¸à¥‡ à¤¸à¥à¤¥à¤¾à¤¨à¥€à¤¯ à¤à¤¯à¤°-à¤—à¥ˆà¤ªà¥à¤¡ à¤•à¥à¤°à¤¿à¤ªà¥à¤Ÿà¥‹à¤—à¥à¤°à¤¾à¤«à¤¼à¤¿à¤• à¤µà¥‰à¤²à¥à¤¯à¥‚à¤® à¤ªà¤° à¤†à¤§à¤¾à¤°à¤¿à¤¤à¥¤ à¤¶à¥‚à¤¨à¥à¤¯ à¤­à¥à¤°à¤® à¤¸à¤¹à¤¿à¤·à¥à¤£à¥à¤¤à¤¾à¥¤",
          "synthesis.audit": "à¤‘à¤¡à¤¿à¤Ÿ à¤²à¥‰à¤—",
          "prompt.sugg1": '"à¤¶à¤Ÿà¤¡à¤¾à¤‰à¤¨ à¤•à¥€ à¤•à¥à¤¯à¤¾ à¤†à¤µà¤¶à¥à¤¯à¤•à¤¤à¤¾à¤à¤‚ à¤¹à¥ˆà¤‚?"',
          "prompt.sugg2": '"à¤ªà¤¿à¤›à¤²à¥‡ à¤œà¤‚à¤— à¤•à¥‡ à¤¨à¤¿à¤·à¥à¤•à¤°à¥à¤· à¤–à¥‹à¤œà¥‡à¤‚à¥¤"',
          "prompt.sugg3": '"à¤¨à¤¿à¤°à¥€à¤•à¥à¤·à¤£ à¤°à¤¿à¤ªà¥‹à¤°à¥à¤Ÿ à¤•à¤¾ à¤¸à¤¾à¤°à¤¾à¤‚à¤¶ à¤¦à¥‡à¤‚à¥¤"',
          "composer.placeholder": "à¤…à¤ªà¤¨à¥‡ à¤¨à¤¿à¤œà¥€ à¤œà¥à¤žà¤¾à¤¨ à¤•à¥‹à¤· à¤¸à¥‡ à¤ªà¥‚à¤›à¥‡à¤‚...",
          "drawer.header_sub": "à¤ªà¥ƒà¤·à¥à¤  18 / 64 Â· à¤…à¤¨à¥à¤­à¤¾à¤— 4.2 à¤¡à¥€à¤ªà¥à¤°à¥‡à¤¸à¤°à¤¾à¤‡à¤œà¥‡à¤¶à¤¨",
          "drawer.citation_match": "à¤¸à¤Ÿà¥€à¤• à¤‰à¤¦à¥à¤§à¤°à¤£ à¤®à¤¿à¤²à¤¾à¤¨",
          "drawer.target_badge": "à¤—à¥à¤°à¤¾à¤‰à¤‚à¤¡à¤¿à¤‚à¤— à¤²à¤•à¥à¤·à¥à¤¯ Â· à¤‰à¤¦à¥à¤§à¤°à¤£ #1",
          "drawer.snippet_body":
            '"à¤…à¤¨à¥à¤¸à¥‚à¤šà¤¿à¤¤ à¤¯à¤¾ à¤†à¤ªà¤¾à¤¤à¤•à¤¾à¤²à¥€à¤¨ à¤¶à¤Ÿà¤¡à¤¾à¤‰à¤¨ à¤•à¥‡ à¤¦à¥Œà¤°à¤¾à¤¨, à¤†à¤‡à¤¸à¥‹à¤²à¥‡à¤¶à¤¨ à¤µà¤¾à¤²à¥à¤µ IV-102 à¤¸à¥‡ IV-108 à¤•à¥‹ à¤¯à¤¾à¤‚à¤¤à¥à¤°à¤¿à¤• à¤°à¥‚à¤ª à¤¸à¥‡ à¤²à¥‰à¤• à¤”à¤° à¤ªà¥ˆà¤¡à¤²à¥‰à¤•-à¤Ÿà¥ˆà¤— à¤•à¤¿à¤¯à¤¾ à¤œà¤¾à¤à¤—à¤¾à¥¤ à¤¨à¤¿à¤•à¤²à¤¾ à¤¹à¥à¤† à¤•à¤¿à¤¨à¤¾à¤°à¤¾ à¤¸à¥€à¤² à¤¤à¥‹à¤¡à¤¼à¤¨à¥‡ à¤¸à¥‡ à¤ªà¤¹à¤²à¥‡ à¤¬à¤¾à¤ˆà¤ªà¤¾à¤¸ à¤®à¥ˆà¤¨à¤¿à¤«à¥‹à¤²à¥à¤¡ B-7 à¤ªà¤° à¤µà¤¿à¤­à¥‡à¤¦à¤• à¤Ÿà¥‡à¤²à¥€à¤®à¥‡à¤Ÿà¥à¤°à¥€ à¤¶à¥‚à¤¨à¥à¤¯ à¤¬à¤¾à¤° à¤•à¥€ à¤ªà¥à¤·à¥à¤Ÿà¤¿ à¤•à¤°à¤¨à¥€ à¤šà¤¾à¤¹à¤¿à¤..."',
          "drawer.preview": "à¤ªà¥ƒà¤·à¥à¤  à¤ªà¥‚à¤°à¥à¤µà¤¾à¤µà¤²à¥‹à¤•à¤¨ (18)",
          "drawer.prev": "â† à¤ªà¤¿à¤›à¤²à¤¾",
          "drawer.next": "à¤…à¤—à¤²à¤¾ â†’",
          "drawer.jump": "à¤œà¤¾à¤à¤‚:",
          "footer.kernel": "à¤µà¥‰à¤²à¥à¤Ÿ à¤•à¤°à¥à¤¨à¥‡à¤² v4.19-à¤à¤¯à¤°à¤—à¥ˆà¤ª",
          "footer.egress": "à¤¶à¥‚à¤¨à¥à¤¯-à¤¨à¤¿à¤°à¥à¤—à¤®à¤¨ à¤¸à¤¤à¥à¤¯à¤¾à¤ªà¤¿à¤¤",
        },
        kn: {
          "nav.chat": "à²šà²¾à²Ÿà³",
          "nav.knowledge": "à²œà³à²žà²¾à²¨",
          "nav.code": "à²•à³‹à²¡à³",
          "nav.models": "à²®à²¾à²¦à²°à²¿à²—à²³à³",
          "nav.logs": "à²²à²¾à²—à³â€Œà²—à²³à³",
          "status.offline": "à²†à²«à³â€Œà²²à³ˆà²¨à³",
          "settings.title": "à²•à²¾à²°à³à²¯à²•à³à²·à³‡à²¤à³à²°à²¦ à²†à²¦à³à²¯à²¤à³†à²—à²³à³",
          "settings.theme": "à²°à³‚à²ª (à²¥à³€à²®à³)",
          "settings.language": "à²­à²¾à²·à³† (Language)",
          "theme.light": "à²²à³ˆà²Ÿà³",
          "theme.dark": "à²¡à²¾à²°à³à²•à³",
          "theme.system": "à²¸à³à²µà²¯à²‚",
          "sidebar.sources": "à²®à³‚à²²à²—à²³à³",
          "sidebar.add": "+ à²¸à³‡à²°à²¿à²¸à²¿",
          "sidebar.enclave": "à²¸à³à²¥à²³à³€à²¯ à²Žà²¨à³â€Œà²•à³à²²à³‡à²µà³",
          "sidebar.enclave_sub":
            "4 à²®à³‚à²²à²—à²³à²¨à³à²¨à³ à²¸à³à²¥à²³à³€à²¯à²µà²¾à²—à²¿ à²¸à³‚à²šà²¿à²•à³† à²®à²¾à²¡à²²à²¾à²—à²¿à²¦à³† Â· à²Žà²¨à³â€Œà²•à³à²²à³‡à²µà³ à²¸à²•à³à²°à²¿à²¯",
          "workspace.title": "à²œà³à²žà²¾à²¨",
          "workspace.grounding": "à²—à³à²°à³Œà²‚à²¡à²¿à²‚à²—à³",
          "workspace.source_count": "4 à²®à³‚à²²à²—à²³à³",
          "workspace.strict_btn": "à²—à³à²°à³Œà²‚à²¡à²¿à²‚à²—à³: à²•à²Ÿà³à²Ÿà³à²¨à²¿à²Ÿà³à²Ÿà²¾à²¦",
          "synthesis.query_heading": "à²¸à³à²¥à²—à²¿à²¤à²—à³Šà²³à²¿à²¸à³à²µà²¿à²•à³†à²¯ à²…à²—à²¤à³à²¯à²¤à³†à²—à²³à³‡à²¨à³?",
          "synthesis.badge": "à²µà²¾à²²à³à²Ÿà³ à²¸à²‚à²¶à³à²²à³‡à²·à²£à³†",
          "synthesis.deterministic": "à²¦à³ƒà²¢à³€à²•à³ƒà²¤ à²ªà²°à²¿à²¶à³€à²²à²¨à³†: 99.8%",
          "synthesis.lead":
            "à²•à³‹à²²à³à²¡à³-à²²à³‚à²ªà³ à²¤à²ªà²¾à²¸à²£à³†à²—à³† à²®à³à²‚à²šà²¿à²¤à²µà²¾à²—à²¿ à²¨à²¿à²°à³à²µà²¹à²£à²¾ à²•à²¾à²°à³à²¯à²µà²¿à²§à²¾à²¨à²µà³ à²•à²Ÿà³à²Ÿà³à²¨à²¿à²Ÿà³à²Ÿà²¾à²¦ à²¬à²¹à³-à²¹à²‚à²¤à²¦ à²­à³Œà²¤à²¿à²• à²ªà³à²°à²¤à³à²¯à³‡à²•à²¤à³†à²¯ à²ªà³à²°à³‹à²Ÿà³‹à²•à²¾à²²à³ à²…à²¨à³à²¨à³ à²•à²¡à³à²¡à²¾à²¯à²—à³Šà²³à²¿à²¸à³à²¤à³à²¤à²¦à³†. à²®à³‚à²°à³ à²•à²¡à³à²¡à²¾à²¯ à²—à³‡à²Ÿà³â€Œà²—à²³ à²‰à²²à³à²²à³‡à²–:",
          "point1.title": "à²ªà³à²°à²¾à²¥à²®à²¿à²• à²²à³‚à²ªà³ à²’à²¤à³à²¤à²¡ à²¨à²¿à²µà²¾à²°à²£à³†",
          "point1.body":
            "à²ªà³à²°à²¤à³à²¯à³‡à²•à²¿à²¸à³à²µ à²µà²¾à²²à³à²µà³â€Œà²—à²³à³ IV-102 à²°à²¿à²‚à²¦ IV-108 à²µà²°à³†à²—à³† à²¯à²¾à²‚à²¤à³à²°à²¿à²•à²µà²¾à²—à²¿ à²²à²¾à²•à³ à²®à²¤à³à²¤à³ à²ªà³à²¯à²¾à²¡à³â€Œà²²à²¾à²•à³ à²®à²¾à²¡à²¬à³‡à²•à³. à²«à³à²²à³‡à²‚à²œà³ à²¸à³€à²²à³à²—à²³à²¨à³à²¨à³ à²¤à³†à²°à³†à²¯à³à²µ à²®à³Šà²¦à²²à³ à²¬à³ˆà²ªà²¾à²¸à³ à²®à³à²¯à²¾à²¨à²¿à²«à³‹à²²à³à²¡à³ B-7 à²¨à²²à³à²²à²¿ à²¶à³‚à²¨à³à²¯ à²¬à²¾à²°à³ (à²—à³‡à²œà³) à²‡à²°à³à²µà³à²¦à²¨à³à²¨à³ à²Ÿà³†à²²à²¿à²®à³†à²Ÿà³à²°à²¿ à²–à²šà²¿à²¤à²ªà²¡à²¿à²¸à²¬à³‡à²•à³.",
          "point2.title": "à²‰à²³à²¿à²¦ à²‰à²·à³à²£ à²ªà³à²°à²¸à²°à²£ à²…à²µà²§à²¿",
          "point2.body":
            "à²Žà²²à³à²²à²¾ à²ªà³à²°à²¾à²¥à²®à²¿à²• à²•à³‹à²°à³ à²¥à²°à³à²®à³‹à²•à²ªà²²à³ à²•à³à²²à²¸à³à²Ÿà²°à³â€Œà²—à²³à³ à²¨à²¿à²°à²‚à²¤à²° 60 à²¨à²¿à²®à²¿à²·à²—à²³ à²•à²¾à²² 42Â°C à²—à²¿à²‚à²¤ à²•à²¡à²¿à²®à³†à²¯à²¾à²—à³à²µà²µà²°à³†à²—à³† à²¸à²¹à²¾à²¯à²• à²•à³‚à²²à²¿à²‚à²—à³ à²ªà²‚à²ªà³â€Œà²—à²³à³ à²¬à²²à²µà²‚à²¤à²¦ à²ªà²°à²¿à²šà²²à²¨à³† à²¬à³ˆà²ªà²¾à²¸à³â€Œà²¨à²²à³à²²à²¿ à²²à²¾à²•à³ à²†à²—à²¿à²°à²¬à³‡à²•à³.",
          "point3.title": "à²¦à³à²µà²¿à²¤à³€à²¯ à²¨à²¿à²¯à²‚à²¤à³à²°à²£ à²µà²¾à²¤à²¾à²µà²°à²£ à²­à²°à²µà²¸à³†",
          "point3.body":
            "à²¬à²¾à²·à³à²ªà²¶à³€à²² à²«à³à²²à³‹à²°à³‹à²•à²¾à²°à³à²¬à²¨à³â€Œà²—à²³à²¿à²—à²¾à²—à²¿ à²µà²¾à²¤à²¾à²µà²°à²£à²¦ à²¸à²‚à²µà³‡à²¦à²• à²ªà²°à²¿à²¶à³€à²²à²¨à³†à²¯à²¨à³à²¨à³ à²Žà²²à³à²²à²¾ à²¨à²¾à²²à³à²•à³ à²µà²²à²¯à²—à²³à²²à³à²²à²¿ à²ªà³à²°à²¤à²¿ 15 à²¨à²¿à²®à²¿à²·à²—à²³à²¿à²—à³Šà²®à³à²®à³† à²¦à²¾à²–à²²à²¿à²¸à²¬à³‡à²•à³. à²¸à³à²•à³à²°à²¬à³à²¬à²°à³â€Œà²—à²³à³ à²Žà²°à²¡à³ à²µà²¾à²²à³à²¯à³‚à²®à³ à²µà²¿à²¨à²¿à²®à²¯à²µà²¨à³à²¨à³ à²ªà³‚à²°à³à²£à²—à³Šà²³à²¿à²¸à³à²µà²µà²°à³†à²—à³† à²¹à³à²¯à²¾à²šà³ à²‡à²‚à²Ÿà²°à³â€Œà²²à²¾à²•à³â€Œà²—à²³à³ à²ªà³à²°à²µà³‡à²¶ à²¨à²¿à²°à²¾à²•à²°à²¿à²¸à³à²¤à³à²¤à²µà³†.",
          "synthesis.guarantee":
            "à²¸à²‚à²ªà³‚à²°à³à²£à²µà²¾à²—à²¿ à²¸à³à²¥à²³à³€à²¯ à²à²°à³â€Œà²—à³à²¯à²¾à²ªà³à²¡à³ à²•à³à²°à²¿à²ªà³à²Ÿà³‹à²—à³à²°à²¾à²«à²¿à²•à³ à²µà²¾à²²à³à²¯à³‚à²®à³ à²†à²§à²¾à²°à²¿à²¤. à²¶à³‚à²¨à³à²¯ à²­à³à²°à²®à³† à²¸à²¹à²¿à²·à³à²£à³à²¤à³†.",
          "synthesis.audit": "à²†à²¡à²¿à²Ÿà³ à²²à²¾à²—à³",
          "prompt.sugg1": '"à²¸à³à²¥à²—à²¿à²¤à²—à³Šà²³à²¿à²¸à³à²µà²¿à²•à³†à²¯ à²…à²—à²¤à³à²¯à²¤à³†à²—à²³à³‡à²¨à³?"',
          "prompt.sugg2": '"à²¹à²¿à²‚à²¦à²¿à²¨ à²¤à³à²•à³à²•à³ à²¸à²‚à²¶à³‹à²§à²¨à³†à²—à²³à²¨à³à²¨à³ à²¹à³à²¡à³à²•à²¿."',
          "prompt.sugg3": '"à²¤à²ªà²¾à²¸à²£à²¾ à²µà²°à²¦à²¿à²¯à²¨à³à²¨à³ à²¸à²‚à²•à³à²·à³‡à²ªà²¿à²¸à²¿."',
          "composer.placeholder": "à²¨à²¿à²®à³à²® à²–à²¾à²¸à²—à²¿ à²œà³à²žà²¾à²¨ à²¸à²‚à²—à³à²°à²¹à²µà²¨à³à²¨à³ à²•à³‡à²³à²¿...",
          "drawer.header_sub": "à²ªà³à²Ÿ 18 / 64 Â· à²µà²¿à²­à²¾à²— 4.2 à²’à²¤à³à²¤à²¡ à²¨à²¿à²µà²¾à²°à²£à³†",
          "drawer.citation_match": "à²¨à²¿à²–à²°à²µà²¾à²¦ à²‰à²²à³à²²à³‡à²– à²¹à³Šà²‚à²¦à²¾à²£à²¿à²•à³†",
          "drawer.target_badge": "à²—à³à²°à³Œà²‚à²¡à²¿à²‚à²—à³ à²—à³à²°à²¿ Â· à²‰à²²à³à²²à³‡à²– #1",
          "drawer.snippet_body":
            '"à²¨à²¿à²—à²¦à²¿à²¤ à²…à²¥à²µà²¾ à²¤à³à²°à³à²¤à³ à²¸à³à²¥à²—à²¿à²¤à²—à³Šà²³à²¿à²¸à³à²µ à²¸à²®à²¯à²¦à²²à³à²²à²¿, à²ªà³à²°à²¤à³à²¯à³‡à²•à²¿à²¸à³à²µ à²µà²¾à²²à³à²µà³â€Œà²—à²³à³ IV-102 à²°à²¿à²‚à²¦ IV-108 à²µà²°à³†à²—à³† à²¯à²¾à²‚à²¤à³à²°à²¿à²•à²µà²¾à²—à²¿ à²²à²¾à²•à³ à²®à²¾à²¡à²¬à³‡à²•à³. à²«à³à²²à³‡à²‚à²œà³ à²¸à³€à²²à³à²—à²³à²¨à³à²¨à³ à²®à³à²°à²¿à²¯à³à²µ à²®à³Šà²¦à²²à³ à²¬à³ˆà²ªà²¾à²¸à³ à²®à³à²¯à²¾à²¨à²¿à²«à³‹à²²à³à²¡à³ B-7 à²¨à²²à³à²²à²¿ à²¶à³‚à²¨à³à²¯ à²¬à²¾à²°à³ à²‡à²°à³à²µà³à²¦à²¨à³à²¨à³ à²Ÿà³†à²²à²¿à²®à³†à²Ÿà³à²°à²¿ à²–à²šà²¿à²¤à²ªà²¡à²¿à²¸à²¬à³‡à²•à³..."',
          "drawer.preview": "à²ªà³à²Ÿ à²ªà³‚à²°à³à²µà²µà³€à²•à³à²·à²£à³† (18)",
          "drawer.prev": "â† à²¹à²¿à²‚à²¦à²¿à²¨",
          "drawer.next": "à²®à³à²‚à²¦à²¿à²¨ â†’",
          "drawer.jump": "à²ªà³à²Ÿ:",
          "footer.kernel": "à²µà²¾à²²à³à²Ÿà³ à²•à²°à³à²¨à²²à³ v4.19-à²à²°à³â€Œà²—à³à²¯à²¾à²ªà³",
          "footer.egress": "à²¶à³‚à²¨à³à²¯-à²¹à³Šà²°à²¹à²°à²¿à²µà³ à²ªà²°à²¿à²¶à³€à²²à²¿à²¸à²²à²¾à²—à²¿à²¦à³†",
        },
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
          const prefersDark = window.matchMedia(
            "(prefers-color-scheme: dark)",
          ).matches;
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
        document.querySelectorAll(".theme-option-btn").forEach((btn) => {
          const val = btn.getAttribute("data-theme-val");
          if (val === theme) {
            btn.className =
              "theme-option-btn flex items-center justify-center gap-1 py-1 rounded font-mono text-[11px] bg-v-surface text-v-accent font-semibold shadow-xs border border-v-border";
          } else {
            btn.className =
              "theme-option-btn flex items-center justify-center gap-1 py-1 rounded font-mono text-[11px] text-v-text-sec hover:text-v-text transition-all";
          }
        });
      }

      // Listen for system theme changes if set to system
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", (e) => {
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
        const langCodeDisplay = document.getElementById("current-lang-code");
        if (langCodeDisplay) langCodeDisplay.textContent = lang.toUpperCase();

        // Update elements with data-i18n
        const dict = i18nData[lang];
        document.querySelectorAll("[data-i18n]").forEach((elem) => {
          const key = elem.getAttribute("data-i18n");
          if (dict[key]) {
            elem.textContent = dict[key];
          }
        });

        // Update input placeholder
        const composerInput = document.getElementById("main-composer-input");
        if (composerInput && dict["composer.placeholder"]) {
          composerInput.placeholder = dict["composer.placeholder"];
        }

        // Update language options checkmarks in popover
        document.querySelectorAll(".lang-option-btn").forEach((btn) => {
          const val = btn.getAttribute("data-lang-val");
          const checkIcon = btn.querySelector(".check-icon");
          if (val === lang) {
            btn.classList.add(
              "bg-v-surface-sec",
              "text-v-accent",
              "font-medium",
            );
            if (checkIcon) checkIcon.classList.remove("opacity-0");
          } else {
            btn.classList.remove(
              "bg-v-surface-sec",
              "text-v-accent",
              "font-medium",
            );
            if (checkIcon) checkIcon.classList.add("opacity-0");
          }
        });
      }

      // 4. Popover Toggle & Global Interactions
      const settingsBtn = document.getElementById("settings-trigger");
      const settingsPopover = document.getElementById("settings-popover");

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
          if (
            !settingsPopover.contains(e.target) &&
            !settingsBtn.contains(e.target)
          ) {
            settingsPopover.classList.add("hidden");
            settingsBtn.setAttribute("aria-expanded", "false");
          }
        });
      }

      // Bind Theme Option clicks
      document.querySelectorAll(".theme-option-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
          const val = this.getAttribute("data-theme-val");
          applyTheme(val);
        });
      });

      // Bind Language Option clicks
      document.querySelectorAll(".lang-option-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
          const val = this.getAttribute("data-lang-val");
          applyLanguage(val);
        });
      });

      // Initial Mount
      applyTheme(currentTheme);
      applyLanguage(currentLang);
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
      className={
        "bg-v-bg font-sans text-v-text antialiased selection:bg-v-tint selection:text-v-accent"
      }
    >
      {" "}
      <main className={"w-full min-h-screen bg-v-bg "}>
        {" "}
        <div className={"flex flex-col w-full text-v-text"}>
          {" "}
          <div
            className={
              "flex w-full select-none bg-v-bg h-screen overflow-hidden"
            }
          >
            {" "}
            <section
              className={"flex-1 flex flex-col min-w-0 bg-v-bg relative"}
            >
              {" "}
              <div
                className={
                  "h-12 px-8 flex items-center justify-between border-b border-v-border bg-v-surface/80 backdrop-blur-sm flex-shrink-0"
                }
              >
                {" "}
                <div className={"flex items-center gap-3"}>
                  {" "}
                  <h1
                    className={"text-lg font-medium tracking-tight text-v-text"}
                    data-i18n={"workspace.title"}
                  >
                    Knowledge
                  </h1>{" "}
                  <span className={"text-v-text-dim text-sm"}>/</span>{" "}
                  <div className={"flex items-center gap-1.5"}>
                    {" "}
                    <span
                      className={
                        "font-mono text-xs text-v-text-sec uppercase tracking-wider"
                      }
                      data-i18n={"workspace.grounding"}
                    >
                      Grounding
                    </span>{" "}
                    <span
                      className={
                        "font-mono text-[11px] text-v-text-sec px-1.5 py-0.5 bg-v-surface-sec border border-v-border rounded"
                      }
                      data-i18n={"workspace.source_count"}
                    >
                      4 sources
                    </span>{" "}
                  </div>{" "}
                </div>{" "}
                <div className={"flex items-center gap-3"}>
                  {" "}
                  <button
                    className={
                      "flex items-center gap-1.5 px-2.5 py-1 rounded border border-v-border bg-v-surface text-v-text-sec hover:text-v-text text-xs font-mono uppercase transition-colors shadow-sm"
                    }
                    type={"button"}
                  >
                    {" "}
                    <span className={"material-symbols-outlined text-[14px]"}>
                      tune
                    </span>{" "}
                    <span
                      className={"text-v-accent font-medium"}
                      data-i18n={"workspace.strict_btn"}
                    >
                      Grounding: Strict
                    </span>{" "}
                  </button>{" "}
                  <button
                    className={
                      "w-7 h-7 rounded border border-v-border bg-v-surface flex items-center justify-center text-v-text-sec hover:text-v-text transition-colors shadow-sm"
                    }
                    title={"Export session synthesis"}
                    type={"button"}
                  >
                    {" "}
                    <span className={"material-symbols-outlined text-[16px]"}>
                      file_download
                    </span>{" "}
                  </button>{" "}
                </div>{" "}
              </div>{" "}
              <div
                className={
                  "flex-1 overflow-y-auto py-8 flex flex-col items-center select-text px-6"
                }
              >
                {" "}
                <div className={"w-full max-w-[760px] flex flex-col pb-36"}>
                  {" "}
                  <div
                    className={
                      "flex items-baseline justify-between mb-8 pb-4 border-b border-v-border"
                    }
                  >
                    {" "}
                    <h2
                      className={
                        "text-2xl font-normal text-v-text tracking-tight"
                      }
                      data-i18n={"synthesis.query_heading"}
                    >
                      What are the shutdown requirements?
                    </h2>{" "}
                    <span
                      className={
                        "font-mono text-xs text-v-text-dim ml-4 flex-shrink-0"
                      }
                    >
                      QUERY_ID #8902
                    </span>{" "}
                  </div>{" "}
                  <article className={"flex flex-col gap-6"}>
                    {" "}
                    <div className={"flex items-center gap-2"}>
                      {" "}
                      <span
                        className={
                          "font-mono text-xs uppercase text-v-accent font-semibold tracking-widest px-2 py-0.5 bg-v-tint border border-v-border rounded"
                        }
                        data-i18n={"synthesis.badge"}
                      >
                        VAULT SYNTHESIS
                      </span>{" "}
                      <span
                        className={"font-mono text-[11px] text-v-text-dim"}
                        data-i18n={"synthesis.deterministic"}
                      >
                        Deterministic verification: 99.8%
                      </span>{" "}
                    </div>{" "}
                    <p
                      className={
                        "text-base text-v-text-sec leading-relaxed font-normal"
                      }
                      data-i18n={"synthesis.lead"}
                    >
                      The maintenance procedure mandates a strict multi-staged
                      physical isolation protocol prior to cold-loop inspection.
                      Cross-document grounding references three compulsory
                      gates:
                    </p>{" "}
                    <div
                      className={
                        "flex flex-col gap-3 pl-4 border-l-2 border-v-accent bg-v-surface border border-v-border p-4 rounded-r shadow-xs"
                      }
                    >
                      {" "}
                      <div className={"flex items-start gap-3"}>
                        {" "}
                        <span
                          className={
                            "font-mono text-xs text-v-accent font-semibold"
                          }
                        >
                          01
                        </span>{" "}
                        <div className={"flex flex-col gap-2"}>
                          {" "}
                          <h3
                            className={
                              "text-base font-medium text-v-text tracking-normal"
                            }
                            data-i18n={"point1.title"}
                          >
                            Primary Loop Depressurization
                          </h3>{" "}
                          <p
                            className={
                              "text-sm text-v-text-sec leading-relaxed"
                            }
                            data-i18n={"point1.body"}
                          >
                            Isolation valves{" "}
                            <code
                              className={
                                "font-mono text-xs px-1 py-0.5 bg-v-surface-sec border border-v-border text-v-text rounded"
                              }
                            >
                              IV-102
                            </code>{" "}
                            through{" "}
                            <code
                              className={
                                "font-mono text-xs px-1 py-0.5 bg-v-surface-sec border border-v-border text-v-text rounded"
                              }
                            >
                              IV-108
                            </code>{" "}
                            must be mechanically dogged and padlock-tagged.
                            Differential telemetry must confirm zero bar (gauge)
                            across bypass manifold B-7 before breaking flange
                            seals.
                          </p>{" "}
                          <div className={"mt-1 flex items-center"}>
                            {" "}
                            <button
                              className={
                                "inline-flex items-center gap-2 px-2.5 py-1 rounded bg-v-surface border border-v-border text-v-accent hover:bg-v-tint transition-colors shadow-sm cursor-pointer"
                              }
                              type={"button"}
                            >
                              {" "}
                              <span
                                className={
                                  "material-symbols-outlined text-[14px]"
                                }
                              >
                                auto_stories
                              </span>{" "}
                              <span
                                className={
                                  "font-mono text-xs font-medium tracking-wide"
                                }
                              >
                                Maintenance SOP Â· p.18
                              </span>{" "}
                              <span
                                className={
                                  "w-1.5 h-1.5 rounded-full bg-v-accent"
                                }
                              ></span>{" "}
                            </button>{" "}
                          </div>{" "}
                        </div>{" "}
                      </div>{" "}
                    </div>{" "}
                    <div
                      className={
                        "flex flex-col gap-3 pl-4 border-l border-v-border p-3.5 bg-v-surface/40 rounded"
                      }
                    >
                      {" "}
                      <div className={"flex items-start gap-3"}>
                        {" "}
                        <span
                          className={
                            "font-mono text-xs text-v-accent font-semibold"
                          }
                        >
                          02
                        </span>{" "}
                        <div className={"flex flex-col gap-2"}>
                          {" "}
                          <h3
                            className={
                              "text-base font-medium text-v-text tracking-normal"
                            }
                            data-i18n={"point2.title"}
                          >
                            Residual Thermal Dissipation Window
                          </h3>{" "}
                          <p
                            className={
                              "text-sm text-v-text-sec leading-relaxed"
                            }
                            data-i18n={"point2.body"}
                          >
                            Auxiliary cooling pumps must remain locked on
                            forced-circulation bypass until all primary core
                            thermocouple clusters register below 42Â°C for a
                            continuous, uninterrupted 60-minute interval.
                          </p>{" "}
                          <div className={"mt-1 flex items-center"}>
                            {" "}
                            <button
                              className={
                                "inline-flex items-center gap-2 px-2.5 py-1 rounded bg-v-tint border border-v-border text-v-accent hover:border-v-accent/50 transition-colors shadow-xs cursor-pointer"
                              }
                              type={"button"}
                            >
                              {" "}
                              <span
                                className={
                                  "material-symbols-outlined text-[14px]"
                                }
                              >
                                auto_stories
                              </span>{" "}
                              <span
                                className={
                                  "font-mono text-xs font-medium tracking-wide"
                                }
                              >
                                Inspection Report Â· p.23
                              </span>{" "}
                            </button>{" "}
                          </div>{" "}
                        </div>{" "}
                      </div>{" "}
                    </div>{" "}
                    <div
                      className={
                        "flex flex-col gap-3 pl-4 border-l border-v-border p-4 bg-v-surface rounded border shadow-xs"
                      }
                    >
                      {" "}
                      <div className={"flex items-start gap-3"}>
                        {" "}
                        <span
                          className={
                            "font-mono text-xs text-v-accent font-semibold"
                          }
                        >
                          03
                        </span>{" "}
                        <div className={"flex flex-col gap-2"}>
                          {" "}
                          <h3
                            className={
                              "text-base font-medium text-v-text tracking-normal"
                            }
                            data-i18n={"point3.title"}
                          >
                            Secondary Containment Atmospheric Assurance
                          </h3>{" "}
                          <p
                            className={
                              "text-sm text-v-text-sec leading-relaxed"
                            }
                            data-i18n={"point3.body"}
                          >
                            Atmospheric sensor verification for volatile
                            fluorocarbons must be logged at 15-minute intervals
                            across all four facility quadrants. Manual
                            technician hatch interlocks will refuse
                            authorization until scrubbers complete two volume
                            exchanges.
                          </p>{" "}
                          <div className={"mt-1 flex items-center"}>
                            {" "}
                            <button
                              className={
                                "inline-flex items-center gap-2 px-2.5 py-1 rounded bg-v-tint border border-v-border text-v-accent hover:border-v-accent/50 transition-colors shadow-xs cursor-pointer"
                              }
                              type={"button"}
                            >
                              {" "}
                              <span
                                className={
                                  "material-symbols-outlined text-[14px]"
                                }
                              >
                                auto_stories
                              </span>{" "}
                              <span
                                className={
                                  "font-mono text-xs font-medium tracking-wide"
                                }
                              >
                                Safety Manual Â· p.91
                              </span>{" "}
                            </button>{" "}
                          </div>{" "}
                        </div>{" "}
                      </div>{" "}
                    </div>{" "}
                    <div
                      className={
                        "flex flex-col gap-3 pl-4 border-l border-v-border p-4 bg-v-surface rounded border shadow-xs"
                      }
                    >
                      {" "}
                      <div className={"flex items-center gap-3"}>
                        {" "}
                        <span
                          className={
                            "material-symbols-outlined text-v-text-dim text-[18px]"
                          }
                        >
                          verified_user
                        </span>{" "}
                      </div>{" "}
                      <button
                        className={
                          "font-mono text-xs text-v-text-sec hover:text-v-text uppercase underline tracking-wider"
                        }
                        data-i18n={"synthesis.audit"}
                        type={"button"}
                      >
                        Audit Log
                      </button>{" "}
                    </div>{" "}
                  </article>{" "}
                </div>{" "}
              </div>{" "}
              <div
                className={
                  "absolute bottom-0 left-0 right-0 p-6 flex flex-col items-center bg-gradient-to-t from-v-bg via-v-bg/95 to-transparent pointer-events-none"
                }
              >
                {" "}
                <div
                  className={
                    "w-full max-w-[740px] flex flex-col gap-2.5 pointer-events-auto"
                  }
                >
                  {" "}
                  <div
                    className={
                      "flex items-center justify-center gap-3 overflow-x-auto py-1"
                    }
                  >
                    {" "}
                    <button
                      className={
                        "font-mono text-[11px] text-v-text-sec hover:text-v-accent transition-colors cursor-pointer truncate"
                      }
                      data-i18n={"prompt.sugg1"}
                      type={"button"}
                    >
                      "What are the shutdown requirements?"
                    </button>{" "}
                    <span className={"text-v-text-dim font-mono text-[10px]"}>
                      Â·
                    </span>{" "}
                    <button
                      className={
                        "font-mono text-[11px] text-v-text-sec hover:text-v-accent transition-colors cursor-pointer truncate"
                      }
                      data-i18n={"prompt.sugg2"}
                      type={"button"}
                    >
                      "Find previous corrosion findings."
                    </button>{" "}
                    <span className={"text-v-text-dim font-mono text-[10px]"}>
                      Â·
                    </span>{" "}
                    <button
                      className={
                        "font-mono text-[11px] text-v-text-sec hover:text-v-accent transition-colors cursor-pointer truncate"
                      }
                      data-i18n={"prompt.sugg3"}
                      type={"button"}
                    >
                      "Summarize the inspection report."
                    </button>{" "}
                  </div>{" "}
                  <div
                    className={
                      "w-full flex items-center bg-v-surface border border-v-border rounded-full px-3 py-2 shadow-lg focus-within:border-v-accent/70 transition-all pl-2.5 pr-2.5"
                    }
                  >
                    <button
                      className={
                        "w-8 h-8 rounded-full flex items-center justify-center text-v-text-sec hover:text-v-text transition-colors flex-shrink-0 hover:bg-v-surface-sec"
                      }
                      title={"Add local document to context"}
                      type={"button"}
                    >
                      <span className={"material-symbols-outlined text-[20px]"}>
                        add
                      </span>
                    </button>
                    <input
                      className={
                        "flex-1 bg-transparent px-3 text-sm text-v-text placeholder:text-v-text-dim focus:outline-none"
                      }
                      id={"main-composer-input"}
                      placeholder={"Ask your private knowledge base..."}
                      type={"text"}
                    />
                    <div className={"flex items-center gap-1.5 flex-shrink-0"}>
                      <span
                        className={
                          "font-mono text-[10px] text-v-text-sec px-2 py-0.5 bg-v-surface-sec rounded-full border border-v-border"
                        }
                      >
                        âŒ˜K
                      </span>
                      <button
                        className={
                          "w-8 h-8 rounded-full bg-v-accent text-white flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
                        }
                        title={"Submit Query"}
                        type={"button"}
                      >
                        <span
                          className={"material-symbols-outlined text-[18px]"}
                        >
                          arrow_upward
                        </span>
                      </button>
                    </div>
                  </div>{" "}
                </div>{" "}
              </div>{" "}
            </section>{" "}
          </div>{" "}
        </div>{" "}
      </main>{" "}
      <footer className={"w-full bg-v-surface border-t border-v-border py-2 "}>
        {" "}
        <div
          className={
            "w-full px-6 flex items-center justify-between font-mono text-[11px] text-v-text-dim"
          }
        >
          {" "}
          <span className={""} data-i18n={"footer.kernel"}>
            VAULT KERNEL v4.19-AIRGAP
          </span>{" "}
          <div className={"flex items-center gap-4"}>
            {" "}
            <span className={""}>MEM: 128GB LOCK</span>{" "}
            <span className={""}>SEC: LEVEL-5</span>{" "}
            <span className={""} data-i18n={"footer.egress"}>
              ZERO-EGRESS VERIFIED
            </span>{" "}
          </div>{" "}
        </div>{" "}
      </footer>{" "}
    </div>
  );
}
