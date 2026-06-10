import { describe, expect, it } from "vitest";
import { privacyPolicy } from "@/content/legal/privacy";
import { termsOfService } from "@/content/legal/terms";

function assertLegalDocument(doc: {
  readonly title: string;
  readonly lastUpdated: string;
  readonly sections: ReadonlyArray<{
    readonly heading: string;
    readonly body: string;
  }>;
}) {
  expect(doc.title.length).toBeGreaterThan(0);
  expect(doc.lastUpdated.length).toBeGreaterThan(0);
  expect(doc.sections.length).toBeGreaterThan(0);
  for (const section of doc.sections) {
    expect(section.heading.trim().length).toBeGreaterThan(0);
    expect(section.body.trim().length).toBeGreaterThan(0);
  }
}

describe("legal content", () => {
  it("privacy policy has structured sections", () => {
    assertLegalDocument(privacyPolicy);
    expect(privacyPolicy.sections.some((s) => s.heading === "Introduction")).toBe(
      true,
    );
  });

  it("terms of service has structured sections", () => {
    assertLegalDocument(termsOfService);
    expect(termsOfService.sections.some((s) => s.heading === "Agreement")).toBe(
      true,
    );
  });
});
