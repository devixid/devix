import type { PaymentProviderId } from "@/lib/payment/constants";

export type CreateCheckoutParams = {
  productId: string;
  lemonSqueezyVariantId?: string | null;
  buyerName: string;
  buyerEmail: string;
  amountMinor: number;
  currency: string;
  productName: string;
  productDescription: string;
  baseUrl: string;
  ip: string;
  userAgent?: string;
  /** Stripe embedded checkout session vs redirect modal */
  checkoutMode?: "embedded" | "redirect";
};

export type CreateCheckoutResult =
  | { mode: "embedded"; clientSecret: string }
  | { mode: "overlay"; url: string }
  | { mode: "redirect"; url: string };

export type FulfillmentEvent = {
  provider: PaymentProviderId;
  productId: string;
  buyerName: string;
  buyerEmail: string;
  amountMinor?: number;
  currency?: string;
  buyerIp?: string;
  userAgent?: string;
  siteUrl?: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  lemonSqueezyOrderId?: string;
};

export type RevocationEvent = {
  provider: PaymentProviderId;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  stripeSessionId?: string;
  lemonSqueezyOrderId?: string;
};

export type ParsedStripeWebhookEvent = {
  provider: "stripe";
  eventId: string;
  eventType: string;
  raw: unknown;
};

export type ParsedLemonSqueezyWebhookEvent = {
  provider: "lemonsqueezy";
  eventId: string;
  eventName: string;
  raw: unknown;
};

export type ParsedWebhookEvent =
  | ParsedStripeWebhookEvent
  | ParsedLemonSqueezyWebhookEvent;

export interface PaymentProvider {
  readonly id: PaymentProviderId;
  createCheckout(params: CreateCheckoutParams): Promise<CreateCheckoutResult>;
  parseWebhook(request: Request): Promise<ParsedWebhookEvent>;
  toFulfillmentEvent(event: ParsedWebhookEvent): FulfillmentEvent | null;
  toRevocationEvent(event: ParsedWebhookEvent): RevocationEvent | null;
}

export type ProviderCheckoutState =
  | { ok: true; result: CreateCheckoutResult }
  | { ok: false; error: string };
