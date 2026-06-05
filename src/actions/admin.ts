"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getSessionCookie } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Helper to verify admin session and whitelist status
async function verifyAdminSession() {
  const session = await getSessionCookie();

  if (!session || !session.email) {
    throw new Error("Unauthorized access. Session not found.");
  }

  // Check if email is whitelisted
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

interface TestimonialInput {
  clientName: string;
  clientRole: string;
  company: string;
  content: string;
  avatarUrl?: string | null;
  isVisible?: boolean;
  order?: number;
}

function validateTestimonialInput(data: TestimonialInput) {
  if (!data.clientName || data.clientName.trim().length < 2) {
    throw new Error("Client name must be at least 2 characters.");
  }
  if (!data.clientRole || data.clientRole.trim().length < 2) {
    throw new Error("Client role must be at least 2 characters.");
  }
  if (!data.company || data.company.trim().length < 2) {
    throw new Error("Company must be at least 2 characters.");
  }
  if (!data.content || data.content.trim().length < 10) {
    throw new Error("Content must be at least 10 characters.");
  }
  if (data.avatarUrl && data.avatarUrl.trim().length > 0) {
    try {
      new URL(data.avatarUrl);
    } catch (err) {
      throw new Error(
        "Avatar URL must be a valid absolute URL (e.g. https://example.com/avatar.jpg).",
        { cause: err },
      );
    }
  }
}

export async function createTestimonial(data: TestimonialInput) {
  await verifyAdminSession();
  validateTestimonialInput(data);

  const created = await prisma.testimonial.create({
    data: {
      clientName: data.clientName.trim(),
      clientRole: data.clientRole.trim(),
      company: data.company.trim(),
      content: data.content.trim(),
      avatarUrl: data.avatarUrl?.trim() || null,
      isVisible: data.isVisible ?? true,
      order: data.order ?? 0,
    },
  });

  revalidatePath("/admin/testimonials");
  revalidatePath("/"); // Update home testimonials
  return created;
}

export async function updateTestimonial(id: string, data: TestimonialInput) {
  await verifyAdminSession();
  validateTestimonialInput(data);

  const updated = await prisma.testimonial.update({
    where: { id },
    data: {
      clientName: data.clientName.trim(),
      clientRole: data.clientRole.trim(),
      company: data.company.trim(),
      content: data.content.trim(),
      avatarUrl: data.avatarUrl?.trim() || null,
      isVisible: data.isVisible ?? true,
      order: data.order ?? 0,
    },
  });

  revalidatePath("/admin/testimonials");
  revalidatePath("/"); // Update home testimonials
  return updated;
}

export async function toggleTestimonialVisibility(
  id: string,
  isVisible: boolean,
) {
  await verifyAdminSession();

  const updated = await prisma.testimonial.update({
    where: { id },
    data: { isVisible },
  });

  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  return updated;
}

export async function deleteTestimonial(id: string) {
  await verifyAdminSession();

  await prisma.testimonial.delete({
    where: { id },
  });

  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}
