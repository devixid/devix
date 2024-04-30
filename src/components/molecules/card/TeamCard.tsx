"use client";

import { TeamCardProps } from "@/interface";
import { Image } from "@nextui-org/react";
import { motion } from "framer-motion";
import { Heading, Text } from "@/components/atoms";

export default function TeamCard({
  description,
  image,
  name,
  title,
  ...props
}: TeamCardProps) {
  return (
    <motion.div
      {...props}
      className="mx-10 my-5 flex h-full flex-col items-center rounded-md bg-white shadow-lg md:mx-0 md:mr-5 md:h-[464px] md:max-w-[260px]"
    >
      <div className="relative flex flex-col-reverse">
        <Image
          alt={name}
          src={image}
          className="size-full md:h-[300px]"
        />
        <Text.p className="absolute p-2 align-bottom text-xl font-medium tracking-tight text-white">
          {name}
        </Text.p>
      </div>
      <div className="my-2 px-2">
        <Heading.h4 className="mb-2 text-xl font-medium leading-tight tracking-wide">
          {title}
        </Heading.h4>
        <Text.span className="leading-tighter line-clamp-4 text-base font-light">
          {description}
        </Text.span>
      </div>
    </motion.div>
  );
}
