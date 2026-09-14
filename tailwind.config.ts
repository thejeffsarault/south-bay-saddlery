import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        saddle: {
          50: "#faf6f0",
          100: "#f2e8d9",
          200: "#e4cfb2",
          300: "#d3b083",
          400: "#c1905b",
          500: "#b0763f",
          600: "#965e34",
          700: "#78482d",
          800: "#623c2a",
          900: "#523325",
          950: "#2e1a13",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
