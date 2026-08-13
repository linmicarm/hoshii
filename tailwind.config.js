/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        rose: {
          DEFAULT: "#c9a5a0",
          light: "#e3c9c4",
          dark: "#a67f79",
        },
        cream: {
          DEFAULT: "#f7f1ea",
          dark: "#efe6da",
        },
        sage: {
          DEFAULT: "#a3b18a",
          dark: "#7d8c66",
        },
        ink: "#4a3f3a",
      },
      fontFamily: {
        display: ['"Fraunces"', "serif"],
        body: ['"Zen Maru Gothic"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
