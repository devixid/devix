import { FaQ, Heading, ScrollDown, Text } from "@/components";
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
  const headingText = "Profesional website";
  const headingText2 = "creation services";
  const subHeadingText =
    "We provide cheap website creation services with good designs";

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
        {subHeadingText.split("").map((char, index) => {
          if (index > 0) {
            headingAnimationDelay += 0.02;
          }
          const loopKey = `key-${index}`;
          return (
            <Text.span
              className={cn("inline-block min-w-unit-1 text-base md:text-xl")}
              initial={{
                opacity: 0,
              }}
              animate={{
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
      <div className="relative mx-auto mb-40 flex flex-col items-center">
        <Text.span className={cn("text-[14px] font-light text-black")}>
          SCROLL DOWN
        </Text.span>
        <ScrollDown
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          transition={{ duration: 1 }}
          viewport={{ amount: 1, once: true }}
          className="absolute top-10 invert"
        />
      </div>
      <div
        className="mx-auto flex h-full w-full flex-col items-start gap-y-10 bg-black text-white md:items-start md:p-10"
        id="scrollDown"
      >
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-y-10 bg-black p-10 text-white md:items-start">
          <Text.span
            className={cn(
              "mb-10 mt-28 max-w-5xl text-center text-[40px] font-light leading-tight md:text-left md:text-6xl",
            )}
            resetStyle
          >
            We understand that every business has different needs.
          </Text.span>
          <Text.span
            className={cn(
              "mx-auto mb-10 max-w-5xl text-center text-[40px] font-light leading-tight md:mx-0 md:text-left md:text-6xl",
            )}
            resetStyle
          >
            Therefore,
          </Text.span>
          <Text.span
            className={cn(
              "max-w-5xl text-center text-[40px] font-light leading-tight md:mx-0 md:text-left md:text-6xl",
            )}
            resetStyle
          >
            we offer website creation that can be tailored to your needs.
          </Text.span>
        </div>
      </div>
      <div className="my-20 flex w-full max-w-5xl flex-col items-start justify-between px-10 md:flex-row md:px-0">
        <Heading.h2 className="font-light leading-[52.8px]">
          About us.
        </Heading.h2>
        <div className="flex max-w-[635px] flex-col items-start justify-between">
          <Text.p className="mb-5">
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Numquam
            illum, sit magnam neque tempore veritatis adipisci voluptatibus ab
            aspernatur, quos aperiam harum sint, molestias consequatur! Nemo,
            est alias mollitia ab totam sequi tempora incidunt placeat iste,
            unde possimus? Minima voluptatem quos nostrum, vitae ex aliquid
            perferendis aut quis, sit animi repellat consequatur nisi, iste nam.
          </Text.p>
          <Button
            className="h-[51px] w-full rounded-[5px] bg-black text-base text-white md:w-[174px]"
            type="button"
            variant="flat"
          >
            See our Services
          </Button>
        </div>
      </div>
      <FaQ />
    </section>
  );
}
