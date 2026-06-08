import { describe, expect, it } from "vitest";
import {
  convertUsdToCurrency,
  CURRENCIES,
  detectDefaultCurrency,
  formatEstimatePrice,
  isValidCurrencyCode,
} from "@/lib/estimator-format";

describe("CURRENCIES", () => {
  it("lists supported currency codes", () => {
    expect(CURRENCIES.map((c) => c.code)).toContain("IDR");
    expect(CURRENCIES.map((c) => c.code)).toContain("USD");
  });
});

describe("convertUsdToCurrency", () => {
  it("multiplies by the provided rate", () => {
    expect(convertUsdToCurrency(100, "IDR", { IDR: 18000 })).toBe(1_800_000);
  });

  it("falls back to 1 when rates are missing", () => {
    expect(convertUsdToCurrency(50, "USD", null)).toBe(50);
  });
});

describe("formatEstimatePrice", () => {
  it("rounds IDR to nearest thousand", () => {
    expect(formatEstimatePrice(1_234_567, "IDR")).toMatch(/Rp/);
    expect(formatEstimatePrice(1_234_567, "IDR")).not.toContain("234");
  });
});

describe("isValidCurrencyCode", () => {
  it("narrows unknown strings", () => {
    expect(isValidCurrencyCode("SGD")).toBe(true);
    expect(isValidCurrencyCode("EUR")).toBe(false);
    expect(isValidCurrencyCode(123)).toBe(false);
  });
});

describe("detectDefaultCurrency", () => {
  it("returns USD when navigator is unavailable", () => {
    expect(detectDefaultCurrency()).toBe("USD");
  });
});
