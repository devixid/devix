import { Heading, ScrollDownButton } from "@/components";
import { SlideUp } from "@/components/animations/SlideUp";
import { FadeIn } from "@/components/animations/FadeIn";

export function HeroSection() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col justify-end pb-16 md:pb-24 pt-[72px] scroll-mt-24 overflow-hidden"
    >
      {/* Decorative watermark */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        aria-hidden="true"
      >
        <span className="font-display text-[20vw] font-bold text-black/[0.03] leading-none tracking-tighter">
          DEVIX
        </span>
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-6 lg:px-10 flex flex-col items-start">
        {/* Eyebrow */}
        <SlideUp
          yOffset={12}
          duration={0.7}
          delay={0.3}
          className="text-[11px] md:text-[13px] font-medium uppercase tracking-[0.3em] text-zinc-400 mb-6 md:mb-8"
        >
          Web Agency · Est. 2022
        </SlideUp>

        {/* Heading */}
        <SlideUp yOffset={40} duration={0.9} delay={0.5}>
          <Heading.h1 className="font-extralight max-w-4xl">
            Professional website creation services
          </Heading.h1>
        </SlideUp>

        {/* Subheading + CTA row */}
        <SlideUp
          yOffset={30}
          duration={0.8}
          delay={0.7}
          className="mt-8 md:mt-12 flex flex-col md:flex-row md:items-end md:justify-between w-full gap-y-8"
        >
          <p className="text-base md:text-lg text-zinc-500 max-w-md leading-relaxed">
            We design and build high-performance custom websites to grow your business online.
          </p>
          <a
            href="#cta"
            className="group inline-flex items-center gap-x-2 text-sm font-medium text-black-1 hover:text-accent transition-colors duration-300"
          >
            <span className="relative">
              Get in touch
              <span className="absolute bottom-0 left-0 h-[1px] w-full bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] origin-left" />
            </span>
            <span className="text-lg">→</span>
          </a>
        </SlideUp>

        {/* Scroll indicator */}
        <FadeIn delay={1.5} duration={0.8} className="mt-16 md:mt-24">
          <ScrollDownButton />
        </FadeIn>
      </div>
    </section>
  );
}
