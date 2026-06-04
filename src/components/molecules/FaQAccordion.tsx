"use client";

import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";

const expoOut = [0.16, 1, 0.3, 1] as const;

export interface FaqItem {
  question: string;
  answer: string;
}

function AccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-zinc-200">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between w-full py-6 text-left cursor-pointer group"
      >
        <span className="text-base md:text-lg font-medium text-zinc-900 group-hover:text-accent transition-colors duration-300 pr-8">
          {question}
        </span>
        <m.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.25 }}
          className="text-xl text-zinc-400 flex-shrink-0 leading-none"
        >
          +
        </m.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: expoOut }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-sm text-zinc-500 leading-relaxed max-w-lg">
              {answer}
            </p>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FaQAccordion({ faqs }: { faqs: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="lg:w-2/3">
      {faqs.map((faq, index) => (
        <AccordionItem
          key={index}
          question={faq.question}
          answer={faq.answer}
          isOpen={openIndex === index}
          onToggle={() => setOpenIndex(openIndex === index ? null : index)}
        />
      ))}
    </div>
  );
}
