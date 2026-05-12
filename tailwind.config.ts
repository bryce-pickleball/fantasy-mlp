import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-bricolage)", "system-ui", "sans-serif"],
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      colors: {
        ink: "#0b0d10",
        paper: "#f7f5f0",
        court: "#2f6b3f",
        line: "#e6e2d8",
        accent: "#d44a2a",
      },
    },
  },
  plugins: [],
};

export default config;
