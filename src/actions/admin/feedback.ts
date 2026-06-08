"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession, verifyCsrfOrigin } from "@/lib/auth";
import { parseDateRangeFilter } from "@/lib/admin-filters";
import { logActivity } from "@/lib/activity-log";

export type FeedbackReadFilter = "all" | "unread" | "read";

export async function getFeedbackList(
  params: {
    query?: string;
    isRead?: FeedbackReadFilter;
    dateFrom?: string;
    dateTo?: string;
  } = {},
) {
  await verifyAdminSession();

  const { query, isRead, dateFrom, dateTo } = params;
  const where: Prisma.ConsultationFeedbackWhereInput = {};

  if (isRead === "unread") where.isRead = false;
  if (isRead === "read") where.isRead = true;

  const createdAt = parseDateRangeFilter(dateFrom, dateTo);
  if (createdAt) where.createdAt = createdAt;

  if (query?.trim()) {
    where.OR = [
      { comment: { contains: query, mode: "insensitive" } },
      {
        contactSubmission: {
          name: { contains: query, mode: "insensitive" },
        },
      },
      {
        contactSubmission: {
          email: { contains: query, mode: "insensitive" },
        },
      },
    ];
  }

  return prisma.consultationFeedback.findMany({
    where,
    include: {
      contactSubmission: {
        include: { estimatorLead: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getFeedbackById(id: string) {
  await verifyAdminSession();

  return prisma.consultationFeedback.findUnique({
    where: { id },
    include: {
      contactSubmission: {
        include: { estimatorLead: true },
      },
    },
  });
}

export async function markFeedbackRead(id: string, isRead: boolean) {
  await verifyAdminSession();
  await verifyCsrfOrigin();

  const updated = await prisma.consultationFeedback.update({
    where: { id },
    data: { isRead },
  });

  revalidatePath("/admin/feedback");
  revalidatePath(`/admin/feedback/${id}`);
  return updated;
}

export async function deleteFeedback(id: string) {
  await verifyAdminSession();
  await verifyCsrfOrigin();

  const existing = await prisma.consultationFeedback.findUnique({
    where: { id },
    select: { contactSubmissionId: true },
  });

  await prisma.consultationFeedback.delete({ where: { id } });

  revalidatePath("/admin/feedback");
  if (existing) {
    revalidatePath(`/admin/inbox/${existing.contactSubmissionId}`);
  }

  await logActivity({
    action: "feedback.deleted",
    entityType: "ConsultationFeedback",
    entityId: id,
  });
}
