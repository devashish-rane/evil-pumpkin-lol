import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./**/*.{ts,tsx}"] ,
  theme: {
    extend: {
      colors: {
        saffron: {
          50: "#fff8e5",
          100: "#ffefc7",
          200: "#ffe29a",
          300: "#ffd36b",
          400: "#f7c34d",
          500: "#e7a72c"
        },
        charcoal: {
          700: "#2c2f33",
          800: "#222427",
          900: "#1a1c1f"
        },
        slateblue: {
          400: "#6c7ff0",
          500: "#4f63e8"
        },
        tealish: {
          400: "#47b4a5",
          500: "#2f9688"
        }
      },
      boxShadow: {
        card: "0 8px 24px rgba(26, 28, 31, 0.08)",
        lift: "0 12px 32px rgba(26, 28, 31, 0.12)"
      },
      borderRadius: {
        xl: "1.25rem"
      }
    }
  },
  plugins: []
} satisfies Config;
