export type SiteSettingsFixture = {
  id: string;
  notificationEmail: string | null;
  siteName: string | null;
  siteUrl: string | null;
  metaDescription: string | null;
  socialLinks: Record<string, string> | null;
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
  updatedAt: Date;
  paymentProvider: string;
};

export function buildSiteSettings(
  overrides: Partial<SiteSettingsFixture> = {},
): SiteSettingsFixture {
  return {
    id: "default",
    notificationEmail: "hello@devix.test",
    siteName: "Devix",
    siteUrl: "https://devix.test",
    metaDescription: "Devix studio website",
    socialLinks: { github: "https://github.com/devix" },
    maintenanceMode: false,
    maintenanceMessage: null,
    updatedAt: new Date("2026-06-01T00:00:00.000Z"),
    paymentProvider: "stripe",
    ...overrides,
  };
}
