import { cn } from "@/utils";
import { Heading } from "@/components/atoms";
import { Button } from "@heroui/react";

export default function CTA() {
  return (
    <div
      id="cta"
      className={cn(
        "my-10 flex h-72 w-full max-w-5xl flex-col items-center justify-between rounded-lg bg-black-1 py-10 scroll-mt-24",
      )}
    >
      <Heading.h2 className="text-4xl font-light text-white sm:text-5xl md:text-6xl text-center px-4">
        Ready to work with us?
      </Heading.h2>
      <Heading.h4 className="text-xl font-light text-white text-center px-4">
        Let's turn your vision into a stunning digital reality.
      </Heading.h4>
      <a
        href="https://wa.me/6281234567890?text=Halo%20Devix,%20saya%20tertarik%20untuk%20membuat%20website"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block"
      >
        <Button
          type="button"
          variant="primary"
          className="bg-white text-black rounded-sm cursor-pointer px-6 py-2 flex items-center justify-center font-medium"
        >
          Contact us
        </Button>
      </a>
    </div>
  );
}
