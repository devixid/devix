import { resolvePaymentProviderId } from "@/lib/payment/config";
import { lemonSqueezyProvider } from "@/lib/payment/providers/lemonsqueezy";
import { stripeProvider } from "@/lib/payment/providers/stripe";
import type { PaymentProvider } from "@/lib/payment/types";

function providerById(id: Awaited<ReturnType<typeof resolvePaymentProviderId>>): PaymentProvider {
  switch (id) {
    case "stripe":
      return stripeProvider;
    case "lemonsqueezy":
      return lemonSqueezyProvider;
    default: {
      const _exhaustive: never = id;
      throw new Error(`Unhandled payment provider: ${_exhaustive}`);
    }
  }
}

/**
 * Returns the active payment provider implementation.
 * This is the only module that selects a provider by id.
 */
export async function getPaymentProvider(): Promise<PaymentProvider> {
  const id = await resolvePaymentProviderId();
  return providerById(id);
}

export {
  getPaymentProviderIdFromEnv,
  getPaymentProviderStatus,
  isPaymentProviderConfigured,
  resolvePaymentProviderId,
} from "@/lib/payment/config";
export {
  PAYMENT_PROVIDERS,
  isPaymentProviderId,
  type PaymentProviderId,
  type PaymentProviderStatus,
} from "@/lib/payment/constants";
export type {
  CreateCheckoutParams,
  CreateCheckoutResult,
  FulfillmentEvent,
  ParsedWebhookEvent,
  PaymentProvider,
  ProviderCheckoutState,
  RevocationEvent,
} from "@/lib/payment/types";
