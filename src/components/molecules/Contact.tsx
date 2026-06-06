import { Suspense } from "react";
import ContactFormLazy from "./ContactFormLazy";
import {
  DEFAULT_SITE_SECTIONS,
  type ContactContent,
} from "@/lib/content-defaults";

export default function Contact({ content }: { content?: ContactContent }) {
  const contact = content ?? DEFAULT_SITE_SECTIONS.CONTACT;
  return (
    <section
      id="contact"
      className="scroll-mt-24 bg-white py-20 text-black md:py-32"
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-20">
          {/* Left Column (Heading) */}
          <div className="flex flex-col justify-between lg:col-span-1">
            <div>
              <p className="mb-4 text-[13px] font-medium tracking-[0.2em] text-zinc-400 uppercase">
                {contact.eyebrow}
              </p>
              <h2 className="font-display text-4xl leading-[1.1] font-extralight tracking-tight md:text-5xl">
                {contact.headline}
              </h2>
            </div>

            <div className="font-body mt-12 space-y-2 text-sm text-zinc-500 lg:mt-0">
              <p>Email: {contact.email}</p>
              <p>Timezone: {contact.timezone}</p>
            </div>
          </div>

          {/* Right Column (Form Panel) */}
          <Suspense
            fallback={
              <div
                className="min-h-[400px] animate-pulse rounded-xl bg-zinc-100 lg:col-span-2"
                aria-hidden
              />
            }
          >
            <ContactFormLazy />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
