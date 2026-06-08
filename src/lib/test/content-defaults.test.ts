import { describe, expect, it } from "vitest";
import {
  DEFAULT_FAQ_ITEMS,
  DEFAULT_SERVICE_ITEMS,
  DEFAULT_SITE_SECTIONS,
  DEFAULT_TEAM_MEMBERS,
} from "@/lib/content-defaults";

describe("content defaults", () => {
  it("includes non-empty FAQ defaults", () => {
    expect(DEFAULT_FAQ_ITEMS.length).toBeGreaterThan(0);
    for (const item of DEFAULT_FAQ_ITEMS) {
      expect(item.question.length).toBeGreaterThan(3);
      expect(item.answer.length).toBeGreaterThan(10);
    }
  });

  it("includes service and team defaults", () => {
    expect(DEFAULT_SERVICE_ITEMS.length).toBeGreaterThan(0);
    expect(DEFAULT_TEAM_MEMBERS.length).toBeGreaterThan(0);
  });

  it("defines all site section defaults", () => {
    expect(DEFAULT_SITE_SECTIONS.HERO.headline.length).toBeGreaterThan(0);
    expect(DEFAULT_SITE_SECTIONS.CONTACT.email).toContain("@");
    expect(DEFAULT_SITE_SECTIONS.FOOTER.navLinks.length).toBeGreaterThan(0);
    expect(DEFAULT_SITE_SECTIONS.SEO.keywords.length).toBeGreaterThan(0);
  });
});
