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
          DEFAULT: "#0D0D0D",
          surface: "#1A1A1A",
          elevated: "#242424",
        },
        primary: {
          DEFAULT: "#E8291C",
          hover: "#C71F14",
          light: "#FF4438",
        },
        accent: {
          DEFAULT: "#FF7A1A",
          hover: "#E86A0F",
        },
        foreground: {
          DEFAULT: "#FFFFFF",
          muted: "#A3A3A3",
          subtle: "#6B6B6B",
        },
        success: "#22C55E",
        border: {
          DEFAULT: "#2A2A2A",
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
