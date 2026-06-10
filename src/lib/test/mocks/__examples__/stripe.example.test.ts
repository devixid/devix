import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetStripeMock } from "@/lib/test/mocks/stripe";
import { getTestMocks } from "@/lib/test/mocks/registry";

vi.mock("@/lib/stripe", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/stripe")>();
  const { createStripeMock } = await import("@/lib/test/mocks/stripe");
  const { getTestMocks } = await import("@/lib/test/mocks/registry");
  const bundle = createStripeMock();
  getTestMocks().stripe = bundle.mocks;
  return {
    ...actual,
    getStripe: () => bundle.stripe,
    isStripeConfigured: () => true,
  };
});

import { resendPurchaseEmailByStripeSession } from "@/lib/purchase-email-resend";

describe("mock kit / stripe", () => {
  beforeEach(() => {
    resetStripeMock(getTestMocks().stripe!);
    process.env.STRIPE_SECRET_KEY = "sk_test_mock";
  });

  it("returns an error when checkout session is unpaid", async () => {
    const stripeMocks = getTestMocks().stripe!;
    stripeMocks.checkout.sessions.retrieve.mockResolvedValue({
      id: "cs_test_unpaid",
      payment_status: "unpaid",
      metadata: {
        productId: "prod_1",
        buyerName: "Jane",
        buyerEmail: "jane@example.com",
      },
    });

    const result = await resendPurchaseEmailByStripeSession(
      "cs_test_unpaid",
      "https://devix.test",
    );

    expect(result).toEqual({
      ok: false,
      error:
        "Payment is not completed yet. Wait a moment, refresh, and try again.",
    });
    expect(stripeMocks.checkout.sessions.retrieve).toHaveBeenCalledWith(
      "cs_test_unpaid",
    );
  });
});
