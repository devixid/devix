"use client";

import { Heading } from "@/components/atoms";
import {
  Accordion,
  AccordionItem,
  AccordionHeading,
  AccordionTrigger,
  AccordionPanel,
  AccordionIndicator,
  AccordionBody,
} from "@heroui/react";
import { motion } from "framer-motion";

export default function FaQ() {
  const faqs = [
    {
      question: "What services and products do you offer?",
      answer: "We offer comprehensive custom web development (company profiles, e-commerce platforms, landing pages) and custom mobile applications tailored to your business needs."
    },
    {
      question: "How much experience do you have with IT projects?",
      answer: "Our team members have worked on various digital products for businesses across Indonesia, delivering highly optimized, secure, and production-ready applications."
    },
    {
      question: "How long does a typical project take?",
      answer: "A standard website project takes between 2 to 4 weeks depending on the complexity of requirements and design iterations."
    },
    {
      question: "Should I create a mobile or a web app?",
      answer: "It depends on your audience. Websites are perfect for discovery and broad reach, while mobile apps are ideal for retaining repeat customers and providing offline capabilities."
    },
    {
      question: "What technologies do you use in development?",
      answer: "We primarily develop websites using Next.js, React, TailwindCSS, and Node.js, and integrate databases using Supabase and Prisma for maximum speed and security."
    },
    {
      question: "What do I need to prepare before contacting you?",
      answer: "Just your business idea and goals! Having your brand guidelines, logo files, and content copy ready will help speed up the process, but we are happy to guide you from scratch."
    }
  ];

  return (
    <motion.div className="mb-10 size-full max-w-5xl px-10 md:px-0">
      <Heading.h2 className="mb-5 text-left text-[40px] font-light md:text-center md:text-5xl">
        Frequently asked questions.
      </Heading.h2>
      <Accordion className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem
            key={`faq-${index}`}
            id={`faq-${index}`}
            className="border-b border-zinc-200 py-2"
          >
            <AccordionHeading>
              <AccordionTrigger className="flex justify-between items-center w-full py-4 text-left font-medium text-zinc-950 text-base md:text-lg focus:outline-none cursor-pointer group">
                <span className="group-hover:text-zinc-700 transition-colors">{faq.question}</span>
                <AccordionIndicator className="w-5 h-5 text-zinc-500 transition-transform duration-300 data-[expanded=true]:rotate-180" />
              </AccordionTrigger>
            </AccordionHeading>
            <AccordionPanel className="pb-4">
              <AccordionBody className="text-zinc-600 text-sm leading-relaxed">
                {faq.answer}
              </AccordionBody>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map((faq) => ({
              "@type": "Question",
              "name": faq.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer,
              },
            })),
          }),
        }}
      />
    </motion.div>
  );
}
