import { describe, expect, it } from "vitest";
import * as projectQueries from "@/lib/queries/projects";

describe("project query exports", () => {
  it("exposes cached query functions", () => {
    expect(typeof projectQueries.getProjects).toBe("function");
    expect(typeof projectQueries.getFeaturedProjects).toBe("function");
    expect(typeof projectQueries.getFilterOptions).toBe("function");
  });
});
