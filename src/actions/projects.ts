"use server";

import { prisma } from "@/lib/prisma";
import { cachedQuery } from "@/lib/redis";

export async function getProjects() {
  return cachedQuery(
    "projects:all",
    async () => {
      return prisma.project.findMany({
        where: {
          isVisible: true,
        },
        include: {
          techStacks: true,
          developers: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    },
    300, // 5 minutes TTL
  );
}

export async function getFeaturedProjects() {
  return cachedQuery(
    "projects:featured",
    async () => {
      return prisma.project.findMany({
        where: {
          isVisible: true,
          isFeatured: true,
        },
        include: {
          techStacks: true,
          developers: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    },
    300, // 5 minutes TTL
  );
}

export async function getFilterOptions() {
  return cachedQuery(
    "projects:filters",
    async () => {
      const [categories, techStacks, developers] = await Promise.all([
        prisma.project.findMany({
          where: { isVisible: true },
          select: { category: true },
          distinct: ["category"],
        }),
        prisma.projectTechStack.findMany({
          select: { name: true },
          distinct: ["name"],
        }),
        prisma.projectDeveloper.findMany({
          select: { name: true },
          distinct: ["name"],
        }),
      ]);

      return {
        categories: categories.map((c) => c.category),
        techStacks: techStacks.map((t) => t.name),
        developers: developers.map((d) => d.name),
      };
    },
    600, // 10 minutes TTL
  );
}

export async function getProjectBySlug(slug: string) {
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
    300, // 5 minutes TTL
  );
}
