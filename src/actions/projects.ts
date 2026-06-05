"use server";

import { prisma } from "@/lib/prisma";

export async function getProjects() {
  // Karena pagination berjalan di client-side, kita ambil semua project yang visible
  const projects = await prisma.project.findMany({
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

  return projects;
}

export async function getFeaturedProjects() {
  const projects = await prisma.project.findMany({
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

  return projects;
}

export async function getFilterOptions() {
  // Ambil semua opsi unik untuk kategori, tech stacks, dan developer
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
}
