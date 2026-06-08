import { describe, expect, it } from "vitest";
import { sanitizeHtml, sanitizeRichHtml } from "@/utils/sanitize";

describe("sanitizeHtml", () => {
  it("returns empty string for falsy input", () => {
    expect(sanitizeHtml("")).toBe("");
  });

  it("strips script tags", () => {
    const result = sanitizeHtml('<p>Hello</p><script>alert("x")</script>');
    expect(result).not.toContain("<script");
    expect(result).toContain("Hello");
  });

  it("allows basic formatting tags", () => {
    expect(sanitizeHtml("<strong>Bold</strong>")).toContain("<strong>");
  });
});

describe("sanitizeRichHtml", () => {
  it("allows list and heading tags", () => {
    const html = "<h2>Title</h2><ul><li>Item</li></ul>";
    const result = sanitizeRichHtml(html);
    expect(result).toContain("<h2>");
    expect(result).toContain("<ul>");
  });

  it("strips disallowed tags like iframe", () => {
    expect(sanitizeRichHtml('<iframe src="https://evil.test"></iframe>')).not.toContain(
      "<iframe",
    );
  });
});
