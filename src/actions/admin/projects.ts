"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { verifyAdminSession, verifyCsrfOrigin } from "@/lib/auth";
import { invalidateCache } from "@/lib/redis";
import { logActivity } from "@/lib/activity-log";
import { ProjectSchema } from "@/lib/schemas";
import { sanitizeRichHtml } from "@/utils/sanitize";
import { z } from "zod";

function sanitizeProjectContent(content: string | null | undefined) {
  if (!content?.trim()) return null;
  const sanitized = sanitizeRichHtml(content.trim());
  return sanitized || null;
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

export async function duplicateProject(id: string) {
  await verifyAdminSession();
  await verifyCsrfOrigin();

  const original = await prisma.project.findUnique({
    where: { id },
    include: { techStacks: true, developers: true },
  });

  if (!original) {
    throw new Error("Project not found.");
  }

  let slug = `${original.slug}-copy`;
  let suffix = 2;
  while (await prisma.project.findUnique({ where: { slug } })) {
    slug = `${original.slug}-copy-${suffix}`;
    suffix++;
  }

  const duplicate = await prisma.project.create({
    data: {
      title: `${original.title} (Copy)`,
      slug,
      description: original.description,
      content: original.content,
      category: original.category,
      imageUrl: original.imageUrl,
      liveUrl: original.liveUrl,
      githubUrl: original.githubUrl,
      completedAt: original.completedAt,
      isFeatured: false,
      isVisible: false,
      featuredOrder: 0,
      techStacks: {
        create: original.techStacks.map((t) => ({ name: t.name })),
      },
      developers: {
        create: original.developers.map((d) => ({
          name: d.name,
          role: d.role,
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
  return duplicate;
}

export async function reorderFeaturedProjects(orderedIds: string[]) {
  await verifyAdminSession();
  await verifyCsrfOrigin();

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.project.update({
        where: { id },
        data: { featuredOrder: index },
      }),
    ),
  );

  await invalidateCache("projects:featured");
  revalidatePath("/admin/projects");
  revalidatePath("/");
  revalidatePath("/projects");
}

export async function getFeaturedProjectsForOrder() {
  await verifyAdminSession();
  return prisma.project.findMany({
    where: { isFeatured: true },
    orderBy: [{ featuredOrder: "asc" }, { createdAt: "desc" }],
    select: { id: true, title: true, slug: true, imageUrl: true },
  });
}

export async function deleteProject(id: string) {
  await verifyAdminSession();
  await verifyCsrfOrigin();

  const existing = await prisma.project.findUnique({
    where: { id },
    select: { slug: true },
  });

  await prisma.project.delete({
    where: { id },
  });

  await invalidateCache(
    "projects:all",
    "projects:featured",
    "projects:filters",
    ...(existing ? [`project:${existing.slug}`] : []),
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
      content: sanitizeProjectContent(validatedData.content),
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
  await logActivity({
    action: "project.created",
    entityType: "Project",
    entityId: project.id,
    metadata: { title: project.title },
  });
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

  const current = await prisma.project.findUnique({
    where: { id },
    select: { slug: true },
  });
  if (!current) {
    throw new Error("Project not found.");
  }

  if (validatedData.slug !== current.slug) {
    const slugTaken = await prisma.project.findUnique({
      where: { slug: validatedData.slug },
    });
    if (slugTaken && slugTaken.id !== id) {
      throw new Error(
        `A project with the slug "${validatedData.slug}" already exists.`,
      );
    }
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
        content: sanitizeProjectContent(validatedData.content),
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

  const slugKeys = new Set([`project:${current.slug}`, `project:${project.slug}`]);
  await invalidateCache(
    "projects:all",
    "projects:featured",
    "projects:filters",
    ...slugKeys,
  );
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  revalidatePath("/");
  await logActivity({
    action: "project.updated",
    entityType: "Project",
    entityId: project.id,
    metadata: { title: project.title },
  });
  return project;
}
