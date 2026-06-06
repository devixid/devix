"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import Link from "next/link";
import { Heading } from "@/components";
import { SlideUp } from "@/components/animations/SlideUp";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service in production
    console.error(error);
  }, [error]);

  return (
    <div className="not-found-page grain-overlay relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden pt-[72px]">
      {/* Decorative watermark */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
        aria-hidden="true"
      >
        <span className="font-display text-[25vw] leading-none font-bold tracking-tighter text-black/[0.03] md:text-[15vw]">
          500
        </span>
      </div>

      <div className="relative z-10 mx-auto mt-10 flex w-full max-w-2xl flex-col items-center px-6 text-center md:mt-0 lg:px-10">
        <SlideUp
          yOffset={12}
          duration={0.7}
          delay={0.1}
          className="mb-6 text-[11px] font-medium tracking-[0.3em] text-zinc-400 uppercase md:mb-8 md:text-[13px]"
        >
          Server Error
        </SlideUp>

        <SlideUp
          yOffset={40}
          duration={0.9}
          delay={0.3}
        >
          <Heading.h1 className="max-w-4xl font-extralight">
            Something went wrong
          </Heading.h1>
        </SlideUp>

        <SlideUp
          yOffset={30}
          duration={0.8}
          delay={0.5}
          className="mt-6 flex w-full flex-col items-center gap-y-10 md:mt-8"
        >
          <p className="max-w-md text-base leading-relaxed text-zinc-500 md:text-lg">
            We encountered an unexpected error while processing your request.
            Our team has been notified.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <button
              onClick={() => reset()}
              className="group text-black-1 hover:text-accent inline-flex items-center gap-x-2 text-sm font-medium transition-colors duration-300"
            >
              <span className="relative">
                Try again
                <span className="bg-accent absolute bottom-0 left-0 h-[1px] w-full origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
              </span>
              <span className="text-lg">↺</span>
            </button>

            <Link
              href="/"
              className="group text-black-1 hover:text-accent inline-flex items-center gap-x-2 text-sm font-medium transition-colors duration-300"
            >
              <span className="relative">
                Return to homepage
                <span className="bg-accent absolute bottom-0 left-0 h-[1px] w-full origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
              </span>
              <span className="text-lg">→</span>
            </Link>
          </div>
        </SlideUp>
      </div>
    </div>
  );
}
