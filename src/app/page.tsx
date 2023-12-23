import { Heading, Text } from "@/components";
import { cn } from "@/utils";
import { Button } from "@nextui-org/react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Devixid - Home",
  description: "Profesional website creation services",
  keywords: ["devix", "devixid", "devix_id", "home"],
};

export default function Page() {
  let headingAnimationDelay = 0;
  const headingText = "Profesional website creation services";

  return (
    <section
      className={cn(
        "h-screen",
        "mx-auto mt-5 flex max-w-5xl flex-col items-center justify-center",
      )}
    >
      <div className={cn("overflow-hidden", "mb-2 pt-1 md:mb-4")}>
        <Heading.h1 className="line-clamp-2 max-w-[630px] text-center text-7xl font-medium">
          {headingText.split("").map((letter, index) => {
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
          We provide cheap website creation services with good designs
        </Text.span>
      </div>
      <div className={cn("mb-20 mt-10")}>
        <Button
          variant="flat"
          type="button"
          className={cn("bg-black-1 text-white")}
        >
          Achieve success with us!
        </Button>
      </div>
      <div>
        <Text.span className={cn("font-light uppercase text-black")}>
          scroll down
        </Text.span>
      </div>
    </section>
  );
}
