import { describe, expect, it } from "vitest";
import { NavMenu } from "@/constants/nav";
import type { NavMenuInterface } from "@/interface";

function isNavMenuItem(item: unknown): item is NavMenuInterface {
  if (typeof item !== "object" || item === null) return false;
  const candidate = item as Record<string, unknown>;
  return typeof candidate.title === "string" && typeof candidate.id === "string";
}

describe("NavMenuInterface shape", () => {
  it("matches exported nav menu items", () => {
    for (const item of NavMenu) {
      expect(isNavMenuItem(item)).toBe(true);
    }
  });
});
