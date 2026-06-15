import Link from "next/link";
import { Heading } from "@/components";
import { SlideUp } from "@/components/animations/SlideUp";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="not-found-page grain-overlay relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden pt-[72px]">
      {/* Decorative watermark */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
        aria-hidden="true"
      >
        <span className="font-display text-[30vw] leading-none font-bold tracking-tighter text-black/[0.03] md:text-[20vw]">
          404
        </span>
      </div>

      <div className="relative z-10 mx-auto mt-10 flex w-full max-w-2xl flex-col items-center px-6 text-center md:mt-0 lg:px-10">
        {/* Eyebrow */}
        <SlideUp
          yOffset={12}
          duration={0.7}
          delay={0.1}
          className="mb-6 text-[11px] font-medium tracking-[0.3em] text-zinc-400 uppercase md:mb-8 md:text-[13px]"
        >
          Error 404
        </SlideUp>

        {/* Heading */}
        <SlideUp
          yOffset={40}
          duration={0.9}
          delay={0.3}
        >
          <Heading.h1 className="max-w-4xl font-extralight">
            Page Not Found
          </Heading.h1>
        </SlideUp>

        {/* Subheading + CTA */}
        <SlideUp
          yOffset={30}
          duration={0.8}
          delay={0.5}
          className="mt-6 flex w-full flex-col items-center gap-y-10 md:mt-8"
        >
          <p className="max-w-md text-base leading-relaxed text-zinc-500 md:text-lg">
            The page you are looking for might have been removed, had its name
            changed, or is temporarily unavailable.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6">
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

            <Link
              href="/projects"
              className="group text-black-1 hover:text-accent inline-flex items-center gap-x-2 text-sm font-medium transition-colors duration-300"
            >
              <span className="relative">
                View our portfolio
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
