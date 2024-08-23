/** @type {import('tailwindcss').Config} */
import defaultTheme from "tailwindcss/defaultTheme";

export default {
  content: ["./index.html", "./src/**/*.{css,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        archivo: ["Archivo", ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        // heading
        "heading-1": "48px",
        "heading-2": "40px",
        "heading-3": "32px",
        "heading-4": "24px",
        "heading-5": "20px",
        "heading-6": "18px",
        // body
        "body-xs": "12px",
        "body-sm": "14px",
        "body-base": "16px",
        "body-lg": "18px",
      },
      lineHeight: {
        "heading-1": "52.8px",
        "heading-2": "44px",
        "heading-3": "35.2px",
        "heading-4": "26.4px",
        "heading-5": "22px",
        "heading-6": "19.6px",
        "body-xs": "16px",
        "body-sm": "19.6px",
        "body-base": "22.4px",
        "body-lg": "25.2px",
      },
      colors: {
        black: {
          DEFAULT: "#18181B",
          1: "#18181B",
          2: "#27272A",
        },
        white: "#F8FAFC",
        gray: {
          DEFAULT: "#333333",
          1: "#4F4F4F",
          2: "#828282",
          3: "#BDBDBD",
          4: "#E0E0E0",
        },
      },
    },
  },
  plugins: ["prettier-plugin-tailwindcss"],
};
