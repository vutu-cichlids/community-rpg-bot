import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "media",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        gold: { DEFAULT: "#a9781f", dark: "#d6ab45" },
        teal: { DEFAULT: "#2e6b63", dark: "#62b6ab" },
        danger: { DEFAULT: "#9a3a34", dark: "#d68079" },
        success: { DEFAULT: "#3f6b37", dark: "#83c073" },
      },
      fontFamily: {
        display: ["var(--font-cinzel)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
