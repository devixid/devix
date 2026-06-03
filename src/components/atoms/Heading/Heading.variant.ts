import { cva } from "class-variance-authority";

export const Heading = cva("text-black", {
  variants: {
    type: {
      h1: "text-[56px] leading-[61.6px] tracking-tight",
      h2: "text-5xl leading-[56px] tracking-tight",
      h3: "text-[40px] leading-[44px] tracking-tight",
      h4: "text-[32px] leading-[35.2px] tracking-tight",
      h5: "text-2xl leading-[26.4px] tracking-tight",
      h6: "text-xl leading-[22px] tracking-tight",
    },
  },
  defaultVariants: {
    type: "h1",
  },
});
