import {
  About,
  FaQ,
  Heading,
  Offering,
  ScrollDownButton,
  Text,
  OurTeams,
  PortfolioCard,
} from "@/components";
import CTA from "@/components/molecules/CTA";
import { headingText, headingText2, subHeadingText } from "@/constants";
import { cn } from "@/utils";
import { Button } from "@heroui/react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Devixid - Home",
  description: "Profesional website creation services",
  keywords: ["devix", "devixid", "devix_id", "home"],
};

export default function Page() {
  let headingAnimationDelay = 0;

  const portfolios = [
    {
      title: "Ceràmica - Handcrafted Pottery Shop",
      category: "E-Commerce",
      image: "/portfolio_ecommerce.png",
      link: "https://ceramic-example.devix.id",
      technologies: ["Next.js", "Tailwind CSS", "Prisma", "Stripe"],
    },
    {
      title: "Veridian Solutions - Sustainable Tech Hub",
      category: "Corporate Profile",
      image: "/portfolio_corporate.png",
      link: "https://veridian-example.devix.id",
      technologies: ["React", "Tailwind CSS", "Framer Motion"],
    },
    {
      title: "Projector - Agile Team Collaboration SaaS",
      category: "Web Application / SaaS",
      image: "/portfolio_saas.png",
      link: "https://projector-example.devix.id",
      technologies: ["Next.js", "Supabase", "TypeScript", "Tailwind CSS"],
    },
  ];

  return (
    <section
      className={cn("mx-auto mt-44 flex flex-col items-center justify-center")}
    >
      <div id="home" className="flex min-h-[calc(100vh-11rem)] w-full flex-col items-center justify-between pb-[120px] scroll-mt-24">
        <div className="flex flex-1 flex-col items-center justify-center">
          <div
            className={cn(
              "flex flex-col items-center justify-center self-center",
              "mb-2 pt-1 gap-y-2 md:gap-y-6",
            )}
          >
        <Heading.h1 className="w-full px-10 text-center text-5xl font-medium tracking-tight leading-none md:text-9xl md:leading-none flex flex-wrap justify-center gap-x-3 md:gap-x-6">
          {(headingText as string).split(" ").map((word, index) => {
            if (index > 0) {
              headingAnimationDelay += 0.15;
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
                className="inline-block"
              >
                {word}
              </Text.span>
            );
          })}
        </Heading.h1>
        <Heading.h1 className="w-full px-10 text-center text-5xl font-medium tracking-tight leading-none md:text-9xl md:leading-none flex flex-wrap justify-center gap-x-3 md:gap-x-6">
          {(headingText2 as string).split(" ").map((word, index) => {
            headingAnimationDelay += 0.15;

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
                className="inline-block"
              >
                {word}
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
          <div className={cn("mt-10")}>
            <Text.span
              resetStyle
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: headingAnimationDelay }}
              viewport={{ once: true, amount: 1 }}
            >
              <a href="#cta" className="inline-block">
                <Button
                  variant="secondary"
                  type="button"
                  className={cn(
                    "h-[51px] w-[250px] rounded-[5px] bg-black text-base text-white flex items-center justify-center cursor-pointer",
                  )}
                >
                  Achieve success with us!
                </Button>
              </a>
            </Text.span>
          </div>
        </div>
        <ScrollDownButton />
      </div>
      <Offering />
      <About />
      <OurTeams />
      <div id="portfolio" className="my-20 flex w-full max-w-5xl flex-col items-start justify-between px-10 md:flex-row md:px-0 scroll-mt-24">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl px-10 md:px-0 mb-20">
        {portfolios.map((item, index) => (
          <PortfolioCard
            key={index}
            title={item.title}
            category={item.category}
            image={item.image}
            link={item.link}
            technologies={item.technologies}
          />
        ))}
      </div>
      <FaQ />
      <CTA />
    </section>
  );
}
