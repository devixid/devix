import { describe, expect, it } from "vitest";
import {
  formatComplexity,
  formatPlatform,
  formatProjectType,
  formatScope,
  getScopeHeading,
  getScopeSubheading,
  getScopeOptions,
  getScopeCopy,
  formatDesignApproachLabel,
  formatTimeline,
} from "@/lib/estimator-labels";

describe("formatProjectType", () => {
  it("returns em dash for missing values", () => {
    expect(formatProjectType(null)).toBe("—");
    expect(formatProjectType(undefined)).toBe("—");
  });

  it("maps known project types", () => {
    expect(formatProjectType("webapp")).toBe("Custom Web App");
  });
});

describe("getScopeHeading and getScopeSubheading", () => {
  it("uses app-specific copy for web and mobile apps", () => {
    expect(getScopeHeading("webapp")).toContain("app");
    expect(getScopeHeading("company_profile")).toContain("project");

    expect(getScopeSubheading("mobile_app")).toContain("screens");
    expect(getScopeSubheading("ecommerce")).toContain("pages");
  });
});

describe("getScopeOptions", () => {
  it("returns three scope tiers", () => {
    expect(getScopeOptions("company_profile")).toHaveLength(3);
    expect(getScopeOptions("mobile_app")[0]?.id).toBe("small");
  });
});

describe("getScopeCopy", () => {
  it("returns full ScopeCopy object", () => {
    const copy = getScopeCopy("company_profile", "medium");
    expect(copy.label).toBe("5 - 15 Pages");
    expect(copy.heading).toContain("large");
  });
});

describe("formatScope", () => {
  it("returns em dash for missing values", () => {
    expect(formatScope(null)).toBe("—");
  });

  it("uses page labels for websites and screen labels for apps", () => {
    expect(formatScope("medium", "company_profile")).toContain("Pages");
    expect(formatScope("medium", "mobile_app")).toContain("Screens");
  });
});

describe("formatPlatform", () => {
  it("returns em dash for missing values", () => {
    expect(formatPlatform(null)).toBe("—");
  });

  it("formats enum labels", () => {
    expect(formatPlatform("both")).toBe("Both Platforms");
  });
});

describe("formatDesignApproachLabel", () => {
  it("returns em dash for missing values", () => {
    expect(formatDesignApproachLabel(null)).toBe("—");
  });

  it("formats design labels", () => {
    expect(formatDesignApproachLabel("template")).toBe("Template Design");
    expect(formatDesignApproachLabel("custom")).toBe("Custom Design");
  });
});

describe("formatComplexity", () => {
  it("returns em dash for missing values", () => {
    expect(formatComplexity(null)).toBe("—");
  });

  it("formats complexity", () => {
    expect(formatComplexity("premium")).toBe("Premium");
  });
});

describe("formatTimeline", () => {
  it("returns em dash for missing values", () => {
    expect(formatTimeline(null)).toBe("—");
  });

  it("formats timeline", () => {
    expect(formatTimeline("rush")).toBe("Rush (<4 weeks)");
  });
});
