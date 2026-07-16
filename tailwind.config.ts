import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "rgb(var(--color-background) / <alpha-value>)",
          surface: "rgb(var(--color-background-surface) / <alpha-value>)",
          elevated: "rgb(var(--color-background-elevated) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          hover: "rgb(var(--color-primary-hover) / <alpha-value>)",
          light: "rgb(var(--color-primary-light) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--color-accent) / <alpha-value>)",
          hover: "rgb(var(--color-accent-hover) / <alpha-value>)",
        },
        foreground: {
          DEFAULT: "rgb(var(--color-foreground) / <alpha-value>)",
          muted: "rgb(var(--color-foreground-muted) / <alpha-value>)",
          subtle: "rgb(var(--color-foreground-subtle) / <alpha-value>)",
        },
        success: "rgb(var(--color-success) / <alpha-value>)",
        border: {
          DEFAULT: "rgb(var(--color-border) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-poppins)", "sans-serif"],
      },
      borderRadius: {
        card: "1rem",
      },
      boxShadow: {
        "glow-primary": "0 0 24px 0 rgba(232, 41, 28, 0.35)",
        card: "0 4px 20px rgba(0,0,0,0.4)",
      },
      backgroundImage: {
        "gradient-promo": "linear-gradient(135deg, #E8291C 0%, #FF7A1A 100%)",
      },
    },
  },
  plugins: [],
};

export default config;