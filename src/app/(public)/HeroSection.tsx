import Link from "next/link";
import { Heading, ScrollDownButton } from "@/components";
import { SlideUp } from "@/components/animations/SlideUp";
import { FadeIn } from "@/components/animations/FadeIn";
import { SmoothScrollLink } from "@/components/atoms/SmoothScrollLink";
import {
  DEFAULT_SITE_SECTIONS,
  type HeroContent,
} from "@/lib/content-defaults";

export function HeroSection({ content }: { content?: HeroContent }) {
  const hero = content ?? DEFAULT_SITE_SECTIONS.HERO;
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
          {hero.watermark}
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
          {hero.eyebrow}
        </SlideUp>

        {/* Heading */}
        <SlideUp
          yOffset={40}
          duration={0.9}
          delay={0.5}
        >
          <Heading.h1 className="max-w-4xl font-extralight">
            {hero.headline}
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
            {hero.subheading}
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <Link
              href="/estimator"
              className="border-black-1/20 hover:bg-black-1 inline-flex items-center border px-8 py-3 text-sm font-medium tracking-[0.15em] text-black uppercase transition-all duration-300 hover:text-white"
            >
              {hero.ctaPrimary}
            </Link>
            <SmoothScrollLink
              href="#cta"
              className="group hover:text-black-1 inline-flex items-center gap-x-2 text-sm font-medium text-zinc-500 transition-colors duration-300"
            >
              <span className="relative">
                {hero.ctaSecondary}
                <span className="bg-accent absolute bottom-0 left-0 h-[1px] w-full origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
              </span>
              <span className="text-lg">→</span>
            </SmoothScrollLink>
          </div>
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
