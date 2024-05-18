import { Heading, Text } from "@/components/atoms";
import { Button } from "@nextui-org/react";

export default function About() {
  return (
    <div className="my-20 flex w-full max-w-5xl flex-col items-start justify-between px-10 md:flex-row md:px-0">
      <Heading.h2 className="font-light leading-[52.8px]">About us.</Heading.h2>
      <div className="flex max-w-[635px] flex-col items-start justify-between">
        <Text.p className="mb-5">
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Numquam
          illum, sit magnam neque tempore veritatis adipisci voluptatibus ab
          aspernatur, quos aperiam harum sint, molestias consequatur! Nemo, est
          alias mollitia ab totam sequi tempora incidunt placeat iste, unde
          possimus? Minima voluptatem quos nostrum, vitae ex aliquid perferendis
          aut quis, sit animi repellat consequatur nisi, iste nam.
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
  );
}
