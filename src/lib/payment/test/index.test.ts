import { describe, expect, it } from "vitest";
import { PAYMENT_PROVIDERS } from "@/lib/payment/constants";

describe("payment provider registry", () => {
  it("lists supported providers", () => {
    expect(PAYMENT_PROVIDERS).toEqual(["stripe", "lemonsqueezy"]);
  });
});
