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
        ink: "#08090a", // primary dark section background
        "ink-soft": "#111214", // slightly lifted dark surface
        paper: "#fbfbfd", // primary light section background
        mist: "#f5f5f7", // light text on dark backgrounds
        graphite: "#1d1d1f", // dark text on light backgrounds
        fog: "#86868b", // muted secondary text, works on light + dark
        line: "rgba(255,255,255,0.08)", // hairline borders on dark
        "line-soft": "rgba(0,0,0,0.08)", // hairline borders on light
        accent: {
          from: "#5EA8FF",
          via: "#7FDBB6",
          to: "#FFD98E",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      backgroundImage: {
        "accent-gradient": "linear-gradient(120deg, #5EA8FF 0%, #7FDBB6 55%, #FFD98E 100%)",
        "hero-glow": "radial-gradient(ellipse 80% 60% at 50% 20%, rgba(94,168,255,0.18), transparent 60%)",
        "terrain": "linear-gradient(160deg, #0c1614 0%, #10201d 35%, #142a26 60%, #0c1614 100%)",
      },
      boxShadow: {
        glass: "0 8px 40px rgba(0,0,0,0.35)",
        "glass-light": "0 8px 30px rgba(0,0,0,0.08)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.8" },
          "80%": { transform: "scale(1.8)", opacity: "0" },
          "100%": { transform: "scale(1.8)", opacity: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.9s cubic-bezier(0.22,1,0.36,1) both",
        "pulse-ring": "pulse-ring 2.4s cubic-bezier(0.4,0,0.6,1) infinite",
      },
      maxWidth: {
        content: "1200px",
      },
    },
  },
  plugins: [],
};

export default config;
