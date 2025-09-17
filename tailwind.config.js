/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#1C72B9",
        brandMuted: "#8994A0",
      },
    },
  },
  plugins: [],
}
