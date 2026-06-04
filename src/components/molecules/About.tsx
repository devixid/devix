import { Heading } from "@/components/atoms";
import { SlideUp } from "@/components/animations/SlideUp";

const stats = [
  { value: "3+", label: "Years Experience" },
  { value: "4", label: "Expert Members" },
  { value: "100%", label: "Custom Solutions" },
];

const techStack = [
  "Next.js",
  "Tailwind CSS",
  "Framer Motion",
  "TypeScript",
  "Supabase",
  "Prisma",
  "React",
  "PostgreSQL",
];

// Duplicate for seamless loop
const marqueeItems = [...techStack, ...techStack];

export default function About() {
  return (
    <section id="about" className="py-20 md:py-32 scroll-mt-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        {/* Header row */}
        <div className="flex flex-col md:flex-row md:gap-x-20 mb-20 md:mb-28">
          <SlideUp yOffset={20} duration={0.8} className="md:w-1/3 mb-8 md:mb-0">
            <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-zinc-400 mb-4">
              About Us
            </p>
            <Heading.h2 className="font-extralight">Who we are.</Heading.h2>
          </SlideUp>

          <SlideUp
            yOffset={20}
            duration={0.8}
            delay={0.1}
            className="md:w-2/3 flex flex-col gap-y-8"
          >
            <p className="text-base md:text-lg text-zinc-500 leading-relaxed max-w-xl">
              We are a dedicated team of web developers and designers committed to
              building top-tier digital solutions for your business. From sleek landing
              pages to full-scale e-commerce platforms, we merge premium aesthetics with
              modern technology to deliver fast, SEO-friendly, and high-converting
              websites.
            </p>
            <a
              href="#services"
              className="group inline-flex items-center gap-x-2 text-sm font-medium text-accent hover:text-accent-light transition-colors duration-300"
            >
              <span className="relative">
                See our services
                <span className="absolute bottom-0 left-0 h-[1px] w-full bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] origin-left" />
              </span>
              <span className="text-lg">→</span>
            </a>
          </SlideUp>
        </div>

        {/* Stats */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center border-t border-zinc-200 pt-16 mb-20 md:mb-28">
          {stats.map((stat, idx) => (
            <SlideUp
              key={stat.label}
              yOffset={20}
              duration={0.7}
              delay={idx * 0.1}
              className="flex items-center"
            >
              <div className="flex flex-col py-4 sm:py-0 sm:px-8 first:sm:pl-0 last:sm:pr-0">
                <span className="font-display text-5xl md:text-6xl lg:text-7xl font-extralight tracking-tight text-black">
                  {stat.value}
                </span>
                <span className="mt-3 text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-400">
                  {stat.label}
                </span>
              </div>
              {/* Vertical divider (not after last item) */}
              {idx < stats.length - 1 && (
                <div className="hidden sm:block w-[1px] h-16 bg-zinc-200 ml-auto" />
              )}
            </SlideUp>
          ))}
        </div>

        {/* Tech Stack Marquee */}
        <div className="overflow-hidden border-t border-b border-zinc-100 py-5">
          <div className="flex animate-marquee whitespace-nowrap">
            {marqueeItems.map((tech, idx) => (
              <span
                key={`${tech}-${idx}`}
                className="mx-4 text-[13px] font-medium uppercase tracking-[0.15em] text-zinc-400"
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
