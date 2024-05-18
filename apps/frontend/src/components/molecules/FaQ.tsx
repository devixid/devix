"use client";

import { Heading } from "@/components/atoms";
import { Accordion, AccordionItem } from "@nextui-org/react";
import { motion } from "framer-motion";
import { HiPlus } from "react-icons/hi2";

export default function FaQ() {
  const defaultContent =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

  return (
    <motion.div className="mb-10 size-full max-w-5xl px-10 md:px-0">
      <Heading.h2 className="mb-5 text-left text-[40px] font-light md:text-center md:text-5xl">
        Frequenly asked question.
      </Heading.h2>
      <Accordion className="w-full">
        <AccordionItem
          indicator={<HiPlus className="h-10" />}
          key="What services and products do you offer?"
          aria-label="How much experience do you have with IT projects?"
          title="What services and products do you offer?"
        >
          {defaultContent}
        </AccordionItem>
        <AccordionItem
          indicator={<HiPlus className="h-10" />}
          key="How much experience do you have with IT projects?"
          aria-label="How much experience do you have with IT projects?"
          title="How much experience do you have with IT projects?"
        >
          {defaultContent}
        </AccordionItem>
        <AccordionItem
          indicator={<HiPlus className="h-10" />}
          key="How long does the project take?"
          aria-label="How long does the project take?"
          title="How long does the project take?"
        >
          {defaultContent}
        </AccordionItem>
        <AccordionItem
          indicator={<HiPlus className="h-10" />}
          key="Should I create a mobile or a web app?"
          aria-label="Should I create a mobile or a web app?"
          title="Should I create a mobile or a web app?"
        >
          {defaultContent}
        </AccordionItem>
        <AccordionItem
          indicator={<HiPlus className="h-10" />}
          key="What technologies do we use in software development?"
          aria-label="What technologies do we use in software development?"
          title="What technologies do we use in software development?"
        >
          {defaultContent}
        </AccordionItem>
        <AccordionItem
          indicator={<HiPlus className="h-10" />}
          key="What do I need to know before contacting you?"
          aria-label="What do I need to know before contacting you?"
          title="What do I need to know before contacting you?"
        >
          {defaultContent}
        </AccordionItem>
      </Accordion>
    </motion.div>
  );
}
