import { describe, expect, it } from "vitest";
import {
  formatMinor,
  getStripeMinimumMinor,
  isAboveStripeMinimum,
  isZeroDecimalCurrency,
  minorToMajor,
  priceToMinor,
  resolveProductAmount,
  toStripeAmount,
} from "@/lib/money";

describe("isZeroDecimalCurrency", () => {
  it("recognizes JPY as zero-decimal", () => {
    expect(isZeroDecimalCurrency("JPY")).toBe(true);
    expect(isZeroDecimalCurrency("usd")).toBe(false);
  });
});

describe("priceToMinor", () => {
  it("multiplies by 100 for USD", () => {
    expect(priceToMinor(19.99, "usd")).toBe(1999);
  });

  it("rounds for zero-decimal currencies", () => {
    expect(priceToMinor(1500.4, "jpy")).toBe(1500);
  });
});

describe("toStripeAmount", () => {
  it("accepts valid integer minor units", () => {
    expect(toStripeAmount(500)).toBe(500);
  });

  it("rejects negative or non-integer values", () => {
    expect(() => toStripeAmount(-1)).toThrow(/Invalid priceMinor/);
    expect(() => toStripeAmount(1.5)).toThrow(/Invalid priceMinor/);
  });
});

describe("getStripeMinimumMinor / isAboveStripeMinimum", () => {
  it("uses currency-specific minimums", () => {
    expect(getStripeMinimumMinor("idr")).toBe(10000);
    expect(isAboveStripeMinimum(9999, "idr")).toBe(false);
    expect(isAboveStripeMinimum(10000, "idr")).toBe(true);
  });
});

describe("resolveProductAmount", () => {
  it("prefers priceMinor when set", () => {
    expect(
      resolveProductAmount({
        price: 9.99,
        priceMinor: 999,
        currency: "USD",
      }),
    ).toEqual({ amountMinor: 999, currency: "usd" });
  });

  it("derives minor units from legacy float price", () => {
    expect(
      resolveProductAmount({
        price: 10,
        priceMinor: null,
        currency: "USD",
      }),
    ).toEqual({ amountMinor: 1000, currency: "usd" });
  });
});

describe("minorToMajor / formatMinor", () => {
  it("converts USD minor to major units", () => {
    expect(minorToMajor(2500, "usd")).toBe(25);
  });

  it("formats USD amounts", () => {
    expect(formatMinor(1999, "usd")).toMatch(/\$19\.99/);
  });
});
