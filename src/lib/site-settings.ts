import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const DEFAULT_SETTINGS_ID = "default";

export type SocialLinks = {
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  github?: string;
};

export type SiteSettingsData = {
  notificationEmail: string | null;
  siteName: string | null;
  siteUrl: string | null;
  metaDescription: string | null;
  socialLinks: SocialLinks | null;
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
  paymentProvider: string;
};

function getSiteSettingsDelegate() {
  const delegate = prisma.siteSettings;
  if (!delegate || typeof delegate.findUnique !== "function") {
    return null;
  }
  return delegate;
}

export async function getSiteSettings(): Promise<SiteSettingsData | null> {
  const delegate = getSiteSettingsDelegate();
  if (!delegate) return null;

  try {
    const settings = await delegate.findUnique({
      where: { id: DEFAULT_SETTINGS_ID },
    });
    if (!settings) return null;
    return {
      notificationEmail: settings.notificationEmail,
      siteName: settings.siteName,
      siteUrl: settings.siteUrl,
      metaDescription: settings.metaDescription,
      socialLinks: (settings.socialLinks as SocialLinks) ?? null,
      maintenanceMode: settings.maintenanceMode,
      maintenanceMessage: settings.maintenanceMessage,
      paymentProvider: settings.paymentProvider,
    };
  } catch (error) {
    console.warn("[SiteSettings] Failed to read settings:", error);
    return null;
  }
}

export async function updateSiteSettings(
  data: Partial<SiteSettingsData>,
): Promise<void> {
  const delegate = getSiteSettingsDelegate();
  if (!delegate) {
    throw new Error(
      "Site settings are unavailable. Restart the dev server after running prisma generate.",
    );
  }

  const updateData: Prisma.SiteSettingsUpdateInput = {};
  if (data.notificationEmail !== undefined)
    updateData.notificationEmail = data.notificationEmail;
  if (data.siteName !== undefined) updateData.siteName = data.siteName;
  if (data.siteUrl !== undefined) updateData.siteUrl = data.siteUrl;
  if (data.metaDescription !== undefined)
    updateData.metaDescription = data.metaDescription;
  if (data.socialLinks !== undefined) {
    updateData.socialLinks = data.socialLinks ?? undefined;
  }
  if (data.maintenanceMode !== undefined)
    updateData.maintenanceMode = data.maintenanceMode;
  if (data.maintenanceMessage !== undefined)
    updateData.maintenanceMessage = data.maintenanceMessage;
  if (data.paymentProvider !== undefined)
    updateData.paymentProvider = data.paymentProvider;

  await delegate.upsert({
    where: { id: DEFAULT_SETTINGS_ID },
    create: {
      id: DEFAULT_SETTINGS_ID,
      notificationEmail: data.notificationEmail ?? null,
      siteName: data.siteName ?? null,
      siteUrl: data.siteUrl ?? null,
      metaDescription: data.metaDescription ?? null,
      socialLinks: data.socialLinks ?? undefined,
      maintenanceMode: data.maintenanceMode ?? false,
      maintenanceMessage: data.maintenanceMessage ?? null,
      paymentProvider: data.paymentProvider ?? "stripe",
    },
    update: updateData,
  });
}

export async function getNotificationEmail(): Promise<string | null> {
  const settings = await getSiteSettings();
  if (settings?.notificationEmail) return settings.notificationEmail;
  return process.env.RESEND_NOTIFY_TO || null;
}

export async function setNotificationEmail(
  email: string | null,
): Promise<void> {
  await updateSiteSettings({ notificationEmail: email });
}
