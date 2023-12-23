/* eslint-disable global-require */
import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import { nextui } from "@nextui-org/react";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1360px",
      },
    },
    screens: {
      sm: "576px",
      // => @media (min-width: 576px) { ... }
      md: "768px",
      // => @media (min-width: 768px) { ... }
      lg: "1024px",
      // => @media (min-width: 1024px) { ... }
      xl: "1200px",
      // => @media (min-width: 1200px) { ... }
      "2xl": "1400px",
      // => @media (min-width: 1400px) { ... }
    },
    extend: {
      colors: {
        ...defaultTheme.colors,
        black: {
          DEFAULT: "#18181B",
          1: "#18181B",
          2: "#27272A",
        },
        white: "#F8FAFC",
        gray: {
          DEFAULT: "333333",
          1: "#4F4F4F",
          2: "#828282",
          3: "#BDBDBD",
          4: "#E0E0E0",
        },
        state: {
          info: "#2F80ED",
          success: "#27AE60",
          warning: "#E2B93B",
          error: "#EB5757",
        },
      },
    },
  },
  darkMode: "class",
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/line-clamp"),
    nextui(),
  ],
};
export default config;
