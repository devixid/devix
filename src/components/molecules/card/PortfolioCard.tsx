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
      className={`group relative flex flex-col w-full border border-zinc-200 hover:border-zinc-300 transition-all duration-500 overflow-hidden ${
        featured ? "h-full" : ""
      }`}
    >
      {/* Browser chrome mockup */}
      <div className="flex items-center gap-x-2 px-4 py-3 bg-zinc-50 border-b border-zinc-200">
        <div className="flex gap-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
        </div>
        <div className="flex-1 mx-3 h-5 rounded-sm bg-zinc-200/70 flex items-center px-3">
          <span className="text-[10px] text-zinc-400 truncate">{link}</span>
        </div>
      </div>

      {/* Screenshot */}
      <div className={`relative w-full overflow-hidden ${featured ? "flex-1 min-h-[300px]" : "aspect-video"}`}>
        <Image
          alt={title}
          src={image}
          fill
          sizes={featured ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white text-sm font-medium uppercase tracking-[0.15em] border border-white/40 px-6 py-3 hover:bg-white hover:text-black transition-all duration-300"
          >
            View Project →
          </a>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col p-6">
        <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent mb-3">
          {category}
        </span>
        <h4 className="font-display text-lg font-medium text-black tracking-tight group-hover:text-zinc-700 transition-colors">
          {title}
        </h4>
      </div>
    </m.div>
  );
}
