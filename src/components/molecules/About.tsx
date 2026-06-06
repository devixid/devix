import { HeadingStatic } from "@/components/atoms/Heading/HeadingStatic";
import { SlideUp } from "@/components/animations/SlideUp";
import { SmoothScrollLink } from "@/components/atoms/SmoothScrollLink";

import {
  DEFAULT_SITE_SECTIONS,
  type AboutContent,
} from "@/lib/content-defaults";

export default function About({ content }: { content?: AboutContent }) {
  const about = content ?? DEFAULT_SITE_SECTIONS.ABOUT;
  const stats = about.stats;
  const marqueeItems = [...about.techStack, ...about.techStack];
  return (
    <section
      id="about"
      className="scroll-mt-24 py-20 md:py-32"
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        {/* Header row */}
        <div className="mb-20 flex flex-col md:mb-28 md:flex-row md:gap-x-20">
          <SlideUp
            yOffset={20}
            duration={0.8}
            className="mb-8 md:mb-0 md:w-1/3"
          >
            <p className="mb-4 text-[13px] font-medium tracking-[0.2em] text-zinc-400 uppercase">
              {about.eyebrow}
            </p>
            <HeadingStatic
              level="h2"
              className="font-extralight"
            >
              {about.headline}
            </HeadingStatic>
          </SlideUp>

          <SlideUp
            yOffset={20}
            duration={0.8}
            delay={0.1}
            className="flex flex-col gap-y-8 md:w-2/3"
          >
            <p className="max-w-xl text-base leading-relaxed text-zinc-500 md:text-lg">
              {about.body}
            </p>
            <SmoothScrollLink
              href="#services"
              className="group text-accent hover:text-accent-light inline-flex items-center gap-x-2 text-sm font-medium transition-colors duration-300"
            >
              <span className="relative">
                {about.ctaLabel}
                <span className="bg-accent absolute bottom-0 left-0 h-[1px] w-full origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
              </span>
              <span className="text-lg">→</span>
            </SmoothScrollLink>
          </SlideUp>
        </div>

        {/* Stats */}
        <div className="mb-20 flex flex-col items-start border-t border-zinc-200 pt-16 sm:flex-row sm:items-center md:mb-28">
          {stats.map((stat, idx) => (
            <SlideUp
              key={stat.label}
              yOffset={20}
              duration={0.7}
              delay={idx * 0.1}
              className="flex items-center"
            >
              <div className="flex flex-col py-4 sm:px-8 sm:py-0 first:sm:pl-0 last:sm:pr-0">
                <span className="font-display text-5xl font-extralight tracking-tight text-black md:text-6xl lg:text-7xl">
                  {stat.value}
                </span>
                <span className="mt-3 text-[11px] font-medium tracking-[0.2em] text-zinc-400 uppercase">
                  {stat.label}
                </span>
              </div>
              {/* Vertical divider (not after last item) */}
              {idx < stats.length - 1 && (
                <div className="ml-auto hidden h-16 w-[1px] bg-zinc-200 sm:block" />
              )}
            </SlideUp>
          ))}
        </div>

        {/* Tech Stack Marquee */}
        <div className="overflow-hidden border-t border-b border-zinc-100 py-5">
          <div className="animate-marquee flex whitespace-nowrap">
            {marqueeItems.map((tech, idx) => (
              <span
                key={`${tech}-${idx}`}
                className="mx-4 text-[13px] font-medium tracking-[0.15em] text-zinc-400 uppercase"
              >
                {tech}
                <span className="ml-8 text-zinc-300">·</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
