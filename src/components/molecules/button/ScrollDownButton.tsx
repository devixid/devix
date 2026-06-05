"use client";

import { cn } from "@/utils";
import { m } from "framer-motion";

export default function ScrollDownButton() {
  const handleScroll = () => {
    const servicesSection = document.querySelector("#services");
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <m.button
      type="button"
      className="flex cursor-pointer flex-col items-center gap-y-3 text-white mix-blend-difference"
      onClick={handleScroll}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <span
        className={cn(
          "text-[11px] font-medium tracking-[0.25em] text-zinc-400 uppercase",
        )}
      >
        Scroll
      </span>
      <m.span
        className="block w-[1px] bg-zinc-400"
        initial={{ height: 0 }}
        animate={{ height: 48 }}
        transition={{ delay: 1.8, duration: 1, ease: [0.16, 1, 0.3, 1] }}
      />
    </m.button>
  );
}
