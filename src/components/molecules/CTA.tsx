import { cn } from "@/utils";
import { Heading } from "@/components/atoms";
import { Button } from "@nextui-org/react";

export default function CTA() {
  return (
    <div
      className={cn(
        "my-10 flex h-72 w-full max-w-5xl flex-col items-center justify-between rounded-lg bg-black-1 py-10",
      )}
    >
      <Heading.h2 className="text-4xl font-light text-white sm:text-5xl md:text-6xl">
        Ready to work with us?
      </Heading.h2>
      <Heading.h4 className="text-xl font-light text-white">
        Contact us now that your ideas can be realized
      </Heading.h4>
      <Button
        type="button"
        variant="solid"
        color="default"
        radius="sm"
        className="w-1/5 bg-white"
      >
        Contact us
      </Button>
    </div>
  );
}
