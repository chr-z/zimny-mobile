/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        luxury: {
          black: "#000000",
          white: "#ffffff",
          gray: "#F5F5F7",
        },
        gold: {
          DEFAULT: "#C9A84C",
          light: "#E8D5A3",
          dark: "#A8882E",
          muted: "rgba(201,168,76,0.15)",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Times New Roman", "serif"],
        editorial: ["Georgia", "Times New Roman", "serif"],
        display: ["PlayfairDisplay", "Georgia", "serif"],
        mono: ["SpaceMono", "monospace"],
      },
      letterSpacing: {
        editorial: "0.35em",
        kicker: "4px",
      },
      borderRadius: {
        glass: "20px",
      },
    },
  },
  plugins: [],
};
