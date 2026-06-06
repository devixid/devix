import Link from "next/link";
import { HeadingStatic } from "@/components/atoms/Heading/HeadingStatic";
import { SlideUp } from "@/components/animations/SlideUp";
import { FadeIn } from "@/components/animations/FadeIn";
import { SmoothScrollLink } from "@/components/atoms/SmoothScrollLink";
import { DEFAULT_SITE_SECTIONS, type CtaContent } from "@/lib/content-defaults";

export default function CTA({ content }: { content?: CtaContent }) {
  const cta = content ?? DEFAULT_SITE_SECTIONS.CTA;
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
                {cta.badgeText} · {cta.badgeText} ·{" "}
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
          <HeadingStatic
            level="h2"
            className="mb-6 text-4xl font-extralight text-white md:text-5xl lg:text-7xl"
          >
            {cta.headline}
          </HeadingStatic>
        </SlideUp>

        <SlideUp
          yOffset={20}
          duration={0.8}
          delay={0.15}
          className="mb-12 max-w-md text-base text-zinc-400 md:text-lg"
        >
          {cta.subheading}
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
              {cta.ctaPrimary}
            </Link>
            <SmoothScrollLink
              href="#contact"
              className="group inline-flex items-center gap-x-2 text-sm font-medium text-zinc-400 transition-colors duration-300 hover:text-white"
            >
              <span className="relative">
                {cta.ctaSecondary}
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
