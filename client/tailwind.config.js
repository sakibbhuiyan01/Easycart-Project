export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Manrope", "system-ui", "sans-serif"] },
      colors: {
        ink: "#14181f",
        paper: "#f3f5f8",
        line: "#dde2ea",
        volt: { DEFAULT: "#2447f5", dark: "#1a35c4", soft: "#e6ebff" },
        amber: { signal: "#f5a524" },
      },
    },
  },
  plugins: [],
};
