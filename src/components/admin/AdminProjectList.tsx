"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Project, ProjectDeveloper, ProjectTechStack } from "@prisma/client";
import {
  toggleProjectVisibility,
  toggleProjectFeatured,
  deleteProject,
} from "@/actions/admin/projects";
import { Eye, EyeOff, Star, Trash2, Edit } from "lucide-react";

type ProjectWithRelations = Project & {
  techStacks: ProjectTechStack[];
  developers: ProjectDeveloper[];
};

export default function AdminProjectList({
  initialProjects,
}: {
  initialProjects: ProjectWithRelations[];
}) {
  const [projects, setProjects] = useState(initialProjects);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggleVisibility = async (id: string, current: boolean) => {
    setLoadingId(id);
    try {
      const updated = await toggleProjectVisibility(id, !current);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, isVisible: updated.isVisible } : p,
        ),
      );
    } catch (err) {
      console.error(err);
      alert("Failed to toggle visibility");
    } finally {
      setLoadingId(null);
    }
  };

  const handleToggleFeatured = async (id: string, current: boolean) => {
    setLoadingId(id);
    try {
      const updated = await toggleProjectFeatured(id, !current);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, isFeatured: updated.isFeatured } : p,
        ),
      );
    } catch (err) {
      console.error(err);
      alert("Failed to toggle featured status");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this project? This cannot be undone.",
      )
    )
      return;

    setLoadingId(id);
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete project");
    } finally {
      setLoadingId(null);
    }
  };

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800 bg-[#121212] py-20 text-center">
        <div className="mb-4 text-zinc-600">
          <svg
            className="mx-auto h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-zinc-200">No projects found</h3>
        <p className="mt-1 text-sm text-zinc-500">
          Get started by creating your first project.
        </p>
        <Link
          href="/admin/projects/create"
          className="mt-6 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Add Project
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <div
          key={project.id}
          className="group flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-[#121212] transition-colors hover:border-zinc-700"
        >
          {/* Header Actions */}
          <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-4 py-3">
            <span className="rounded bg-zinc-800 px-2 py-1 text-[10px] font-bold tracking-wider text-zinc-300 uppercase">
              {project.category}
            </span>
            <div className="flex items-center gap-x-2">
              <button
                onClick={() =>
                  handleToggleFeatured(project.id, project.isFeatured)
                }
                disabled={loadingId === project.id}
                className={`rounded p-1.5 transition-colors ${
                  project.isFeatured
                    ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                    : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                }`}
                title={
                  project.isFeatured
                    ? "Remove from Featured"
                    : "Mark as Featured"
                }
              >
                <Star
                  size={16}
                  fill={project.isFeatured ? "currentColor" : "none"}
                />
              </button>
              <button
                onClick={() =>
                  handleToggleVisibility(project.id, project.isVisible)
                }
                disabled={loadingId === project.id}
                className={`rounded p-1.5 transition-colors ${
                  project.isVisible
                    ? "text-emerald-500 hover:bg-emerald-500/10"
                    : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                }`}
                title={project.isVisible ? "Hide Project" : "Show Project"}
              >
                {project.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
          </div>

          {/* Image */}
          <div className="relative aspect-video w-full bg-zinc-900">
            <Image
              src={project.imageUrl}
              alt={project.title}
              fill
              className={`object-cover ${!project.isVisible && "opacity-50 grayscale"}`}
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>

          {/* Body */}
          <div className="flex flex-1 flex-col p-5">
            <h3 className="font-display mb-2 line-clamp-1 text-lg font-medium text-zinc-100">
              {project.title}
            </h3>
            <p className="mb-4 line-clamp-2 text-sm text-zinc-500">
              {project.description}
            </p>

            <div className="mt-auto flex gap-x-2 border-t border-zinc-800/50 pt-4">
              <Link
                href={`/admin/projects/${project.id}`}
                className="flex flex-1 items-center justify-center gap-x-2 rounded-lg bg-zinc-800 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white"
              >
                <Edit size={14} /> Edit
              </Link>
              <button
                onClick={() => handleDelete(project.id)}
                disabled={loadingId === project.id}
                className="flex items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-red-500 transition-colors hover:bg-red-500/20"
                title="Delete Project"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
