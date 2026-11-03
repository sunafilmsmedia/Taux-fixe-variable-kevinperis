import type { Config } from "tailwindcss";

// Palette reprise de KP_Palette-couleurs.pdf (fournie par Kevin) :
// taupe #B3AC9C, bleu #75909B, blanc #E5E3DC, vert #00332C, noir #110E0C.
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: "#00332C", // vert profond de la palette KP
        "primary-deep": "#001F1A",
        "primary-light": "#0F4A3F",
        accent: "#75909B", // bleu de la palette KP
        taupe: "#B3AC9C",
        ink: "#110E0C",
        muted: "#6E6A60",
        line: "#DEDAD0",
        tint: "#EDEBE4", // dérivé plus clair du blanc E5E3DC pour le fond de page
        card: "#FFFFFF",
        danger: "#B3473A",
        positive: "#2F7D5C",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        serif: ["Fraunces", "Georgia", "Times New Roman", "serif"],
        caps: ["Inter", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 18px 50px -12px rgba(17,14,12,0.25)",
        glow: "0 0 0 1px rgba(0,51,44,0.12), 0 10px 30px -8px rgba(0,51,44,0.25)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.4s ease both",
        pulseSoft: "pulseSoft 1.4s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
