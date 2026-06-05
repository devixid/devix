"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { verifyAdminSession, verifyCsrfOrigin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { invalidateCache } from "@/lib/redis";
import { TestimonialSchema } from "@/lib/schemas";
import { z } from "zod";

// ----------------------------------------------------
// 1. OVERVIEW ACTIONS
// ----------------------------------------------------
export async function getOverviewStats() {
  await verifyAdminSession();

  const [
    totalSubmissions,
    unreadSubmissions,
    totalTestimonials,
    visibleTestimonials,
  ] = await Promise.all([
    prisma.contactSubmission.count(),
    prisma.contactSubmission.count({ where: { isRead: false } }),
    prisma.testimonial.count(),
    prisma.testimonial.count({ where: { isVisible: true } }),
  ]);

  return {
    totalSubmissions,
    unreadSubmissions,
    totalTestimonials,
    visibleTestimonials,
  };
}

// ----------------------------------------------------
// 2. INBOX ACTIONS
// ----------------------------------------------------
export async function getInboxSubmissions(
  params: { query?: string; status?: "all" | "unread" | "read" } = {},
) {
  await verifyAdminSession();

  const { query, status } = params;

  const whereClause: Prisma.ContactSubmissionWhereInput = {};

  if (status === "unread") {
    whereClause.isRead = false;
  } else if (status === "read") {
    whereClause.isRead = true;
  }

  if (query) {
    whereClause.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { email: { contains: query, mode: "insensitive" } },
      { message: { contains: query, mode: "insensitive" } },
    ];
  }

  return prisma.contactSubmission.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
  });
}

export async function getSubmissionById(id: string) {
  await verifyAdminSession();
  return prisma.contactSubmission.findUnique({
    where: { id },
  });
}

export async function markSubmissionAsRead(id: string, isRead: boolean) {
  await verifyAdminSession();
  await verifyCsrfOrigin();

  const updated = await prisma.contactSubmission.update({
    where: { id },
    data: { isRead },
  });

  revalidatePath("/admin/inbox");
  revalidatePath(`/admin/inbox/${id}`);
  return updated;
}

export async function deleteSubmission(id: string) {
  await verifyAdminSession();
  await verifyCsrfOrigin();

  await prisma.contactSubmission.delete({
    where: { id },
  });

  revalidatePath("/admin/inbox");
}

// ----------------------------------------------------
// 3. TESTIMONIAL ACTIONS
// ----------------------------------------------------
export async function getTestimonials() {
  await verifyAdminSession();

  return prisma.testimonial.findMany({
    orderBy: { order: "asc" },
  });
}

type TestimonialInput = z.infer<typeof TestimonialSchema>;

export async function createTestimonial(data: TestimonialInput) {
  await verifyAdminSession();
  await verifyCsrfOrigin();

  const parsed = TestimonialSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }
  const validatedData = parsed.data;

  const created = await prisma.testimonial.create({
    data: {
      clientName: validatedData.clientName.trim(),
      clientRole: validatedData.clientRole.trim(),
      company: validatedData.company.trim(),
      content: validatedData.content.trim(),
      avatarUrl: validatedData.avatarUrl?.trim() || null,
      isVisible: validatedData.isVisible ?? true,
      order: validatedData.order ?? 0,
    },
  });

  await invalidateCache("testimonials:all", "testimonials:visible");
  revalidatePath("/admin/testimonials");
  revalidatePath("/"); // Update home testimonials
  return created;
}

export async function updateTestimonial(id: string, data: TestimonialInput) {
  await verifyAdminSession();
  await verifyCsrfOrigin();

  const parsed = TestimonialSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }
  const validatedData = parsed.data;

  const updated = await prisma.testimonial.update({
    where: { id },
    data: {
      clientName: validatedData.clientName.trim(),
      clientRole: validatedData.clientRole.trim(),
      company: validatedData.company.trim(),
      content: validatedData.content.trim(),
      avatarUrl: validatedData.avatarUrl?.trim() || null,
      isVisible: validatedData.isVisible ?? true,
      order: validatedData.order ?? 0,
    },
  });

  await invalidateCache("testimonials:all", "testimonials:visible");
  revalidatePath("/admin/testimonials");
  revalidatePath("/"); // Update home testimonials
  return updated;
}

export async function toggleTestimonialVisibility(
  id: string,
  isVisible: boolean,
) {
  await verifyAdminSession();
  await verifyCsrfOrigin();

  const updated = await prisma.testimonial.update({
    where: { id },
    data: { isVisible },
  });

  await invalidateCache("testimonials:all", "testimonials:visible");
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  return updated;
}

export async function deleteTestimonial(id: string) {
  await verifyAdminSession();
  await verifyCsrfOrigin();

  await prisma.testimonial.delete({
    where: { id },
  });

  await invalidateCache("testimonials:all", "testimonials:visible");
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}
