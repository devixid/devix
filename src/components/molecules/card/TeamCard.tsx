"use client";

import { TeamCardProps } from "@/interface";
import Image from "next/image";
import { Github, Linkedin } from "lucide-react";

export default function TeamCard({
  description,
  image,
  name,
  title,
  socials,
}: TeamCardProps) {
  return (
    <div className="group relative flex w-full flex-col overflow-hidden border border-zinc-100 transition-all duration-500 hover:border-zinc-300">
      {/* Image area — portrait 3:4 */}
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <Image
          alt={name}
          src={image}
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
        />
        {/* Hover overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {/* Social icons — slide up on hover */}
        <div className="absolute bottom-4 left-4 flex translate-y-2 items-center gap-x-3 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:opacity-100">
          <a
            href={socials.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/80 transition-colors hover:text-white"
            title={`${name}'s GitHub`}
          >
            <Github className="h-5 w-5" />
          </a>
          <a
            href={socials.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/80 transition-colors hover:text-white"
            title={`${name}'s LinkedIn`}
          >
            <Linkedin className="h-5 w-5" />
          </a>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col p-5">
        <h4 className="font-display text-lg font-medium tracking-tight text-black">
          {name}
        </h4>
        <span className="mt-2 inline-block w-fit border border-zinc-200 px-3 py-1 text-[11px] font-medium tracking-[0.1em] text-zinc-500 uppercase">
          {title}
        </span>
        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-zinc-500">
          {description}
        </p>
      </div>
    </div>
  );
}
