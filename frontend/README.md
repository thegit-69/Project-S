# VAULT — Sovereign AI Workbench (React, converted from Stitch)

Run:

    npm install
    npm run dev

## What this is
Each screen is the exact markup and Tailwind classes from your Stitch export, converted to JSX:

| Screen | Component |
|---|---|
| Workbench Chat | src/screens/ChatScreen.jsx |
| Knowledge Base | src/screens/KnowledgeScreen.jsx |
| Code Studio | src/screens/CodeScreen.jsx |
| Models Registry | src/screens/ModelsScreen.jsx |
| Activity Logs | src/screens/LogsScreen.jsx |

- Sidebar navigation switches between the five screens (with a fade transition).
- The original interactions from the Stitch scripts are kept: theme (light / dark / system), language (EN / HI / KN), settings popover, filters, search, and accordions.
- Tailwind config and CSS from all five Stitch files are merged into src/styles/stitch.css and tailwind.config.js.
- Data is not yet connected to a backend.
