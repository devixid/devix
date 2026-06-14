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
  (globalThis as any).__mockCachedQuery = cachedQuery;
  return { cachedQuery };
});

let mockCachedQuery: any;

import {
  getProjects,
  getFeaturedProjects,
  getFilterOptions,
  getProjectBySlug,
} from "@/lib/queries/projects";
import { buildProject } from "@/lib/test/mocks/fixtures/project";

describe("project queries", () => {
  beforeEach(() => {
    mockCachedQuery = (globalThis as any).__mockCachedQuery;
    resetMockPrisma(getTestMocks().prisma!);
    mockCachedQuery.mockClear();
  });

  describe("getProjects", () => {
    it("returns visible projects ordered by createdAt desc", async () => {
      const p1 = buildProject({ id: "1", createdAt: new Date("2026-06-02") });
      const p2 = buildProject({ id: "2", createdAt: new Date("2026-06-01") });
      getTestMocks().prisma!.project.findMany.mockResolvedValue([p1, p2]);

      const result = await getProjects();
      expect(result).toEqual([p1, p2]);
      expect(getTestMocks().prisma!.project.findMany).toHaveBeenCalledWith({
        where: { isVisible: true },
        include: { techStacks: true, developers: true },
        orderBy: { createdAt: "desc" },
      });
    });
  });

  describe("getFeaturedProjects", () => {
    it("returns featured and visible projects ordered by featuredOrder asc, createdAt desc", async () => {
      const p1 = buildProject({ id: "1", isFeatured: true });
      getTestMocks().prisma!.project.findMany.mockResolvedValue([p1]);

      const result = await getFeaturedProjects();
      expect(result).toEqual([p1]);
      expect(getTestMocks().prisma!.project.findMany).toHaveBeenCalledWith({
        where: { isVisible: true, isFeatured: true },
        include: { techStacks: true, developers: true },
        orderBy: [{ featuredOrder: "asc" }, { createdAt: "desc" }],
      });
    });
  });

  describe("getFilterOptions", () => {
    it("returns categories, tech stacks, and developers list from distinct DB entries", async () => {
      getTestMocks().prisma!.project.findMany.mockResolvedValue([
        { category: "Web" },
        { category: "Mobile" },
      ]);
      getTestMocks().prisma!.projectTechStack.findMany.mockResolvedValue([
        { name: "Next.js" },
        { name: "React Native" },
      ]);
      getTestMocks().prisma!.projectDeveloper.findMany.mockResolvedValue([
        { name: "Alice" },
        { name: "Bob" },
      ]);

      const result = await getFilterOptions();
      expect(result).toEqual({
        categories: ["Web", "Mobile"],
        techStacks: ["Next.js", "React Native"],
        developers: ["Alice", "Bob"],
      });
    });
  });

  describe("getProjectBySlug", () => {
    it("returns project if found and visible", async () => {
      const p = buildProject({ slug: "test-slug" });
      getTestMocks().prisma!.project.findUnique.mockResolvedValue(p);

      const result = await getProjectBySlug("test-slug");
      expect(result).toEqual(p);
      expect(getTestMocks().prisma!.project.findUnique).toHaveBeenCalledWith({
        where: {
          slug: "test-slug",
          isVisible: true,
        },
        include: {
          techStacks: true,
          developers: true,
        },
      });
    });

    it("returns null if project not found or not visible", async () => {
      getTestMocks().prisma!.project.findUnique.mockResolvedValue(null);
      const result = await getProjectBySlug("missing-slug");
      expect(result).toBeNull();
    });
  });
});
