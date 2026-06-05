"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { contactLimiter, getClientIp } from "@/lib/rate-limit";

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

  // Validasi server-side
  if (!data.name || data.name.trim().length < 2) {
    return { success: false, error: "Name must be at least 2 characters." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    return { success: false, error: "Please enter a valid email address." };
  }

  if (!data.message || data.message.trim().length < 10) {
    return { success: false, error: "Message must be at least 10 characters." };
  }

  try {
    await prisma.contactSubmission.create({
      data: {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        message: data.message.trim(),
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Contact form submission error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
