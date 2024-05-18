import { cva } from "class-variance-authority";

export const Text = cva("", {
  variants: {
    type: {
      paragraph: "",
      span: "",
      link: "text-black underline",
    },
    size: {
      lg: "text-lg leading-[25.2px]",
      normal: "text-base leading-[22.4px]",
      sm: "text-sm leading-[19.6px]",
      xs: "text-xs",
    },
  },
  defaultVariants: {
    type: "paragraph",
    size: "normal",
  },
});
