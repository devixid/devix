"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback } from "react";

export default function TestimonialControls() {
  const handleScroll = useCallback((direction: "left" | "right") => {
    const container = document.getElementById("testimonials-scroll-container");
    if (!container) return;

    const scrollAmount = 400; // Average card width + gap
    const targetScroll =
      direction === "left"
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    });
  }, []);

  return (
    <div className="flex gap-x-3">
      <button
        type="button"
        onClick={() => handleScroll("left")}
        aria-label="Previous testimonials"
        className="hover:border-accent hover:text-accent flex cursor-pointer items-center justify-center border border-zinc-700 bg-transparent p-3 text-zinc-400 transition-colors duration-300"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => handleScroll("right")}
        aria-label="Next testimonials"
        className="hover:border-accent hover:text-accent flex cursor-pointer items-center justify-center border border-zinc-700 bg-transparent p-3 text-zinc-400 transition-colors duration-300"
      >
        <ArrowRight className="h-5 w-5" />
      </button>
    </div>
  );
}
