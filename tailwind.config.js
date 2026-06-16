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
          bg: "#0B0C10",
          card: "rgba(31, 40, 51, 0.45)",
          border: "rgba(102, 252, 241, 0.15)",
          hoverBorder: "rgba(102, 252, 241, 0.4)",
          primary: "#66FCF1",
          secondary: "#45A29E",
          purple: "#9b5de5",
          pink: "#f15bb5",
          yellow: "#fee440",
          text: "#C5C6C7",
          light: "#F5F5F7"
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
