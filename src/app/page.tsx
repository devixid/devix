"use client";

import { Heading, Text } from "@/components";
import { cn } from "@/utils";

export default function Page() {
  let headingAnimationDelay = 0;

  return (
    <div
      className={cn("h-screen", "flex flex-col items-center justify-center")}
    >
      <div className={cn("overflow-hidden", "mb-2 pt-1 md:mb-4")}>
        <Heading.h1>
          {"Hello Devix!".split("").map((letter, index) => {
            if (index > 0) {
              headingAnimationDelay += 0.05;
            }

            const loopKey = `key-${index}`;

            return (
              <Text.span
                resetStyle
                initial={{
                  translateY: "115%",
                }}
                animate={{
                  translateY: 0,
                }}
                transition={{
                  delay: headingAnimationDelay,
                }}
                key={loopKey}
                className={cn("inline-block min-w-[10px]")}
              >
                {letter}
              </Text.span>
            );
          })}
        </Heading.h1>
      </div>

      <div className={cn("overflow-hidden", "pt-1")}>
        <Text.span
          className={cn("inline-block")}
          initial={{
            // translateY: "115%",
            opacity: 0,
          }}
          animate={{
            // translateY: 0,
            opacity: 1,
          }}
          transition={{
            delay: 0.8,
          }}
        >
          Lorem ipsum dolor sit amet.
        </Text.span>
      </div>
    </div>
  );
}
