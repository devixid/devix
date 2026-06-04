import { cva } from "class-variance-authority";

export const Heading = cva("text-black font-display", {
  variants: {
    type: {
      h1: "text-5xl md:text-7xl lg:text-8xl leading-[1.05] tracking-tight",
      h2: "text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tight",
      h3: "text-3xl md:text-4xl leading-[1.15] tracking-tight",
      h4: "text-2xl md:text-[32px] leading-[1.2] tracking-tight",
      h5: "text-xl md:text-2xl leading-[1.2] tracking-tight",
      h6: "text-lg md:text-xl leading-[1.25] tracking-tight",
    },
  },
  defaultVariants: {
    type: "h1",
  },
});
