"use client";

import { motion } from "framer-motion";
import { memo, useState } from "react";
import { Heading, Text } from "@/components/atoms";
import { cn } from "@/utils";
import { useWindow } from "@/hooks";
import Navbar from "./Navbar";

function Header() {
  const { scrollPosition } = useWindow();
  let headingAnimationDelay = 0;
  const [isNavbarOpen, setIsNavbarOpen] = useState<boolean>(false);

  return (
    <motion.header
      className={cn(
        "fixed inset-x-0 top-0 z-50 flex w-full items-start justify-start gap-x-5",
      )}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ delay: 1 }}
      viewport={{ once: true, amount: 1 }}
    >
      <Navbar
        isNavbarOpen={isNavbarOpen}
        setIsNavbarOpen={setIsNavbarOpen}
      />
      <Heading.h4
        className={cn(
          `${scrollPosition.y >= 917 && scrollPosition.y <= 1620 ? "text-white" : "text-black-1"}`,
          "z-10 mt-5 hidden uppercase tracking-normal md:flex",
        )}
      >
        {"Welcome".split("").map((word, index) => {
          if (index > 0) {
            headingAnimationDelay += 0.1;
          }

          const key = `key-${index}`;

          return (
            <Text.span
              initial={{
                translateY: 20,
                opacity: 0,
              }}
              animate={{
                translateY: 0,
                opacity: 1,
              }}
              transition={{
                delay: headingAnimationDelay,
              }}
              key={key}
            >
              {word}
            </Text.span>
          );
        })}
      </Heading.h4>
    </motion.header>
  );
}

export default memo(Header);
