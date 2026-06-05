"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { contactLimiter, getClientIp } from "@/lib/rate-limit";

import { ContactFormSchema } from "@/lib/schemas";

type ContactFormData = {
  name: string;
  email: string;
  message: string;
};

type ActionResult = {
  success: boolean;
  error?: string;
};

export async function submitContactForm(
  data: ContactFormData,
): Promise<ActionResult> {
  const ip = getClientIp(await headers());
  const { success: rateLimitSuccess } = await contactLimiter.limit(ip);
  if (!rateLimitSuccess) {
    return {
      success: false,
      error: "Too many submissions. Please try again later.",
    };
  }

  const parsed = ContactFormSchema.safeParse(data);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return { success: false, error: firstError.message };
  }

  const validatedData = parsed.data;

  try {
    await prisma.contactSubmission.create({
      data: {
        name: validatedData.name.trim(),
        email: validatedData.email.trim().toLowerCase(),
        message: validatedData.message.trim(),
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Contact form submission error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
