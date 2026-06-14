import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetMockPrisma } from "@/lib/test/mocks/prisma";
import { getTestMocks } from "@/lib/test/mocks/registry";

// ── Prisma mock ────────────────────────────────────────────────────────────────

vi.mock("@/lib/prisma", async () => {
  const { createMockPrisma } = await import("@/lib/test/mocks/prisma");
  const { getTestMocks } = await import("@/lib/test/mocks/registry");
  const { prisma, mocks } = createMockPrisma();
  getTestMocks().prisma = mocks;
  return { prisma };
});

import {
  getSiteSettings,
  getNotificationEmail,
  updateSiteSettings,
} from "@/lib/site-settings";

// ── Fixtures ───────────────────────────────────────────────────────────────────

const settingsRow = {
  id: "default",
  notificationEmail: "admin@devix.test",
  siteName: "Devix",
  siteUrl: "https://devix.test",
  metaDescription: "Premium web agency.",
  socialLinks: { twitter: "@devix" },
  maintenanceMode: false,
  maintenanceMessage: null,
  paymentProvider: "stripe",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

// ── getSiteSettings ────────────────────────────────────────────────────────────

describe("getSiteSettings", () => {
  beforeEach(() => {
    resetMockPrisma(getTestMocks().prisma!);
  });

  it("returns null when the settings row does not exist", async () => {
    getTestMocks().prisma!.siteSettings.findUnique.mockResolvedValue(null);
    const result = await getSiteSettings();
    expect(result).toBeNull();
  });

  it("returns mapped settings when the row exists", async () => {
    getTestMocks().prisma!.siteSettings.findUnique.mockResolvedValue(
      settingsRow,
    );

    const result = await getSiteSettings();

    expect(result).toEqual({
      notificationEmail: "admin@devix.test",
      siteName: "Devix",
      siteUrl: "https://devix.test",
      metaDescription: "Premium web agency.",
      socialLinks: { twitter: "@devix" },
      maintenanceMode: false,
      maintenanceMessage: null,
      paymentProvider: "stripe",
    });
  });

  it("returns null on DB error and does not throw", async () => {
    getTestMocks().prisma!.siteSettings.findUnique.mockRejectedValue(
      new Error("DB connection failed"),
    );

    const result = await getSiteSettings();
    expect(result).toBeNull();
  });

  it("returns null when socialLinks is null", async () => {
    getTestMocks().prisma!.siteSettings.findUnique.mockResolvedValue({
      ...settingsRow,
      socialLinks: null,
    });

    const result = await getSiteSettings();
    expect(result?.socialLinks).toBeNull();
  });
});

// ── updateSiteSettings ─────────────────────────────────────────────────────────

describe("updateSiteSettings", () => {
  beforeEach(() => {
    resetMockPrisma(getTestMocks().prisma!);
    getTestMocks().prisma!.siteSettings.upsert.mockResolvedValue(settingsRow);
  });

  it("calls upsert with updated notificationEmail", async () => {
    await updateSiteSettings({ notificationEmail: "new@devix.test" });

    expect(getTestMocks().prisma!.siteSettings.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({
          notificationEmail: "new@devix.test",
        }),
      }),
    );
  });

  it("calls upsert with updated maintenanceMode", async () => {
    await updateSiteSettings({ maintenanceMode: true });

    expect(getTestMocks().prisma!.siteSettings.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({ maintenanceMode: true }),
      }),
    );
  });

  it("does not include fields not provided in the partial update", async () => {
    await updateSiteSettings({ siteName: "Devix Pro" });

    const updateArg =
      getTestMocks().prisma!.siteSettings.upsert.mock.calls[0][0].update;
    expect(updateArg).not.toHaveProperty("notificationEmail");
    expect(updateArg).not.toHaveProperty("maintenanceMode");
  });

  it("passes correct create defaults when upserting", async () => {
    await updateSiteSettings({ siteName: "Devix Pro" });

    const createArg =
      getTestMocks().prisma!.siteSettings.upsert.mock.calls[0][0].create;
    expect(createArg.id).toBe("default");
    expect(createArg.maintenanceMode).toBe(false);
    expect(createArg.paymentProvider).toBe("stripe");
  });

  it("sets socialLinks to undefined (remove) when null is passed", async () => {
    await updateSiteSettings({ socialLinks: null });

    const updateArg =
      getTestMocks().prisma!.siteSettings.upsert.mock.calls[0][0].update;
    expect(updateArg.socialLinks).toBeUndefined();
  });
});

// ── getNotificationEmail ───────────────────────────────────────────────────────

describe("getNotificationEmail", () => {
  beforeEach(() => {
    resetMockPrisma(getTestMocks().prisma!);
    delete process.env.RESEND_NOTIFY_TO;
  });

  afterEach(() => {
    delete process.env.RESEND_NOTIFY_TO;
  });

  it("returns notificationEmail from settings when available", async () => {
    getTestMocks().prisma!.siteSettings.findUnique.mockResolvedValue(
      settingsRow,
    );

    const email = await getNotificationEmail();
    expect(email).toBe("admin@devix.test");
  });

  it("falls back to RESEND_NOTIFY_TO env when settings has no email", async () => {
    getTestMocks().prisma!.siteSettings.findUnique.mockResolvedValue({
      ...settingsRow,
      notificationEmail: null,
    });
    process.env.RESEND_NOTIFY_TO = "fallback@devix.test";

    const email = await getNotificationEmail();
    expect(email).toBe("fallback@devix.test");
  });

  it("returns null when neither settings nor env is set", async () => {
    getTestMocks().prisma!.siteSettings.findUnique.mockResolvedValue(null);

    const email = await getNotificationEmail();
    expect(email).toBeNull();
  });

  it("returns settings email over env fallback when both are present", async () => {
    getTestMocks().prisma!.siteSettings.findUnique.mockResolvedValue(
      settingsRow,
    );
    process.env.RESEND_NOTIFY_TO = "env@devix.test";

    const email = await getNotificationEmail();
    expect(email).toBe("admin@devix.test");
  });
});
