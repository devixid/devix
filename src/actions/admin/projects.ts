"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { verifyAdminSession, verifyCsrfOrigin } from "@/lib/auth";
import { invalidateCache } from "@/lib/redis";
import { ProjectSchema } from "@/lib/schemas";
import { z } from "zod";

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
  await verifyCsrfOrigin();

  const updated = await prisma.project.update({
    where: { id },
    data: { isVisible },
  });

  await invalidateCache(
    "projects:all",
    "projects:featured",
    "projects:filters",
  );
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  revalidatePath("/");
  return updated;
}

export async function toggleProjectFeatured(id: string, isFeatured: boolean) {
  await verifyAdminSession();
  await verifyCsrfOrigin();

  const updated = await prisma.project.update({
    where: { id },
    data: { isFeatured },
  });

  await invalidateCache(
    "projects:all",
    "projects:featured",
    "projects:filters",
  );
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  revalidatePath("/");
  return updated;
}

export async function deleteProject(id: string) {
  await verifyAdminSession();
  await verifyCsrfOrigin();

  await prisma.project.delete({
    where: { id },
  });

  await invalidateCache(
    "projects:all",
    "projects:featured",
    "projects:filters",
  );
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  revalidatePath("/");
}

type ProjectInput = z.infer<typeof ProjectSchema>;

export async function createProject(data: ProjectInput) {
  await verifyAdminSession();
  await verifyCsrfOrigin();

  const parsed = ProjectSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }
  const validatedData = parsed.data;

  // Validate Slug
  const existing = await prisma.project.findUnique({
    where: { slug: validatedData.slug },
  });
  if (existing) {
    throw new Error(
      `A project with the slug "${validatedData.slug}" already exists.`,
    );
  }

  const project = await prisma.project.create({
    data: {
      title: validatedData.title,
      slug: validatedData.slug,
      description: validatedData.description,
      category: validatedData.category,
      imageUrl: validatedData.imageUrl,
      liveUrl: validatedData.liveUrl || null,
      githubUrl: validatedData.githubUrl || null,
      completedAt: validatedData.completedAt || null,
      isFeatured: validatedData.isFeatured ?? false,
      isVisible: validatedData.isVisible ?? true,
      techStacks: {
        create: validatedData.techStacks.map((name) => ({ name })),
      },
      developers: {
        create: validatedData.developers.map((dev) => ({
          name: dev.name,
          role: dev.role || null,
        })),
      },
    },
  });

  await invalidateCache(
    "projects:all",
    "projects:featured",
    "projects:filters",
  );
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  revalidatePath("/");
  return project;
}

export async function updateProject(id: string, data: ProjectInput) {
  await verifyAdminSession();
  await verifyCsrfOrigin();

  const parsed = ProjectSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }
  const validatedData = parsed.data;

  // Validate Slug if it changed
  const existing = await prisma.project.findUnique({
    where: { slug: validatedData.slug },
  });
  if (existing && existing.id !== id) {
    throw new Error(
      `A project with the slug "${validatedData.slug}" already exists.`,
    );
  }

  // Use transaction to update scalar fields and replace relations
  const project = await prisma.$transaction(async (tx) => {
    // 1. Update main project and delete old relations
    const updated = await tx.project.update({
      where: { id },
      data: {
        title: validatedData.title,
        slug: validatedData.slug,
        description: validatedData.description,
        category: validatedData.category,
        imageUrl: validatedData.imageUrl,
        liveUrl: validatedData.liveUrl || null,
        githubUrl: validatedData.githubUrl || null,
        completedAt: validatedData.completedAt || null,
        isFeatured: validatedData.isFeatured,
        isVisible: validatedData.isVisible,
        // Delete all existing relations
        techStacks: { deleteMany: {} },
        developers: { deleteMany: {} },
      },
    });

    // 2. Re-create relations
    if (
      validatedData.techStacks.length > 0 ||
      validatedData.developers.length > 0
    ) {
      await tx.project.update({
        where: { id },
        data: {
          techStacks: {
            create: validatedData.techStacks.map((name) => ({ name })),
          },
          developers: {
            create: validatedData.developers.map((dev) => ({
              name: dev.name,
              role: dev.role || null,
            })),
          },
        },
      });
    }

    return updated;
  });

  await invalidateCache(
    "projects:all",
    "projects:featured",
    "projects:filters",
  );
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  revalidatePath("/");
  return project;
}
