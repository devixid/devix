import { describe, expect, it } from "vitest";
import { toProjectListItem, toProjectListItems } from "@/lib/mappers/projects";

const project = {
  id: "proj_1",
  slug: "sample-app",
  title: "Sample App",
  category: "Web App",
  imageUrl: "https://cdn.example/image.png",
  description: "A sample project description.",
  content: null,
  liveUrl: "https://sample.example",
  githubUrl: null,
  isVisible: true,
  isFeatured: false,
  featuredOrder: 0,
  completedAt: new Date("2026-01-15T00:00:00.000Z"),
  createdAt: "2026-01-01T12:00:00.000Z",
  updatedAt: new Date("2026-01-01T12:00:00.000Z"),
  techStacks: [{ id: "ts_1", name: "Next.js", projectId: "proj_1" }],
  developers: [{ id: "dev_1", name: "Alex", projectId: "proj_1", role: "Lead" }],
};

describe("toProjectListItem", () => {
  it("maps prisma project rows to serializable list items", () => {
    expect(toProjectListItem(project)).toEqual({
      id: "proj_1",
      slug: "sample-app",
      title: "Sample App",
      category: "Web App",
      imageUrl: "https://cdn.example/image.png",
      description: "A sample project description.",
      liveUrl: "https://sample.example",
      githubUrl: null,
      completedAt: "2026-01-15T00:00:00.000Z",
      createdAt: "2026-01-01T12:00:00.000Z",
      techStacks: [{ id: "ts_1", name: "Next.js" }],
      developers: [{ id: "dev_1", name: "Alex" }],
    });
  });

  it("preserves string dates without re-parsing", () => {
    const withStringDates = {
      ...project,
      createdAt: "2026-02-01T00:00:00.000Z",
      completedAt: "2026-02-02T00:00:00.000Z",
    };
    expect(toProjectListItem(withStringDates).createdAt).toBe(
      "2026-02-01T00:00:00.000Z",
    );
  });
});

describe("toProjectListItems", () => {
  it("maps arrays", () => {
    expect(toProjectListItems([project])).toHaveLength(1);
    expect(toProjectListItems([project])[0]?.slug).toBe("sample-app");
  });
});
