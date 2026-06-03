"use client";

import { ScrollDown, Text } from "@/components/atoms";
import { cn } from "@/utils";
import { scrollToPosition } from "@/helpers";

export default function ScrollDownButton() {
  const handleScrollPosition = () => {
    scrollToPosition({
      targetX: 0,
      targetY: 993,
      smooth: true,
    });
  };

  return (
    <button
      type="button"
      className="relative mx-auto flex cursor-pointer flex-col items-center mix-blend-difference z-50 text-white"
      onClick={handleScrollPosition}
    >
      <Text.span className={cn("text-[14px] font-light")}>
        SCROLL DOWN
      </Text.span>
      <ScrollDown
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        transition={{ duration: 1 }}
        viewport={{ amount: 1, once: true }}
        className="absolute top-10"
      />
    </button>
  );
}
