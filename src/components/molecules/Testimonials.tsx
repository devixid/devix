import { getVisibleTestimonials } from "@/lib/testimonials";
import TestimonialControls from "./TestimonialControls";
import Image from "next/image";

export default async function Testimonials() {
  const testimonials = await getVisibleTestimonials();

  if (testimonials.length === 0) return null;

  return (
    <section
      id="testimonials"
      className="bg-black-1 scroll-mt-24 py-20 text-white md:py-32"
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        {/* Header section with heading and controls */}
        <div className="mb-16 flex flex-col gap-y-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="mb-4 text-[13px] font-medium tracking-[0.2em] text-zinc-500 uppercase">
              Testimonials
            </p>
            <h2 className="font-display text-4xl leading-[1.1] font-extralight tracking-tight text-white md:text-5xl lg:text-6xl">
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
          className="scrollbar-hide flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-6"
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
                className="flex w-full max-w-[420px] min-w-[280px] flex-shrink-0 snap-start flex-col justify-between border border-zinc-800 bg-zinc-900 p-8 sm:min-w-[380px]"
              >
                <div>
                  {/* Decorative quote mark */}
                  <span className="font-display text-accent/60 mb-4 block text-6xl leading-none font-light select-none">
                    “
                  </span>
                  <p className="font-body text-base leading-relaxed text-zinc-300">
                    {item.content}
                  </p>
                </div>

                <div className="mt-8 flex items-center gap-x-4 border-t border-zinc-800 pt-6">
                  {/* Avatar */}
                  <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-700">
                    {item.avatarUrl ? (
                      <Image
                        src={item.avatarUrl}
                        alt={item.clientName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-xs font-semibold tracking-wider text-zinc-300">
                        {initials}
                      </span>
                    )}
                  </div>

                  {/* Client Info */}
                  <div className="flex flex-col">
                    <span className="font-body text-sm font-medium text-white">
                      {item.clientName}
                    </span>
                    <span className="font-body mt-0.5 text-xs text-zinc-500">
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
