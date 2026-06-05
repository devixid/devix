import Link from "next/link";
import { Heading } from "@/components/atoms";
import { SlideUp } from "@/components/animations/SlideUp";
import { FadeIn } from "@/components/animations/FadeIn";
import { SmoothScrollLink } from "@/components/atoms/SmoothScrollLink";

export default function CTA() {
  return (
    <section
      id="cta"
      className="bg-black-1 relative w-full scroll-mt-24 overflow-hidden py-24 text-white md:py-32"
    >
      {/* Rotating badge */}
      <div className="pointer-events-none absolute top-8 right-8 md:top-12 md:right-12">
        <div className="animate-spin-slow relative h-24 w-24 md:h-28 md:w-28">
          <svg
            viewBox="0 0 120 120"
            className="h-full w-full"
          >
            <defs>
              <path
                id="circlePath"
                d="M 60, 60 m -45, 0 a 45,45 0 1,1 90,0 a 45,45 0 1,1 -90,0"
              />
            </defs>
            <text className="fill-zinc-500 text-[11px] tracking-[0.25em] uppercase">
              <textPath href="#circlePath">
                Available for projects · Available for projects ·{" "}
              </textPath>
            </text>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-accent h-2 w-2 rounded-full" />
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col items-center px-6 text-center lg:px-10">
        <SlideUp
          yOffset={30}
          duration={0.9}
        >
          <Heading.h2 className="mb-6 text-4xl font-extralight text-white md:text-5xl lg:text-7xl">
            Ready to work with us?
          </Heading.h2>
        </SlideUp>

        <SlideUp
          yOffset={20}
          duration={0.8}
          delay={0.15}
          className="mb-12 max-w-md text-base text-zinc-400 md:text-lg"
        >
          Let's turn your vision into a stunning digital reality.
        </SlideUp>

        <FadeIn
          delay={0.3}
          duration={0.6}
        >
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link
              href="/estimator"
              className="hover:text-black-1 inline-flex items-center border border-white/30 px-10 py-4 text-sm font-medium tracking-[0.15em] text-white uppercase transition-all duration-400 hover:bg-white"
            >
              Estimate Project
            </Link>
            <SmoothScrollLink
              href="#contact"
              className="group inline-flex items-center gap-x-2 text-sm font-medium text-zinc-400 transition-colors duration-300 hover:text-white"
            >
              <span className="relative">
                Contact us
                <span className="bg-accent absolute bottom-0 left-0 h-[1px] w-full origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
              </span>
              <span className="text-lg">→</span>
            </SmoothScrollLink>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

