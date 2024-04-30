import {
  About,
  FaQ,
  Heading,
  Offering,
  ScrollDownButton,
  Text,
  OurTeams,
} from "@/components";
import CTA from "@/components/molecules/CTA";
import { headingText, headingText2, subHeadingText } from "@/constants";
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

  return (
    <section
      className={cn("mx-auto mt-44 flex flex-col items-center justify-center")}
    >
      <div
        className={cn(
          "flex h-full flex-col items-center justify-center self-center",
          "mb-2 pt-1",
        )}
      >
        <Heading.h1 className="w-full px-10 text-center text-5xl font-light md:text-9xl">
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
                  opacity: 0,
                }}
                animate={{
                  translateY: 0,
                  opacity: 1,
                }}
                transition={{
                  delay: headingAnimationDelay,
                }}
                key={loopKey}
                className={cn("min-w-unit-5 md:inline-block")}
              >
                {letter}
              </Text.span>
            );
          })}
        </Heading.h1>
        <Heading.h1 className="w-full px-10 text-center text-5xl font-light md:text-9xl">
          {headingText2.split("").map((letter, index) => {
            if (index > 0) {
              headingAnimationDelay += 0.05;
            }

            const loopKey = `key-${index}`;

            return (
              <Text.span
                resetStyle
                initial={{
                  translateY: "115%",
                  opacity: 0,
                }}
                animate={{
                  translateY: 0,
                  opacity: 1,
                }}
                transition={{
                  delay: headingAnimationDelay,
                }}
                key={loopKey}
                className={cn("min-w-unit-5 md:inline-block")}
              >
                {letter}
              </Text.span>
            );
          })}
        </Heading.h1>
      </div>
      <div
        className={cn(
          "flex w-full flex-wrap justify-center px-10 text-start md:flex-nowrap",
        )}
      >
        {subHeadingText.map((char, index) => {
          if (index > 0) {
            headingAnimationDelay += 0.1;
          }
          const loopKey = `key-${index}`;
          return (
            <Text.span
              className={cn(
                "min-w-unit-1 mx-1 inline-block text-base md:text-xl",
              )}
              initial={{
                translateY: "115%",
                opacity: 0,
              }}
              animate={{
                translateY: 0,
                opacity: 1,
              }}
              transition={{
                delay: headingAnimationDelay,
              }}
              viewport={{ once: true }}
              key={loopKey}
              resetStyle
            >
              {char}
            </Text.span>
          );
        })}
      </div>
      <div className={cn("mb-36 mt-10")}>
        <Text.span
          resetStyle
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: headingAnimationDelay }}
          viewport={{ once: true, amount: 1 }}
        >
          <Button
            variant="flat"
            type="button"
            className={cn(
              "h-[51px] w-[250px] rounded-[5px] bg-black text-base text-white",
            )}
          >
            Achieve success with us!
          </Button>
        </Text.span>
      </div>
      <ScrollDownButton />
      <Offering />
      <About />
      <OurTeams />
      <div className="my-20 flex w-full max-w-5xl flex-col items-start justify-between px-10 md:flex-row md:px-0">
        <Heading.h2 className="font-light leading-[52.8px]">
          Featured Portfolio.
        </Heading.h2>
        <div className="flex max-w-[635px] flex-col items-start justify-between">
          <Text.p className="mb-5">
            We offer customized project-based services that meet your digital
            needs. Our team works closely with you to align goals, timeline, and
            budget. With open communication throughout the project, we deliver a
            high-quality product that exceeds expectations.
          </Text.p>
        </div>
      </div>
      <FaQ />
      <CTA />
    </section>
  );
}
