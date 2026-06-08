import { describe, expect, it } from "vitest";
import {
  FOOTER_EXPLORE_LINKS,
  NavMenu,
  resolveFooterExploreLinks,
} from "@/constants/nav";

describe("NavMenu", () => {
  it("includes core sections and estimator", () => {
    const ids = NavMenu.map((item) => item.id);
    expect(ids).toContain("#home");
    expect(ids).toContain("/estimator");
  });
});

describe("resolveFooterExploreLinks", () => {
  it("falls back to defaults when CMS links are empty", () => {
    expect(resolveFooterExploreLinks([])).toEqual(FOOTER_EXPLORE_LINKS);
    expect(resolveFooterExploreLinks(undefined)).toEqual(FOOTER_EXPLORE_LINKS);
  });

  it("returns CMS links unchanged when estimator is present", () => {
    const cms = [
      { label: "Home", href: "#home" },
      { label: "Estimator", href: "/estimator" },
    ];
    expect(resolveFooterExploreLinks(cms)).toEqual(cms);
  });

  it("inserts estimator before contact when missing", () => {
    const cms = [
      { label: "Home", href: "#home" },
      { label: "Contact", href: "#contact" },
    ];
    expect(resolveFooterExploreLinks(cms)).toEqual([
      { label: "Home", href: "#home" },
      { label: "Estimator", href: "/estimator" },
      { label: "Contact", href: "#contact" },
    ]);
  });

  it("appends estimator when contact link is absent", () => {
    const cms = [{ label: "Home", href: "#home" }];
    expect(resolveFooterExploreLinks(cms)).toEqual([
      { label: "Home", href: "#home" },
      { label: "Estimator", href: "/estimator" },
    ]);
  });
});
