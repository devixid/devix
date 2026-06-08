export const PAYMENT_PROVIDERS = ["stripe", "lemonsqueezy"] as const;

export type PaymentProviderId = (typeof PAYMENT_PROVIDERS)[number];

export function isPaymentProviderId(value: string): value is PaymentProviderId {
  return (PAYMENT_PROVIDERS as readonly string[]).includes(value);
}

export type PaymentProviderStatus = {
  id: PaymentProviderId;
  configured: boolean;
  missing: string[];
};
