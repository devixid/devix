import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { cachedQuery, invalidateCache } from "@/lib/redis";
import type { SiteSectionKey } from "@prisma/client";
import {
  DEFAULT_FAQ_ITEMS,
  DEFAULT_SERVICE_ITEMS,
  DEFAULT_TEAM_MEMBERS,
  DEFAULT_SITE_SECTIONS,
  type SiteSectionContentMap,
} from "@/lib/content-defaults";

/** Align with ISR revalidate (3600s); admin invalidates on publish */
const CONTENT_TTL = 3600;

export const getFaqItems = cache(async () => {
  return cachedQuery(
    "content:faq",
    async () => {
      const items = await prisma.faqItem.findMany({
        where: { isVisible: true },
        orderBy: { order: "asc" },
      });
      if (items.length === 0) {
        return DEFAULT_FAQ_ITEMS.map((item, order) => ({
          ...item,
          id: `default-${order}`,
        }));
      }
      return items;
    },
    CONTENT_TTL,
  );
});

export const getServiceItems = cache(async () => {
  return cachedQuery(
    "content:services",
    async () => {
      const items = await prisma.serviceItem.findMany({
        where: { isVisible: true },
        orderBy: { order: "asc" },
      });
      if (items.length === 0) return DEFAULT_SERVICE_ITEMS;
      return items;
    },
    CONTENT_TTL,
  );
});

export const getTeamMembers = cache(async () => {
  return cachedQuery(
    "content:team",
    async () => {
      const items = await prisma.teamMember.findMany({
        where: { isVisible: true },
        orderBy: { order: "asc" },
      });
      if (items.length === 0) {
        return DEFAULT_TEAM_MEMBERS;
      }
      return items.map((m) => ({
        name: m.name,
        title: m.title,
        description: m.description,
        imageUrl: m.imageUrl,
        socialLinks:
          (m.socialLinks as { github?: string; linkedin?: string }) ?? {},
      }));
    },
    CONTENT_TTL,
  );
});

export const getSiteSection = cache(
  async <K extends SiteSectionKey>(
    key: K,
  ): Promise<SiteSectionContentMap[K]> => {
    return cachedQuery(
      `content:section:${key}`,
      async () => {
        const section = await prisma.siteSection.findUnique({ where: { key } });
        if (section?.content && typeof section.content === "object") {
          return section.content as SiteSectionContentMap[K];
        }
        return DEFAULT_SITE_SECTIONS[key];
      },
      CONTENT_TTL,
    );
  },
);

export const getSiteSettingsPublic = cache(async () => {
  return cachedQuery(
    "content:settings",
    async () => {
      const settings = await prisma.siteSettings.findUnique({
        where: { id: "default" },
      });
      return settings;
    },
    CONTENT_TTL,
  );
});

export async function invalidateContentCache() {
  const sectionKeys: SiteSectionKey[] = [
    "HERO",
    "ABOUT",
    "SERVICES_INTRO",
    "TEAM_INTRO",
    "PORTFOLIO_INTRO",
    "TESTIMONIALS_INTRO",
    "CTA",
    "CONTACT",
    "FOOTER",
    "SEO",
  ];
  await invalidateCache(
    "content:faq",
    "content:services",
    "content:team",
    "content:settings",
    ...sectionKeys.map((k) => `content:section:${k}`),
  );
}
