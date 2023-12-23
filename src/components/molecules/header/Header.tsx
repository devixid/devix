import { memo } from "react";
import { Heading, Text } from "@/components/atoms";
import { cn } from "@/utils";
import Navbar from "./Navbar";

function Header() {
  let headingAnimationDelay = 0;
  return (
    <header className="fixed left-0 top-0 flex w-full items-center justify-start gap-x-5">
      <Navbar />
      <Heading.h4>
        {"Welcome".split("").map((word, index) => {
          if (index > 0) {
            headingAnimationDelay += 0.1;
          }

          const key = `key-${index}`;

          return (
            <Text.span
              initial={{
                translateY: "115%",
              }}
              animate={{
                translateY: 0,
              }}
              transition={{
                delay: headingAnimationDelay,
              }}
              key={key}
              className={cn("uppercase tracking-wide")}
            >
              {word}
            </Text.span>
          );
        })}
      </Heading.h4>
    </header>
  );
}

export default memo(Header);
