"use server";

import { prisma } from "@/lib/prisma";
import type { SocialLinks } from "@/lib/site-settings";
import {
  getNotificationEmail,
  setNotificationEmail,
  getSiteSettings,
  updateSiteSettings,
} from "@/lib/site-settings";
import { invalidateContentCache } from "@/lib/queries/site-content";
import { invalidateCache } from "@/lib/redis";
import { logActivity } from "@/lib/activity-log";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import {
  verifyAdminSession,
  verifyCsrfOrigin,
  getSessionCookie,
} from "@/lib/auth";
import { ChangePasswordSchema, RegisterSchema } from "@/lib/schemas";
import { getRegisterLimiter, getClientIp } from "@/lib/rate-limit";
import { headers } from "next/headers";
import {
  getPaymentProviderStatus,
  isPaymentProviderId,
  type PaymentProviderId,
} from "@/lib/payment/config";

const MAX_TEAM_MEMBERS = 4;

export async function getTeamMembers() {
  await verifyAdminSession();

  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getTeamSlotInfo() {
  await verifyAdminSession();
  const count = await prisma.user.count({ where: { isActive: true } });
  return { count, max: MAX_TEAM_MEMBERS, canInvite: count < MAX_TEAM_MEMBERS };
}

export async function inviteTeamMember(formData: FormData) {
  await verifyAdminSession();
  await verifyCsrfOrigin();

  const ip = getClientIp(await headers());
  const registerLimiter = getRegisterLimiter();
  if (registerLimiter) {
    const { success } = await registerLimiter.limit(ip);
    if (!success) {
      throw new Error(
        "Too many registration attempts. Please try again later.",
      );
    }
  }

  const parsed = RegisterSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const { email, password, firstName, lastName } = parsed.data;

  const userCount = await prisma.user.count({ where: { isActive: true } });
  if (userCount >= MAX_TEAM_MEMBERS) {
    throw new Error(
      `Maximum user limit reached. Only ${MAX_TEAM_MEMBERS} administrators are allowed.`,
    );
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("Email is already registered.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      hashedPassword,
      firstName: firstName || null,
      lastName: lastName || null,
    },
  });

  return { success: true };
}

export async function changeOwnPassword(formData: FormData) {
  await verifyAdminSession();
  await verifyCsrfOrigin();

  const session = await getSessionCookie();
  if (!session?.email) {
    throw new Error("Session not found.");
  }

  const parsed = ChangePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const { currentPassword, newPassword } = parsed.data;
  const email = session.email as string;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.hashedPassword) {
    throw new Error("User not found.");
  }

  const isValid = await bcrypt.compare(currentPassword, user.hashedPassword);
  if (!isValid) {
    throw new Error("Current password is incorrect.");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { hashedPassword },
  });

  return { success: true };
}

export async function getNotificationEmailSetting() {
  await verifyAdminSession();
  return getNotificationEmail();
}

export async function updateNotificationEmail(email: string) {
  await verifyAdminSession();
  await verifyCsrfOrigin();

  const trimmed = email.trim();
  if (trimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    throw new Error("Please enter a valid email address.");
  }

  await setNotificationEmail(trimmed || null);
  await logActivity({
    action: "settings.notification_email",
    entityType: "SiteSettings",
  });
  return { success: true };
}

export async function getExtendedSiteSettings() {
  await verifyAdminSession();
  return getSiteSettings();
}

export async function updateExtendedSiteSettings(data: {
  siteName?: string;
  siteUrl?: string;
  metaDescription?: string;
  socialLinks?: SocialLinks;
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
}) {
  await verifyAdminSession();
  await verifyCsrfOrigin();
  await updateSiteSettings(data);
  await invalidateContentCache();
  revalidatePath("/");
  revalidatePath("/admin/settings");
  await logActivity({ action: "settings.updated", entityType: "SiteSettings" });
  return { success: true };
}

export async function revalidatePublicCache() {
  await verifyAdminSession();
  await verifyCsrfOrigin();

  await invalidateContentCache();
  await invalidateCache(
    "projects:all",
    "projects:featured",
    "projects:filters",
    "testimonials:visible",
    "analytics:summary:7",
    "analytics:summary:30",
    "analytics:summary:90",
  );
  revalidatePath("/", "layout");
  revalidatePath("/projects");
  await logActivity({ action: "cache.revalidated", entityType: "System" });
  return { success: true };
}

export async function getPaymentSettings() {
  await verifyAdminSession();
  const settings = await getSiteSettings();
  const activeProvider: PaymentProviderId =
    settings?.paymentProvider && isPaymentProviderId(settings.paymentProvider)
      ? settings.paymentProvider
      : "stripe";

  return {
    activeProvider,
    stripe: getPaymentProviderStatus("stripe"),
    lemonsqueezy: getPaymentProviderStatus("lemonsqueezy"),
  };
}

export async function updatePaymentProvider(provider: PaymentProviderId) {
  await verifyAdminSession();
  await verifyCsrfOrigin();

  if (!isPaymentProviderId(provider)) {
    throw new Error("Invalid payment provider.");
  }

  const status = getPaymentProviderStatus(provider);
  if (!status.configured) {
    throw new Error(
      `Cannot switch to ${provider}: missing ${status.missing.join(", ")} in environment variables.`,
    );
  }

  await updateSiteSettings({ paymentProvider: provider });
  revalidatePath("/store");
  revalidatePath("/store/checkout");
  revalidatePath("/admin/settings");
  await logActivity({
    action: "settings.payment_provider",
    entityType: "SiteSettings",
    metadata: { paymentProvider: provider },
  });
  return { success: true };
}

export async function deactivateTeamMember(memberId: string) {
  await verifyAdminSession();
  await verifyCsrfOrigin();

  const session = await getSessionCookie();
  if (!session?.userId) throw new Error("Session not found.");
  if (session.userId === memberId) {
    throw new Error("You cannot deactivate your own account.");
  }

  const member = await prisma.user.findUnique({ where: { id: memberId } });
  if (!member) throw new Error("Member not found.");

  await prisma.user.update({
    where: { id: memberId },
    data: { isActive: false },
  });

  await logActivity({
    action: "team.deactivated",
    entityType: "User",
    entityId: memberId,
    metadata: { email: member.email },
  });

  revalidatePath("/admin/settings");
  return { success: true };
}
