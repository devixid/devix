"use server";

import { Prisma } from "@prisma/client";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ConsultationFeedbackSchema } from "@/lib/schemas";
import { getClientIp, getFeedbackLimiter } from "@/lib/rate-limit";
import { logActivity } from "@/lib/activity-log";

const FEEDBACK_WINDOW_MS = 2 * 60 * 60 * 1000;

export type FeedbackActionResult = {
  success: boolean;
  error?: string;
};

export async function submitConsultationFeedback(data: {
  contactSubmissionId: string;
  rating: number;
  comment?: string | null;
}): Promise<FeedbackActionResult> {
  const ip = getClientIp(await headers());
  const limiter = getFeedbackLimiter();
  if (limiter) {
    const { success: allowed } = await limiter.limit(ip);
    if (!allowed) {
      return {
        success: false,
        error: "Terlalu banyak percobaan. Silakan coba lagi nanti.",
      };
    }
  }

  const parsed = ConsultationFeedbackSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Data feedback tidak valid.",
    };
  }

  const { contactSubmissionId, rating, comment } = parsed.data;
  const trimmedComment = comment?.trim() || null;

  const submission = await prisma.contactSubmission.findUnique({
    where: { id: contactSubmissionId },
    select: { id: true, source: true, createdAt: true, name: true },
  });

  if (!submission) {
    return { success: false, error: "Sesi konsultasi tidak ditemukan." };
  }

  if (submission.source !== "estimator") {
    return { success: false, error: "Feedback tidak tersedia untuk formulir ini." };
  }

  const ageMs = Date.now() - submission.createdAt.getTime();
  if (ageMs > FEEDBACK_WINDOW_MS) {
    return {
      success: false,
      error: "Waktu untuk memberikan feedback telah berakhir.",
    };
  }

  try {
    await prisma.consultationFeedback.create({
      data: {
        contactSubmissionId,
        rating,
        comment: trimmedComment,
      },
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return {
        success: false,
        error: "Anda sudah memberikan feedback untuk konsultasi ini.",
      };
    }
    console.error("Feedback submission error:", err);
    return {
      success: false,
      error: "Terjadi kesalahan. Silakan coba lagi.",
    };
  }

  revalidatePath("/admin/feedback");
  revalidatePath("/admin/inbox");
  revalidatePath(`/admin/inbox/${contactSubmissionId}`);

  await logActivity({
    action: "feedback.submitted",
    entityType: "ConsultationFeedback",
    entityId: contactSubmissionId,
    metadata: { rating, hasComment: Boolean(trimmedComment) },
  });

  return { success: true };
}
