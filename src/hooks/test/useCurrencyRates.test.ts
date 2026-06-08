import { describe, expect, it } from "vitest";
import { useCurrencyRates } from "@/hooks/useCurrencyRates";

describe("useCurrencyRates", () => {
  it("exports a React hook", () => {
    expect(typeof useCurrencyRates).toBe("function");
    expect(useCurrencyRates.name).toBe("useCurrencyRates");
  });
});
