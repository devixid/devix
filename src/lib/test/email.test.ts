import { describe, expect, it } from "vitest";
import { escapeHtml } from "@/lib/email";

describe("escapeHtml", () => {
  it("escapes HTML-sensitive characters", () => {
    expect(escapeHtml(`Tom & Jerry <script>"hi"</script>`)).toBe(
      "Tom &amp; Jerry &lt;script&gt;&quot;hi&quot;&lt;/script&gt;",
    );
  });

  it("escapes single quotes", () => {
    expect(escapeHtml("it's")).toBe("it&#39;s");
  });
});
