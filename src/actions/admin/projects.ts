"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSessionCookie } from "@/lib/auth";

// Helper for auth
async function verifyAdminSession() {
  const session = await getSessionCookie();

  if (!session || !session.email) {
    throw new Error("Unauthorized access. Session not found.");
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.email as string },
    select: { email: true },
  });

  if (!dbUser) {
    throw new Error(
      "Unauthorized access. Admin whitelist verification failed.",
    );
  }

  return session;
}

export async function getAdminProjects() {
  await verifyAdminSession();

  return prisma.project.findMany({
    include: {
      techStacks: true,
      developers: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function toggleProjectVisibility(id: string, isVisible: boolean) {
  await verifyAdminSession();

  const updated = await prisma.project.update({
    where: { id },
    data: { isVisible },
  });

  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  revalidatePath("/");
  return updated;
}

export async function toggleProjectFeatured(id: string, isFeatured: boolean) {
  await verifyAdminSession();

  const updated = await prisma.project.update({
    where: { id },
    data: { isFeatured },
  });

  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  revalidatePath("/");
  return updated;
}

export async function deleteProject(id: string) {
  await verifyAdminSession();

  await prisma.project.delete({
    where: { id },
  });

  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  revalidatePath("/");
}

interface ProjectInput {
  title: string;
  slug: string;
  description: string;
  category: string;
  imageUrl: string;
  liveUrl?: string | null;
  githubUrl?: string | null;
  completedAt?: Date | null;
  isFeatured?: boolean;
  isVisible?: boolean;
  techStacks: string[];
  developers: { name: string; role?: string }[];
}

export async function createProject(data: ProjectInput) {
  await verifyAdminSession();

  // Validate Slug
  const existing = await prisma.project.findUnique({
    where: { slug: data.slug },
  });
  if (existing) {
    throw new Error(`A project with the slug "${data.slug}" already exists.`);
  }

  const project = await prisma.project.create({
    data: {
      title: data.title,
      slug: data.slug,
      description: data.description,
      category: data.category,
      imageUrl: data.imageUrl,
      liveUrl: data.liveUrl || null,
      githubUrl: data.githubUrl || null,
      completedAt: data.completedAt || null,
      isFeatured: data.isFeatured ?? false,
      isVisible: data.isVisible ?? true,
      techStacks: {
        create: data.techStacks.map((name) => ({ name })),
      },
      developers: {
        create: data.developers.map((dev) => ({
          name: dev.name,
          role: dev.role || null,
        })),
      },
    },
  });

  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  revalidatePath("/");
  return project;
}

export async function updateProject(id: string, data: ProjectInput) {
  await verifyAdminSession();

  // Validate Slug if it changed
  const existing = await prisma.project.findUnique({
    where: { slug: data.slug },
  });
  if (existing && existing.id !== id) {
    throw new Error(`A project with the slug "${data.slug}" already exists.`);
  }

  // Use transaction to update scalar fields and replace relations
  const project = await prisma.$transaction(async (tx) => {
    // 1. Update main project and delete old relations
    const updated = await tx.project.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        category: data.category,
        imageUrl: data.imageUrl,
        liveUrl: data.liveUrl || null,
        githubUrl: data.githubUrl || null,
        completedAt: data.completedAt || null,
        isFeatured: data.isFeatured,
        isVisible: data.isVisible,
        // Delete all existing relations
        techStacks: { deleteMany: {} },
        developers: { deleteMany: {} },
      },
    });

    // 2. Re-create relations
    if (data.techStacks.length > 0 || data.developers.length > 0) {
      await tx.project.update({
        where: { id },
        data: {
          techStacks: {
            create: data.techStacks.map((name) => ({ name })),
          },
          developers: {
            create: data.developers.map((dev) => ({
              name: dev.name,
              role: dev.role || null,
            })),
          },
        },
      });
    }

    return updated;
  });

  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  revalidatePath("/");
  return project;
}
