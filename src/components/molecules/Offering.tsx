import { SlideUp } from "@/components/animations/SlideUp";

import {
  DEFAULT_SERVICE_ITEMS,
  DEFAULT_SITE_SECTIONS,
  type SectionIntroContent,
} from "@/lib/content-defaults";

interface OfferingProps {
  services?: { title: string; description: string }[];
  intro?: SectionIntroContent;
}

export default function Offering({
  services = DEFAULT_SERVICE_ITEMS,
  intro = DEFAULT_SITE_SECTIONS.SERVICES_INTRO,
}: OfferingProps) {
  return (
    <section
      id="services"
      className="bg-black-1 min-h-screen w-full scroll-mt-24 py-20 text-white md:py-32"
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        {/* Asymmetric layout */}
        <div className="flex flex-col lg:flex-row lg:gap-x-20">
          {/* Left — heading (2/3) */}
          <div className="mb-16 lg:mb-0 lg:w-2/3">
            <SlideUp
              yOffset={12}
              duration={0.7}
              className="mb-6 text-[13px] font-medium tracking-[0.2em] text-zinc-500 uppercase"
            >
              {intro.eyebrow}
            </SlideUp>
            <SlideUp
              yOffset={30}
              duration={0.9}
              delay={0.1}
              className="font-display max-w-2xl text-4xl leading-[1.1] font-extralight tracking-tight text-white md:text-5xl lg:text-6xl"
            >
              {intro.headline}
            </SlideUp>
          </div>

          {/* Right — service list (1/3) */}
          <div className="flex flex-col lg:w-1/3">
            {services.map((service, index) => (
              <SlideUp
                key={`${service.title}-${index}`}
                yOffset={20}
                duration={0.7}
                delay={index * 0.12}
                className="group relative border-t border-zinc-700 pt-8 pb-10 last:pb-0"
              >
                {/* Decorative number */}
                <span className="font-display pointer-events-none absolute top-4 right-0 text-6xl leading-none font-bold text-white/[0.08] select-none">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <h3 className="group-hover:text-accent relative z-10 mb-3 text-lg font-medium text-white transition-colors duration-300">
                  <span className="relative">
                    {service.title}
                    <span className="bg-accent absolute bottom-0 left-0 h-[1px] w-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full" />
                  </span>
                </h3>
                <p className="relative z-10 max-w-[280px] text-sm leading-relaxed text-zinc-400">
                  {service.description}
                </p>

                {/* Hover border accent */}
                <span className="bg-accent absolute top-0 left-0 h-[1px] w-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full" />
              </SlideUp>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
