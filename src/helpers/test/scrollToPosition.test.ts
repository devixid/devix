import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { scrollToPosition } from "@/helpers";

describe("scrollToPosition", () => {
  const scrollTo = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("window", { scrollTo });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    scrollTo.mockReset();
  });

  it("scrolls smoothly by default", () => {
    scrollToPosition({ targetX: 10, targetY: 200, smooth: true });

    expect(scrollTo).toHaveBeenCalledWith({
      top: 200,
      left: 10,
      behavior: "smooth",
    });
  });

  it("uses instant scroll when smooth is false", () => {
    scrollToPosition({ targetX: 0, targetY: 0, smooth: false });

    expect(scrollTo).toHaveBeenCalledWith({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  });
});
