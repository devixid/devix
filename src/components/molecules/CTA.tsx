import { Heading } from "@/components/atoms";
import { SlideUp } from "@/components/animations/SlideUp";
import { FadeIn } from "@/components/animations/FadeIn";

export default function CTA() {
  return (
    <section
      id="cta"
      className="relative w-full bg-black-1 text-white py-24 md:py-32 scroll-mt-24 overflow-hidden"
    >
      {/* Rotating badge */}
      <div className="absolute top-8 right-8 md:top-12 md:right-12 pointer-events-none">
        <div className="animate-spin-slow w-24 h-24 md:w-28 md:h-28 relative">
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <defs>
              <path
                id="circlePath"
                d="M 60, 60 m -45, 0 a 45,45 0 1,1 90,0 a 45,45 0 1,1 -90,0"
              />
            </defs>
            <text className="fill-zinc-500 text-[11px] uppercase tracking-[0.25em]">
              <textPath href="#circlePath">
                Available for projects · Available for projects ·{" "}
              </textPath>
            </text>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-accent" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 lg:px-10 flex flex-col items-center text-center">
        <SlideUp yOffset={30} duration={0.9}>
          <Heading.h2 className="text-white font-extralight text-4xl md:text-5xl lg:text-7xl mb-6">
            Ready to work with us?
          </Heading.h2>
        </SlideUp>

        <SlideUp
          yOffset={20}
          duration={0.8}
          delay={0.15}
          className="text-zinc-400 text-base md:text-lg mb-12 max-w-md"
        >
          Let's turn your vision into a stunning digital reality.
        </SlideUp>

        <FadeIn delay={0.3} duration={0.6}>
          <a
            href="#contact"
            className="inline-flex items-center border border-white/30 text-white px-10 py-4 text-sm font-medium uppercase tracking-[0.15em] hover:bg-white hover:text-black-1 transition-all duration-400"
          >
            Contact us
          </a>
        </FadeIn>
      </div>
    </section>
  );
}
