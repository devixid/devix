import { Heading } from "@/components/atoms";
import { SlideUp } from "@/components/animations/SlideUp";
import { FaQAccordion } from "./FaQAccordion";

const faqs = [
  {
    question: "What services and products do you offer?",
    answer:
      "We offer comprehensive custom web development (company profiles, e-commerce platforms, landing pages) and custom mobile applications tailored to your business needs.",
  },
  {
    question: "How much experience do you have with IT projects?",
    answer:
      "Our team members have worked on various digital products for businesses across Indonesia, delivering highly optimized, secure, and production-ready applications.",
  },
  {
    question: "How long does a typical project take?",
    answer:
      "A standard website project takes between 2 to 4 weeks depending on the complexity of requirements and design iterations.",
  },
  {
    question: "Should I create a mobile or a web app?",
    answer:
      "It depends on your audience. Websites are perfect for discovery and broad reach, while mobile apps are ideal for retaining repeat customers and providing offline capabilities.",
  },
  {
    question: "What technologies do you use in development?",
    answer:
      "We primarily develop websites using Next.js, React, TailwindCSS, and Node.js, and integrate databases using Supabase and Prisma for maximum speed and security.",
  },
  {
    question: "What do I need to prepare before contacting you?",
    answer:
      "Just your business idea and goals! Having your brand guidelines, logo files, and content copy ready will help speed up the process, but we are happy to guide you from scratch.",
  },
];

export default function FaQ() {
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
            <Heading.h2 className="mb-4 font-extralight">
              Frequently asked questions.
            </Heading.h2>
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
