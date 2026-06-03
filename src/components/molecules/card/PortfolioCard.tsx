"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Heading, Text } from "@/components/atoms";
import { ExternalLink } from "lucide-react";

interface PortfolioCardProps {
  title: string;
  category: string;
  image: string;
  link: string;
  technologies: string[];
}

export default function PortfolioCard({
  title,
  category,
  image,
  link,
  technologies,
}: PortfolioCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group relative flex flex-col w-full rounded-2xl overflow-hidden bg-white border border-zinc-200 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-100">
        <Image
          alt={title}
          src={image}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full font-medium shadow-lg hover:scale-105 transition-transform duration-200 text-sm cursor-pointer"
          >
            Visit Website <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
      
      <div className="flex flex-col p-6">
        <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-2">
          {category}
        </span>
        <Heading.h4 className="text-xl font-bold text-zinc-900 mb-3 group-hover:text-zinc-700 transition-colors">
          {title}
        </Heading.h4>
        <div className="flex flex-wrap gap-2 mt-2">
          {technologies.map((tech) => (
            <span
              key={tech}
              className="text-xs px-2.5 py-1 bg-zinc-100 text-zinc-600 rounded-md font-medium"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
