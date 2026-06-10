import { describe, expect, it } from "vitest";
import { cn } from "@/utils/cn-merge";

describe("cn", () => {
  it("merges tailwind classes and resolves conflicts", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("handles conditional classes", () => {
    const includeHidden = false;
    expect(cn("base", includeHidden && "hidden", "block")).toBe("base block");
  });
});
