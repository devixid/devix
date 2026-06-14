import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetMockPrisma } from "@/lib/test/mocks/prisma";
import { getTestMocks } from "@/lib/test/mocks/registry";

// ── Prisma mock ────
vi.mock("@/lib/prisma", async () => {
  const { createMockPrisma } = await import("@/lib/test/mocks/prisma");
  const { getTestMocks } = await import("@/lib/test/mocks/registry");
  const { prisma, mocks } = createMockPrisma();
  getTestMocks().prisma = mocks;
  return { prisma };
});

import "@/lib/prisma"; // initialize mocks registry immediately

// ── Redis mock ────
vi.mock("@/lib/redis", () => {
  const cachedQuery = vi.fn(async (key: string, fetcher: () => any) => fetcher());
  const invalidateCache = vi.fn();
  (globalThis as any).__redisMocks = { cachedQuery, invalidateCache };
  return { cachedQuery, invalidateCache };
});

let mockCachedQuery: any;
let mockInvalidateCache: any;

import {
  getFaqItems,
  getServiceItems,
  getTeamMembers,
  getSiteSection,
  getSiteSettingsPublic,
  invalidateContentCache,
} from "@/lib/queries/site-content";
import {
  DEFAULT_FAQ_ITEMS,
  DEFAULT_SERVICE_ITEMS,
  DEFAULT_TEAM_MEMBERS,
  DEFAULT_SITE_SECTIONS,
} from "@/lib/content-defaults";

describe("site-content queries", () => {
  beforeEach(() => {
    mockCachedQuery = (globalThis as any).__redisMocks.cachedQuery;
    mockInvalidateCache = (globalThis as any).__redisMocks.invalidateCache;
    resetMockPrisma(getTestMocks().prisma!);
    mockCachedQuery.mockClear();
    mockInvalidateCache.mockClear();
  });

  describe("getFaqItems", () => {
    it("returns default FAQ items when DB is empty", async () => {
      getTestMocks().prisma!.faqItem.findMany.mockResolvedValue([]);
      const result = await getFaqItems();
      expect(result.length).toBe(DEFAULT_FAQ_ITEMS.length);
      expect(result[0].id).toContain("default-");
      expect(result[0].question).toBe(DEFAULT_FAQ_ITEMS[0].question);
    });

    it("returns visible FAQ items from DB when available", async () => {
      const mockDbFaqs = [
        { id: "faq_1", question: "Q1", answer: "A1", isVisible: true, order: 0 },
        { id: "faq_2", question: "Q2", answer: "A2", isVisible: true, order: 1 },
      ];
      getTestMocks().prisma!.faqItem.findMany.mockResolvedValue(mockDbFaqs);

      const result = await getFaqItems();
      expect(result).toEqual(mockDbFaqs);
      expect(getTestMocks().prisma!.faqItem.findMany).toHaveBeenCalledWith({
        where: { isVisible: true },
        orderBy: { order: "asc" },
      });
    });
  });

  describe("getServiceItems", () => {
    it("returns default service items when DB is empty", async () => {
      getTestMocks().prisma!.serviceItem.findMany.mockResolvedValue([]);
      const result = await getServiceItems();
      expect(result).toEqual(DEFAULT_SERVICE_ITEMS);
    });

    it("returns visible service items from DB", async () => {
      const mockDbServices = [
        { id: "srv_1", title: "S1", description: "D1", isVisible: true, order: 0 },
      ];
      getTestMocks().prisma!.serviceItem.findMany.mockResolvedValue(mockDbServices);

      const result = await getServiceItems();
      expect(result).toEqual(mockDbServices);
    });
  });

  describe("getTeamMembers", () => {
    it("returns default team members when DB is empty", async () => {
      getTestMocks().prisma!.teamMember.findMany.mockResolvedValue([]);
      const result = await getTeamMembers();
      expect(result).toEqual(DEFAULT_TEAM_MEMBERS);
    });

    it("returns mapped team members from DB with parsed social links", async () => {
      const mockDbTeam = [
        {
          id: "team_1",
          name: "Alice",
          title: "Lead",
          description: "Desc",
          imageUrl: "/img/alice.jpg",
          socialLinks: { github: "alice-git" },
          isVisible: true,
          order: 0,
        },
        {
          id: "team_2",
          name: "Bob",
          title: "Dev",
          description: "Desc",
          imageUrl: "/img/bob.jpg",
          socialLinks: null,
          isVisible: true,
          order: 1,
        },
      ];
      getTestMocks().prisma!.teamMember.findMany.mockResolvedValue(mockDbTeam);

      const result = await getTeamMembers();
      expect(result).toEqual([
        {
          name: "Alice",
          title: "Lead",
          description: "Desc",
          imageUrl: "/img/alice.jpg",
          socialLinks: { github: "alice-git" },
        },
        {
          name: "Bob",
          title: "Dev",
          description: "Desc",
          imageUrl: "/img/bob.jpg",
          socialLinks: {},
        },
      ]);
    });
  });

  describe("getSiteSection", () => {
    it("returns default site section content if section not found in DB", async () => {
      getTestMocks().prisma!.siteSection.findUnique.mockResolvedValue(null);
      const result = await getSiteSection("HERO");
      expect(result).toEqual(DEFAULT_SITE_SECTIONS["HERO"]);
    });

    it("returns section content from DB if available", async () => {
      const mockSection = {
        key: "HERO",
        content: { title: "Custom Title", subtitle: "Custom Sub" },
      };
      getTestMocks().prisma!.siteSection.findUnique.mockResolvedValue(mockSection);

      const result = await getSiteSection("HERO");
      expect(result).toEqual(mockSection.content);
      expect(getTestMocks().prisma!.siteSection.findUnique).toHaveBeenCalledWith({
        where: { key: "HERO" },
      });
    });
  });

  describe("getSiteSettingsPublic", () => {
    it("returns settings from DB", async () => {
      const mockSettings = { id: "default", maintenanceMode: false };
      getTestMocks().prisma!.siteSettings.findUnique.mockResolvedValue(mockSettings);

      const result = await getSiteSettingsPublic();
      expect(result).toEqual(mockSettings);
      expect(getTestMocks().prisma!.siteSettings.findUnique).toHaveBeenCalledWith({
        where: { id: "default" },
      });
    });
  });

  describe("invalidateContentCache", () => {
    it("invalidates all CMS keys", async () => {
      await invalidateContentCache();
      expect(mockInvalidateCache).toHaveBeenCalledWith(
        "content:faq",
        "content:services",
        "content:team",
        "content:settings",
        "content:section:HERO",
        "content:section:ABOUT",
        "content:section:SERVICES_INTRO",
        "content:section:TEAM_INTRO",
        "content:section:PORTFOLIO_INTRO",
        "content:section:TESTIMONIALS_INTRO",
        "content:section:CTA",
        "content:section:CONTACT",
        "content:section:FOOTER",
        "content:section:SEO",
      );
    });
  });
});
