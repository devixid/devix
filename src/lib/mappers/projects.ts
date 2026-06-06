import type { Project, ProjectDeveloper, ProjectTechStack } from "@prisma/client";
import type { ProjectListItem } from "@/types/projects";

type DateLike = Date | string;

type ProjectWithRelations = Omit<Project, "createdAt" | "completedAt"> & {
  createdAt: DateLike;
  completedAt: DateLike | null;
  techStacks: ProjectTechStack[];
  developers: ProjectDeveloper[];
};

function toIsoString(value: DateLike): string {
  return typeof value === "string" ? value : value.toISOString();
}

export function toProjectListItem(project: ProjectWithRelations): ProjectListItem {
  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    category: project.category,
    imageUrl: project.imageUrl,
    description: project.description,
    liveUrl: project.liveUrl,
    githubUrl: project.githubUrl,
    completedAt:
      project.completedAt != null ? toIsoString(project.completedAt) : null,
    createdAt: toIsoString(project.createdAt),
    techStacks: project.techStacks.map((t) => ({ id: t.id, name: t.name })),
    developers: project.developers.map((d) => ({ id: d.id, name: d.name })),
  };
}

export function toProjectListItems(
  projects: ProjectWithRelations[],
): ProjectListItem[] {
  return projects.map(toProjectListItem);
}
