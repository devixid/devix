import { Heading, Text } from "@/components/atoms";
import { Button } from "@heroui/react";

export default function About() {
  return (
    <div id="about" className="my-20 flex w-full max-w-5xl flex-col items-start justify-between px-10 md:flex-row md:px-0 scroll-mt-24">
      <Heading.h2 className="font-light leading-[52.8px]">About us.</Heading.h2>
      <div className="flex max-w-[635px] flex-col items-start justify-between">
        <Text.p className="mb-5">
          We are a dedicated team of web developers and designers committed to building top-tier digital solutions for your business. From sleek landing pages to full-scale e-commerce platforms, we merge premium aesthetics with Next.js and TailwindCSS to deliver fast, SEO-friendly, and high-converting websites.
        </Text.p>
        <a href="#services" className="w-full md:w-[174px] inline-block">
          <Button
            className="h-[51px] w-full rounded-[5px] bg-black text-base text-white flex items-center justify-center cursor-pointer"
            variant="secondary"
            type="button"
          >
            See our Services
          </Button>
        </a>
      </div>
    </div>
  );
}
