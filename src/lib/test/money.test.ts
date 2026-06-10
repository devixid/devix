import { describe, expect, it } from "vitest";
import {
  Decimal,
  decimalFromMajorPrice,
  decimalFromNumber,
  formatMinor,
  formatUsdDecimal,
  getStripeMinimumMinor,
  isAboveStripeMinimum,
  isZeroDecimalCurrency,
  minorToMajor,
  minorToStripeUnit,
  priceToMinor,
  resolveProductAmount,
  stripeUnitToMinor,
} from "@/lib/money";

describe("isZeroDecimalCurrency", () => {
  it("recognizes JPY as zero-decimal", () => {
    expect(isZeroDecimalCurrency("JPY")).toBe(true);
    expect(isZeroDecimalCurrency("usd")).toBe(false);
  });
});

describe("priceToMinor", () => {
  it("multiplies by 100 for USD", () => {
    expect(priceToMinor(19.99, "usd").toString()).toBe("1999");
  });

  it("rounds for zero-decimal currencies", () => {
    expect(priceToMinor(1500.4, "jpy").toString()).toBe("1500");
  });
});

describe("minorToStripeUnit", () => {
  it("accepts valid integer minor units", () => {
    expect(minorToStripeUnit(decimalFromNumber(500))).toBe(500);
  });

  it("rejects negative or non-integer values", () => {
    expect(() => minorToStripeUnit(decimalFromNumber(-1))).toThrow(
      /Invalid priceMinor/,
    );
    expect(() => minorToStripeUnit(new Decimal("1.5"))).toThrow(
      /Invalid priceMinor/,
    );
  });
});

describe("stripeUnitToMinor", () => {
  it("wraps webhook integers as Decimal", () => {
    expect(stripeUnitToMinor(2500).toString()).toBe("2500");
  });

  it("rejects invalid values", () => {
    expect(() => stripeUnitToMinor(-1)).toThrow(/Invalid Stripe unit amount/);
  });
});

describe("getStripeMinimumMinor / isAboveStripeMinimum", () => {
  it("uses currency-specific minimums", () => {
    expect(getStripeMinimumMinor("idr").toString()).toBe("10000");
    expect(isAboveStripeMinimum(decimalFromNumber(9999), "idr")).toBe(false);
    expect(isAboveStripeMinimum(decimalFromNumber(10000), "idr")).toBe(true);
  });
});

describe("resolveProductAmount", () => {
  it("prefers priceMinor when set", () => {
    expect(
      resolveProductAmount({
        price: new Decimal("9.99"),
        priceMinor: new Decimal("999"),
        currency: "USD",
      }),
    ).toEqual({ amountMinor: new Decimal("999"), currency: "usd" });
  });

  it("derives minor units from major price when priceMinor is null", () => {
    expect(
      resolveProductAmount({
        price: new Decimal("10"),
        priceMinor: null,
        currency: "USD",
      }),
    ).toEqual({ amountMinor: new Decimal("1000"), currency: "usd" });
  });
});

describe("minorToMajor / formatMinor", () => {
  it("converts USD minor to major units", () => {
    expect(minorToMajor(decimalFromNumber(2500), "usd")).toBe(25);
  });

  it("formats USD amounts", () => {
    expect(formatMinor(decimalFromNumber(1999), "usd")).toMatch(/\$19\.99/);
  });
});

describe("formatUsdDecimal", () => {
  it("formats estimator USD amounts", () => {
    expect(formatUsdDecimal(new Decimal("12500.50"))).toMatch(/\$12,501/);
  });
});

describe("decimalFromMajorPrice", () => {
  it("accepts Decimal major input", () => {
    expect(decimalFromMajorPrice(new Decimal("19.99"), "usd").toString()).toBe(
      "1999",
    );
  });
});
