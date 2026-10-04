/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#FAF9F6",
        night: {
          DEFAULT: "#14182A",
          soft: "#9B96A8",
          faint: "#6E6A7C",
        },
        lamp: {
          DEFAULT: "#C8862E",
          dark: "#AC7324",
        },
        line: "#E6E2D8",
        ink: "#14182A",
        sub: "#86806F",
        received: {
          DEFAULT: "#3C7A52",
          bg: "#EEF4EF",
        },
        sleeping: {
          DEFAULT: "#AD3B33",
          bg: "#F9EEEC",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-body)", "sans-serif"],
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(4px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.15s ease-out",
      },
    },
  },
  plugins: [],
};
