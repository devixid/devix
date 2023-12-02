import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      screens: {
        ...defaultTheme.screens,
        sm: "425px",
        lg: "1024px",
        xl: "1440px"
      },

      fontFamily: {
        ...defaultTheme.fontFamily,
        sans: ["Archivo", ...defaultTheme.fontFamily.sans]
      },

      colors: {
        ...defaultTheme.colors,
        black: {
          DEFAULT: "#18181b",
          1: "#18181b",
          2: "#27272a"
        },
        gray: {
          DEFAULT: "#333333",
          1: "#4F4F4F",
          2: "#828282",
          3: "#BDBDBD",
          4: "#E0E0E0"
        },
        state: {
          info: "#2F80ED",
          error: "#27AE60",
          warning: "#E2B93B",
          success: "#EB5757"
        }
      },

      fontSize: {
        "heading-1": [
          "56px",
          {
            lineHeight: "61px",
            fontWeight: 300
          }
        ],
        "heading-2": [
          "48px",
          {
            lineHeight: "56px",
            fontWeight: 300
          }
        ],
        "heading-3": [
          "40px",
          {
            lineHeight: "44px",
            fontWeight: 300
          }
        ],
        "heading-4": [
          "32px",
          {
            lineHeight: "35.2px",
            fontWeight: 300
          }
        ],
        "heading-5": [
          "24px",
          {
            lineHeight: "26.4px",
            fontWeight: 300
          }
        ],
        "heading-6": [
          "20px",
          {
            lineHeight: "22px",
            fontWeight: 300
          }
        ],
        large: [
          "18px",
          {
            lineHeight: "25.2px"
          }
        ],
        body: [
          "16px",
          {
            lineHeight: "22.4px"
          }
        ],
        small: [
          "14px",
          {
            lineHeight: "19.6px"
          }
        ],
        "very-small": [
          "12px",
          {
            lineHeight: "16px"
          }
        ],
        ...defaultTheme.fontSize
      }
    }
  },
  plugins: []
};

export default config;
