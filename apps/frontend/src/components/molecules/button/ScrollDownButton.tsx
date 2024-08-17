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
      className="relative mx-auto mb-40 flex cursor-pointer flex-col items-center"
      onClick={handleScrollPosition}
    >
      <Text.span className={cn("text-[14px] font-light text-black")}>
        SCROLL DOWN
      </Text.span>

      <div
        className={cn("relative", "flex flex-col", "absolute top-[39.40px]")}
      >
        <div
          className={cn(
            "h-[calc(286px/2)] overflow-hidden",
            "flex items-start",
          )}
        >
          <ScrollDown
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            transition={{ duration: 1 }}
            viewport={{ amount: 1, once: true }}
            lineFill="#000000"
          />
        </div>
        <div
          className={cn("h-[calc(286px/2)] overflow-hidden", "flex items-end")}
        >
          <ScrollDown
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            transition={{ duration: 1 }}
            viewport={{ amount: 1, once: true }}
            lineFill="#ffffff"
          />
        </div>
      </div>
    </button>
  );
}
