import { Heading, ScrollDownButton } from "@/components";
import { SlideUp } from "@/components/animations/SlideUp";
import { FadeIn } from "@/components/animations/FadeIn";
import { SmoothScrollLink } from "@/components/atoms/SmoothScrollLink";

export function HeroSection() {
  return (
    <section
      id="home"
      className="relative flex min-h-screen scroll-mt-24 flex-col justify-end overflow-hidden pt-[72px] pb-16 md:pb-24"
    >
      {/* Decorative watermark */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
        aria-hidden="true"
      >
        <span className="font-display text-[20vw] leading-none font-bold tracking-tighter text-black/[0.03]">
          DEVIX
        </span>
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-start px-6 lg:px-10">
        {/* Eyebrow */}
        <SlideUp
          yOffset={12}
          duration={0.7}
          delay={0.3}
          className="mb-6 text-[11px] font-medium tracking-[0.3em] text-zinc-400 uppercase md:mb-8 md:text-[13px]"
        >
          Web Agency · Est. 2022
        </SlideUp>

        {/* Heading */}
        <SlideUp
          yOffset={40}
          duration={0.9}
          delay={0.5}
        >
          <Heading.h1 className="max-w-4xl font-extralight">
            Professional website creation services
          </Heading.h1>
        </SlideUp>

        {/* Subheading + CTA row */}
        <SlideUp
          yOffset={30}
          duration={0.8}
          delay={0.7}
          className="mt-8 flex w-full flex-col gap-y-8 md:mt-12 md:flex-row md:items-end md:justify-between"
        >
          <p className="max-w-md text-base leading-relaxed text-zinc-500 md:text-lg">
            We design and build high-performance custom websites to grow your
            business online.
          </p>
          <SmoothScrollLink
            href="#cta"
            className="group text-black-1 hover:text-accent inline-flex items-center gap-x-2 text-sm font-medium transition-colors duration-300"
          >
            <span className="relative">
              Get in touch
              <span className="bg-accent absolute bottom-0 left-0 h-[1px] w-full origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
            </span>
            <span className="text-lg">→</span>
          </SmoothScrollLink>
        </SlideUp>

        {/* Scroll indicator */}
        <FadeIn
          delay={1.5}
          duration={0.8}
          className="mt-16 md:mt-24"
        >
          <ScrollDownButton />
        </FadeIn>
      </div>
    </section>
  );
}
