"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { getContactLimiter, getClientIp } from "@/lib/rate-limit";

import { ContactFormSchema } from "@/lib/schemas";
import { sendContactConfirmation, sendInquiryNotification } from "@/lib/email";

type ContactFormData = {
  name: string;
  email: string;
  message: string;
  estimatorLeadId?: string | null;
};

type ActionResult = {
  success: boolean;
  error?: string;
};

export async function submitContactForm(
  data: ContactFormData,
): Promise<ActionResult> {
  const ip = getClientIp(await headers());
  const contactLimiter = getContactLimiter();
  if (contactLimiter) {
    const { success: rateLimitSuccess } = await contactLimiter.limit(ip);
    if (!rateLimitSuccess) {
      return {
        success: false,
        error: "Too many submissions. Please try again later.",
      };
    }
  }

  const parsed = ContactFormSchema.safeParse(data);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return { success: false, error: firstError.message };
  }

  const validatedData = parsed.data;

  try {
    const estimatorLeadId = data.estimatorLeadId?.trim() || null;
    const source = estimatorLeadId ? "estimator" : "contact";

    await prisma.contactSubmission.create({
      data: {
        name: validatedData.name.trim(),
        email: validatedData.email.trim().toLowerCase(),
        message: validatedData.message.trim(),
        source,
        estimatorLeadId,
      },
    });

    if (estimatorLeadId) {
      await prisma.estimatorLead.updateMany({
        where: { id: estimatorLeadId },
        data: { status: "CONVERTED" },
      });
    }

    try {
      const trimmedName = validatedData.name.trim();
      const trimmedEmail = validatedData.email.trim();
      const trimmedMessage = validatedData.message.trim();

      await sendInquiryNotification({
        name: trimmedName,
        email: trimmedEmail,
        message: trimmedMessage,
        source,
      });
      await sendContactConfirmation({
        name: trimmedName,
        email: trimmedEmail,
        source,
      });
    } catch (emailErr) {
      console.error("Notification email failed:", emailErr);
    }

    revalidatePath("/");
    revalidatePath("/admin/inbox");
    return { success: true };
  } catch (error) {
    console.error("Contact form submission error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
