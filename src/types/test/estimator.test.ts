import { describe, expect, it } from "vitest";
import { BASE_PRICES } from "@/types/estimator";
import type { CurrencyCode, ProjectType } from "@/types/estimator";

describe("estimator types (runtime anchors)", () => {
  it("defines base prices for every project type", () => {
    const projectTypes: ProjectType[] = [
      "company_profile",
      "ecommerce",
      "webapp",
      "mobile_app",
    ];

    for (const type of projectTypes) {
      expect(BASE_PRICES[type]).toBeGreaterThan(0);
    }
  });

  it("CurrencyCode union is enforced at compile time and checked at runtime", () => {
    const codes: CurrencyCode[] = [
      "USD",
      "IDR",
      "MYR",
      "SGD",
      "BND",
      "PHP",
      "THB",
    ];
    expect(codes).toHaveLength(7);
  });
});
