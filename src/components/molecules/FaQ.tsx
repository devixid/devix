import { HeadingStatic } from "@/components/atoms/Heading/HeadingStatic";
import { SlideUp } from "@/components/animations/SlideUp";
import { FaQAccordion } from "./FaQAccordion";

import { DEFAULT_FAQ_ITEMS } from "@/lib/content-defaults";

interface FaqProps {
  faqs?: { question: string; answer: string }[];
}

export default function FaQ({ faqs = DEFAULT_FAQ_ITEMS }: FaqProps) {
  return (
    <section className="py-20 md:py-32">
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        <div className="flex flex-col lg:flex-row lg:gap-x-20">
          {/* Left — sticky heading */}
          <SlideUp
            yOffset={20}
            duration={0.8}
            className="mb-12 lg:sticky lg:top-32 lg:mb-0 lg:w-1/3 lg:self-start"
          >
            <p className="mb-4 text-[13px] font-medium tracking-[0.2em] text-zinc-400 uppercase">
              FAQ
            </p>
            <HeadingStatic level="h2" className="mb-4 font-extralight">
              Frequently asked questions.
            </HeadingStatic>
            <p className="text-sm leading-relaxed text-zinc-500">
              Everything you need to know about working with us. Can't find the
              answer you're looking for? Feel free to reach out.
            </p>
          </SlideUp>

          {/* Right — accordion */}
          <FaQAccordion faqs={faqs} />
        </div>
      </div>

      {/* JSON-LD schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          }),
        }}
      />
    </section>
  );
}
