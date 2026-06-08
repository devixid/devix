import { describe, expect, it } from "vitest";
import * as siteContentQueries from "@/lib/queries/site-content";

describe("site content query exports", () => {
  it("exposes cached CMS query functions", () => {
    expect(typeof siteContentQueries.getFaqItems).toBe("function");
    expect(typeof siteContentQueries.getServiceItems).toBe("function");
    expect(typeof siteContentQueries.getTeamMembers).toBe("function");
    expect(typeof siteContentQueries.getSiteSection).toBe("function");
    expect(typeof siteContentQueries.getSiteSettingsPublic).toBe("function");
    expect(typeof siteContentQueries.invalidateContentCache).toBe("function");
  });
});
