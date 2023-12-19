import { cva } from "class-variance-authority";

export const Heading = cva("text-black", {
  variants: {
    type: {
      h1: "text-[56px] leading-[61.6px]",
      h2: "text-5xl leading-[56px]",
      h3: "text-[40px] leading-[44px]",
      h4: "text-[32px] leading-[35.2px]",
      h5: "text-2xl leading-[26.4px]",
      h6: "text-xl leading-[22px]",
    },
  },
  defaultVariants: {
    type: "h1",
  },
});
