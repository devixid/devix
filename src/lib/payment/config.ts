import { getSiteSettings } from "@/lib/site-settings";
import {
  isPaymentProviderId,
  type PaymentProviderId,
  type PaymentProviderStatus,
} from "@/lib/payment/constants";

export {
  PAYMENT_PROVIDERS,
  isPaymentProviderId,
  type PaymentProviderId,
  type PaymentProviderStatus,
} from "@/lib/payment/constants";

function parseEnvPaymentProvider(): PaymentProviderId | null {
  const raw = process.env.PAYMENT_PROVIDER?.trim().toLowerCase();
  if (!raw) return null;
  if (!isPaymentProviderId(raw)) {
    throw new Error(
      `Invalid PAYMENT_PROVIDER "${raw}". Expected one of: stripe, lemonsqueezy.`,
    );
  }
  return raw;
}

/**
 * Sync env-only read (legacy/tests). Prefer resolvePaymentProviderId() at runtime.
 */
export function getPaymentProviderIdFromEnv(): PaymentProviderId {
  return parseEnvPaymentProvider() ?? "stripe";
}

/**
 * Resolves the active payment provider: admin SiteSettings first, then
 * PAYMENT_PROVIDER env, then "stripe".
 */
export async function resolvePaymentProviderId(): Promise<PaymentProviderId> {
  try {
    const settings = await getSiteSettings();
    if (
      settings?.paymentProvider &&
      isPaymentProviderId(settings.paymentProvider)
    ) {
      return settings.paymentProvider;
    }
  } catch (error) {
    console.warn("[Payment] Failed to read SiteSettings paymentProvider:", error);
  }

  return parseEnvPaymentProvider() ?? "stripe";
}

export function isPaymentProviderConfigured(
  provider: PaymentProviderId,
): boolean {
  return getPaymentProviderStatus(provider).configured;
}

export function getPaymentProviderStatus(
  provider: PaymentProviderId,
): PaymentProviderStatus {
  const missing: string[] = [];

  switch (provider) {
    case "stripe":
      if (!process.env.STRIPE_SECRET_KEY) missing.push("STRIPE_SECRET_KEY");
      if (
        !process.env.STRIPE_WEBHOOK_SECRET &&
        !process.env.STRIPE_WEBHOOK_SECRETS
      ) {
        missing.push("STRIPE_WEBHOOK_SECRET");
      }
      break;
    case "lemonsqueezy":
      if (!process.env.LEMONSQUEEZY_API_KEY) {
        missing.push("LEMONSQUEEZY_API_KEY");
      }
      if (!process.env.LEMONSQUEEZY_STORE_ID) {
        missing.push("LEMONSQUEEZY_STORE_ID");
      }
      if (!process.env.LEMONSQUEEZY_WEBHOOK_SECRET) {
        missing.push("LEMONSQUEEZY_WEBHOOK_SECRET");
      }
      break;
    default: {
      const _exhaustive: never = provider;
      return _exhaustive;
    }
  }

  return { id: provider, configured: missing.length === 0, missing };
}
