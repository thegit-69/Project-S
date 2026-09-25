import forms from '@tailwindcss/forms'
import containerQueries from '@tailwindcss/container-queries'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
  "extend": {
    "colors": {
      "vault": {
        "bg": "#F7F6F2",
        "panel": "#FFFFFF",
        "surface": "#F0EEE8",
        "border": "#E2DED5",
        "borderMuted": "#E2DED5",
        "text": "#20211F",
        "muted": "#77766F",
        "dim": "#A09E96",
        "accent": "#D96B32",
        "accentHover": "#B95324",
        "accentLight": "#F8E9DF",
        "dark": {
          "bg": "#151614",
          "panel": "#1C1E1B",
          "surface": "#242620",
          "border": "#34362F",
          "borderMuted": "#34362F",
          "text": "#ECEAE3",
          "muted": "#A6A69D",
          "dim": "#777970",
          "accentSurface": "#3A2921"
        }
      },
      "v-bg": "var(--bg)",
      "v-surface": "var(--surface)",
      "v-surface-sec": "var(--surface-sec)",
      "v-border": "var(--border)",
      "v-text": "var(--text)",
      "v-text-sec": "var(--text-sec)",
      "v-text-dim": "var(--text-dim)",
      "v-accent": "var(--accent)",
      "v-tint": "var(--accent-tint)",
      "background": "var(--color-background)",
      "surface": "var(--color-surface)",
      "surface-container": "var(--bg-surface)",
      "surface-container-low": "var(--bg-workbench)",
      "surface-container-lowest": "var(--bg-surface)",
      "surface-container-high": "var(--bg-secondary)",
      "surface-container-highest": "var(--border-color)",
      "surface-variant": "var(--bg-secondary)",
      "on-surface": "var(--text-primary)",
      "on-surface-variant": "var(--text-secondary)",
      "outline": "var(--outline-color)",
      "outline-variant": "var(--border-color)",
      "primary": "#D96B32",
      "primary-container": "var(--bg-primary-container)",
      "on-primary": "#FFFFFF",
      "on-primary-container": "#B95324",
      "secondary": "var(--text-secondary)",
      "secondary-container": "var(--bg-secondary)",
      "on-secondary-container": "var(--text-primary)",
      "tertiary": "var(--text-tertiary)",
      "error": "#BA1A1A",
      "primary-hover": "#B95324",
      "primary-tint": "var(--color-primary-tint)",
      "surface-alt": "var(--color-surface-alt)",
      "text-main": "var(--color-text-main)",
      "text-muted": "var(--color-text-muted)",
      "text-subtle": "var(--color-text-subtle)",
      "border-subtle": "var(--color-border-subtle)",
      "page-bg": "var(--color-page-bg)",
      "card-bg": "var(--color-card-bg)",
      "chip-bg": "var(--color-chip-bg)",
      "accent-tint": "var(--color-accent-tint)",
      "accent-burnt": "#D96B32",
      "text-primary": "var(--color-text-primary)",
      "text-placeholder": "var(--color-text-placeholder)"
    },
    "fontFamily": {
      "sans": [
        "Inter",
        "Noto Sans Devanagari",
        "Noto Sans Kannada",
        "sans-serif"
      ],
      "mono": [
        "JetBrains Mono",
        "monospace"
      ],
      "label-md": [
        "JetBrains Mono",
        "monospace"
      ],
      "body-md": [
        "Inter",
        "Noto Sans Devanagari",
        "Noto Sans Kannada",
        "sans-serif"
      ],
      "code-md": [
        "JetBrains Mono",
        "monospace"
      ],
      "headline-lg": [
        "Inter",
        "Noto Sans Devanagari",
        "Noto Sans Kannada",
        "sans-serif"
      ],
      "label-sm": [
        "JetBrains Mono",
        "monospace"
      ],
      "headline-md": [
        "Inter",
        "Noto Sans Devanagari",
        "Noto Sans Kannada",
        "sans-serif"
      ],
      "headline-xl": [
        "Inter",
        "Noto Sans Devanagari",
        "Noto Sans Kannada",
        "sans-serif"
      ],
      "body-lg": [
        "Inter",
        "Noto Sans Devanagari",
        "Noto Sans Kannada",
        "sans-serif"
      ],
      "code-lg": [
        "JetBrains Mono",
        "monospace"
      ],
      "body-sm": [
        "Inter",
        "Noto Sans Devanagari",
        "Noto Sans Kannada",
        "sans-serif"
      ]
    },
    "borderRadius": {
      "vault": "6px",
      "vault-lg": "8px",
      "DEFAULT": "0.125rem",
      "lg": "0.25rem",
      "xl": "0.5rem",
      "full": "0.75rem"
    },
    "spacing": {
      "margin": "1rem",
      "margin-desktop": "2rem",
      "space-xs": "0.25rem",
      "space-sm": "0.5rem",
      "space-md": "1rem",
      "space-lg": "1.5rem",
      "space-xl": "2.5rem",
      "gutter": "1rem",
      "gutter-desktop": "1.5rem"
    },
    "fontSize": {
      "label-md": [
        "0.75rem",
        {
          "lineHeight": "1rem",
          "letterSpacing": "0.06em",
          "fontWeight": "500"
        }
      ],
      "body-md": [
        "0.875rem",
        {
          "lineHeight": "1.45rem",
          "fontWeight": "400"
        }
      ],
      "code-md": [
        "0.8125rem",
        {
          "lineHeight": "1.35rem",
          "fontWeight": "400"
        }
      ],
      "headline-lg": [
        "1.75rem",
        {
          "lineHeight": "2.25rem",
          "letterSpacing": "-0.015em",
          "fontWeight": "600"
        }
      ],
      "label-sm": [
        "0.6875rem",
        {
          "lineHeight": "0.875rem",
          "letterSpacing": "0.08em",
          "fontWeight": "500"
        }
      ],
      "headline-md": [
        "1.25rem",
        {
          "lineHeight": "1.75rem",
          "letterSpacing": "-0.01em",
          "fontWeight": "500"
        }
      ],
      "headline-xl": [
        "2.25rem",
        {
          "lineHeight": "2.75rem",
          "letterSpacing": "-0.02em",
          "fontWeight": "600"
        }
      ],
      "body-lg": [
        "1rem",
        {
          "lineHeight": "1.6rem",
          "fontWeight": "400"
        }
      ],
      "code-lg": [
        "0.9375rem",
        {
          "lineHeight": "1.5rem",
          "fontWeight": "400"
        }
      ],
      "body-sm": [
        "0.8125rem",
        {
          "lineHeight": "1.35rem",
          "fontWeight": "400"
        }
      ]
    }
  }
},
  plugins: [forms, containerQueries],
}
