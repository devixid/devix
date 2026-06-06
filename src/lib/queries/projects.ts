import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { cachedQuery } from "@/lib/redis";

const PROJECTS_TTL = 3600;

export const getProjects = cache(async () => {
  return cachedQuery(
    "projects:all",
    () =>
      prisma.project.findMany({
        where: { isVisible: true },
        include: { techStacks: true, developers: true },
        orderBy: { createdAt: "desc" },
      }),
    PROJECTS_TTL,
  );
});

export const getFeaturedProjects = cache(async () => {
  return cachedQuery(
    "projects:featured",
    () =>
      prisma.project.findMany({
        where: { isVisible: true, isFeatured: true },
        include: { techStacks: true, developers: true },
        orderBy: [{ featuredOrder: "asc" }, { createdAt: "desc" }],
      }),
    PROJECTS_TTL,
  );
});

export const getFilterOptions = cache(async () => {
  return cachedQuery(
    "projects:filters",
    async () => {
      const [categories, techStacks, developers] = await Promise.all([
        prisma.project.findMany({
          where: { isVisible: true },
          select: { category: true },
          distinct: ["category"],
        }),
        prisma.projectTechStack.findMany({ select: { name: true }, distinct: ["name"] }),
        prisma.projectDeveloper.findMany({ select: { name: true }, distinct: ["name"] }),
      ]);
      
      return { 
        categories: categories.map(c => c.category), 
        techStacks: techStacks.map(t => t.name), 
        developers: developers.map(d => d.name) 
      };
    },
    PROJECTS_TTL,
  );
});

export const getProjectBySlug = cache(async (slug: string) => {
  return cachedQuery(
    `project:${slug}`,
    async () => {
      return prisma.project.findUnique({
        where: {
          slug,
          isVisible: true,
        },
        include: {
          techStacks: true,
          developers: true,
        },
      });
    },
    PROJECTS_TTL,
  );
});
