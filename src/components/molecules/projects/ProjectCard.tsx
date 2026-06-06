"use client";

import Image from "next/image";
import Link from "next/link";
import { m } from "framer-motion";
import type { ProjectListItem } from "@/types/projects";
import { ExternalLink, GitCommit } from "lucide-react";

interface ProjectCardProps {
  project: ProjectListItem;
  index: number;
  priority?: boolean;
}

export default function ProjectCard({
  project,
  index,
  priority = false,
}: ProjectCardProps) {
  return (
    <m.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.1, 0.3) }}
      className="group relative flex w-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition-all duration-500 hover:border-zinc-300 hover:shadow-xl hover:shadow-black/[0.03]"
    >
      {/* Browser Chrome Header */}
      <div className="flex items-center gap-x-2 border-b border-zinc-200 bg-zinc-50/80 px-4 py-3">
        <div className="flex gap-x-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-300 transition-colors group-hover:bg-rose-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-300 transition-colors group-hover:bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-300 transition-colors group-hover:bg-emerald-400" />
        </div>
        <div className="mx-3 flex h-5 flex-1 items-center rounded bg-white px-3 shadow-sm ring-1 ring-zinc-200">
          <span className="truncate text-[10px] font-medium text-zinc-400">
            {project.liveUrl || "localhost:3000"}
          </span>
        </div>
      </div>

      {/* Image Thumbnail */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-100">
        <Image
          alt={project.title}
          src={project.imageUrl}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
        />

        {/* Overlay Links */}
        <div className="absolute inset-0 flex items-center justify-center gap-x-4 bg-black/40 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 translate-y-4 items-center justify-center rounded-full bg-white text-black transition-all duration-300 group-hover:translate-y-0 hover:scale-110"
              title="Visit Live Site"
            >
              <ExternalLink size={18} />
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 translate-y-4 items-center justify-center rounded-full bg-zinc-900 text-white transition-all duration-300 group-hover:translate-y-0 hover:scale-110"
              title="View Source Code"
            >
              <GitCommit size={18} />
            </a>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-accent text-[10px] font-bold tracking-[0.2em] uppercase">
            {project.category}
          </span>
          {project.completedAt && (
            <span className="text-xs font-medium text-zinc-400">
              {new Date(project.completedAt).getFullYear()}
            </span>
          )}
        </div>

        <Link href={`/projects/${project.slug}`} className="group/title inline-block">
          <h4 className="font-display mb-2 line-clamp-1 text-xl font-medium tracking-tight text-black group-hover/title:text-accent transition-colors">
            {project.title}
          </h4>
        </Link>

        <p className="mb-6 line-clamp-2 flex-1 text-sm leading-relaxed text-zinc-500">
          {project.description}
        </p>

        {/* Tech Stacks */}
        {project.techStacks.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {project.techStacks.slice(0, 3).map((tech) => (
              <span
                key={tech.id}
                className="rounded bg-zinc-100 px-2 py-1 text-[10px] font-medium text-zinc-600"
              >
                {tech.name}
              </span>
            ))}
            {project.techStacks.length > 3 && (
              <span className="rounded bg-zinc-50 px-2 py-1 text-[10px] font-medium text-zinc-400">
                +{project.techStacks.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Developers */}
        {project.developers.length > 0 && (
          <div className="mt-auto border-t border-zinc-100 pt-4">
            <p className="mb-2 text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
              Developed By
            </p>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {project.developers.map((dev) => (
                <span
                  key={dev.id}
                  className="text-xs font-medium text-zinc-700"
                >
                  {dev.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </m.div>
  );
}
