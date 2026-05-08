/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f1b33",
        muted: "#64748b",
        ai: "#07899a",
        "ai-soft": "#e8fbfd",
        "care-red": "#ef4444",
        "care-amber": "#f59e0b",
        "care-green": "#16a34a"
      },
      boxShadow: {
        soft: "0 16px 40px rgba(15, 27, 51, 0.08)",
        glow: "0 24px 70px rgba(7, 137, 154, 0.18)"
      }
    },
  },
  plugins: [],
};
