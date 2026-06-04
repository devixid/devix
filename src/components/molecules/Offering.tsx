import { SlideUp } from "@/components/animations/SlideUp";

const services = [
  {
    num: "01",
    title: "Custom Web Development",
    description:
      "High-performance websites designed from scratch to deliver speed, security, and premium aesthetics for your business.",
  },
  {
    num: "02",
    title: "E-Commerce Solutions",
    description:
      "Tailored online shops with seamless checkout flows, secure payment integrations, and easy product management systems.",
  },
  {
    num: "03",
    title: "Landing Page Optimization",
    description:
      "High-converting single-page sites built specifically to drive leads, showcase product launches, and maximize marketing ROI.",
  },
];

export default function Offering() {
  return (
    <section
      id="services"
      className="w-full min-h-screen bg-black-1 text-white py-20 md:py-32 scroll-mt-24"
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        {/* Asymmetric layout */}
        <div className="flex flex-col lg:flex-row lg:gap-x-20">
          {/* Left — heading (2/3) */}
          <div className="lg:w-2/3 mb-16 lg:mb-0">
            <SlideUp
              yOffset={12}
              duration={0.7}
              className="text-[13px] font-medium uppercase tracking-[0.2em] text-zinc-500 mb-6"
            >
              What We Do
            </SlideUp>
            <SlideUp
              yOffset={30}
              duration={0.9}
              delay={0.1}
              className="font-display text-4xl md:text-5xl lg:text-6xl font-extralight leading-[1.1] tracking-tight text-white max-w-2xl"
            >
              We offer website creation tailored to your unique business needs.
            </SlideUp>
          </div>

          {/* Right — service list (1/3) */}
          <div className="lg:w-1/3 flex flex-col">
            {services.map((service, index) => (
              <SlideUp
                key={service.num}
                yOffset={20}
                duration={0.7}
                delay={index * 0.12}
                className="group relative border-t border-zinc-700 pt-8 pb-10 last:pb-0"
              >
                {/* Decorative number */}
                <span className="font-display text-6xl font-bold text-white/[0.08] absolute top-4 right-0 leading-none select-none pointer-events-none">
                  {service.num}
                </span>

                <h3 className="text-lg font-medium text-white mb-3 transition-colors duration-300 group-hover:text-accent relative z-10">
                  <span className="relative">
                    {service.title}
                    <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-accent group-hover:w-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                  </span>
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed relative z-10 max-w-[280px]">
                  {service.description}
                </p>

                {/* Hover border accent */}
                <span className="absolute top-0 left-0 h-[1px] w-0 bg-accent group-hover:w-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
              </SlideUp>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
