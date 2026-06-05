"use client";

import Image from "next/image";
import { m } from "framer-motion";

interface PortfolioCardProps {
  title: string;
  category: string;
  image: string;
  link: string;
  technologies: string[];
  featured?: boolean;
}

export default function PortfolioCard({
  title,
  category,
  image,
  link,
  technologies: _technologies,
  featured = false,
}: PortfolioCardProps) {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative flex w-full flex-col overflow-hidden border border-zinc-200 transition-all duration-500 hover:border-zinc-300 ${
        featured ? "h-full" : ""
      }`}
    >
      {/* Browser chrome mockup */}
      <div className="flex items-center gap-x-2 border-b border-zinc-200 bg-zinc-50 px-4 py-3">
        <div className="flex gap-x-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
        </div>
        <div className="mx-3 flex h-5 flex-1 items-center rounded-sm bg-zinc-200/70 px-3">
          <span className="truncate text-[10px] text-zinc-400">{link}</span>
        </div>
      </div>

      {/* Screenshot */}
      <div
        className={`relative w-full overflow-hidden ${featured ? "min-h-[300px] flex-1" : "aspect-video"}`}
      >
        <Image
          alt={title}
          src={image}
          fill
          sizes={
            featured
              ? "(max-width: 768px) 100vw, 66vw"
              : "(max-width: 768px) 100vw, 33vw"
          }
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-white/40 px-6 py-3 text-sm font-medium tracking-[0.15em] text-white uppercase transition-all duration-300 hover:bg-white hover:text-black"
          >
            View Project →
          </a>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col p-6">
        <span className="text-accent mb-3 text-[11px] font-medium tracking-[0.2em] uppercase">
          {category}
        </span>
        <h4 className="font-display text-lg font-medium tracking-tight text-black transition-colors group-hover:text-zinc-700">
          {title}
        </h4>
      </div>
    </m.div>
  );
}
