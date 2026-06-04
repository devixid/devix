import { getVisibleTestimonials } from "@/lib/testimonials";
import TestimonialControls from "./TestimonialControls";
import Image from "next/image";

export default async function Testimonials() {
  const testimonials = await getVisibleTestimonials();

  if (testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="bg-black-1 text-white py-20 md:py-32 scroll-mt-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        {/* Header section with heading and controls */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-y-6 mb-16">
          <div className="max-w-xl">
            <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-zinc-500 mb-4">
              Testimonials
            </p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-extralight leading-[1.1] tracking-tight text-white">
              What our clients say.
            </h2>
          </div>
          <div className="flex-shrink-0">
            <TestimonialControls />
          </div>
        </div>

        {/* Snapping horizontal scroll container */}
        <div
          id="testimonials-scroll-container"
          className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-6 scrollbar-hide"
        >
          {testimonials.map((item) => {
            // Get initials for fallback avatar
            const initials = item.clientName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={item.id}
                className="snap-start flex-shrink-0 w-full min-w-[280px] sm:min-w-[380px] max-w-[420px] bg-zinc-900 border border-zinc-800 p-8 flex flex-col justify-between"
              >
                <div>
                  {/* Decorative quote mark */}
                  <span className="font-display text-6xl font-light text-accent/60 select-none block leading-none mb-4">
                    “
                  </span>
                  <p className="font-body text-zinc-300 text-base leading-relaxed">
                    {item.content}
                  </p>
                </div>

                <div className="border-t border-zinc-800 mt-8 pt-6 flex items-center gap-x-4">
                  {/* Avatar */}
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-zinc-700 flex items-center justify-center flex-shrink-0">
                    {item.avatarUrl ? (
                      <Image
                        src={item.avatarUrl}
                        alt={item.clientName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-zinc-300 tracking-wider">
                        {initials}
                      </span>
                    )}
                  </div>

                  {/* Client Info */}
                  <div className="flex flex-col">
                    <span className="font-body font-medium text-white text-sm">
                      {item.clientName}
                    </span>
                    <span className="font-body text-xs text-zinc-500 mt-0.5">
                      {item.clientRole} · {item.company}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
