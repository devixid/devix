import { describe, expect, it } from "vitest";
import {
  formatComplexity,
  formatPlatform,
  formatProjectType,
  formatScope,
  getScopeHeading,
  getScopeOptions,
} from "@/lib/estimator-labels";

describe("formatProjectType", () => {
  it("returns em dash for missing values", () => {
    expect(formatProjectType(null)).toBe("—");
  });

  it("maps known project types", () => {
    expect(formatProjectType("webapp")).toBe("Custom Web App");
  });
});

describe("getScopeHeading", () => {
  it("uses app-specific copy for web and mobile apps", () => {
    expect(getScopeHeading("webapp")).toContain("app");
    expect(getScopeHeading("company_profile")).toContain("project");
  });
});

describe("getScopeOptions", () => {
  it("returns three scope tiers", () => {
    expect(getScopeOptions("company_profile")).toHaveLength(3);
    expect(getScopeOptions("mobile_app")[0]?.id).toBe("small");
  });
});

describe("formatScope", () => {
  it("uses page labels for websites and screen labels for apps", () => {
    expect(formatScope("medium", "company_profile")).toContain("Pages");
    expect(formatScope("medium", "mobile_app")).toContain("Screens");
  });
});

describe("formatPlatform / formatComplexity", () => {
  it("formats enum labels", () => {
    expect(formatPlatform("both")).toBe("Both Platforms");
    expect(formatComplexity("premium")).toBe("Premium");
  });
});
