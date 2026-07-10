/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        anime: {
          // Semantic Tokens
          background: "var(--bg-primary)",
          surface: "var(--bg-surface)",
          elevated: "var(--bg-elevated)",
          hover: "var(--bg-hover)",
          divider: "var(--border-subtle)",
          
          "text-primary": "var(--text-primary)",
          "text-secondary": "var(--text-secondary)",
          "text-muted": "var(--text-muted)",

          accent: "var(--accent-interactive)",
          indigo: "var(--accent-indigo)",
          gold: "var(--accent-gold)",
          red: "var(--accent-red)",
          error: "var(--accent-error)",
          success: "var(--accent-success)",

          // Legacy mappings for backward compatibility
          bg: "var(--bg-primary)",
          card: "var(--bg-surface)",
          border: "var(--border-subtle)",
          hoverBorder: "var(--border-subtle)",
          primary: "var(--accent-interactive)",
          secondary: "var(--accent-indigo)",
          purple: "#9b5de5",
          pink: "#f15bb5",
          yellow: "var(--accent-gold)",
          text: "var(--text-primary)",
          light: "#F5F5F7"
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      fontFamily: {
        fraunces: ['Fraunces', 'serif'],
        inter: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        card: "18px",
        btn: "14px",
        input: "14px",
        dialog: "22px"
      },
      boxShadow: {
        soft: "0 8px 32px rgba(0,0,0,0.25)",
        "soft-hover": "0 12px 40px rgba(0,0,0,0.35)",
      },
      transitionDuration: {
        220: "220ms"
      }
    },
  },
  plugins: [],
}
