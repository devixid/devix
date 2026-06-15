import { createHash } from "node:crypto";
import type Stripe from "stripe";
import { getStripe, constructWebhookEvent } from "@/lib/stripe";
import { minorToStripeUnit, stripeUnitToMinor } from "@/lib/money";
import type {
  CreateCheckoutParams,
  CreateCheckoutResult,
  FulfillmentEvent,
  ParsedStripeWebhookEvent,
  ParsedWebhookEvent,
  PaymentProvider,
  RevocationEvent,
} from "@/lib/payment/types";

function asId(
  value: string | Stripe.PaymentIntent | Stripe.Charge | null | undefined,
): string | undefined {
  if (!value) return undefined;
  return typeof value === "string" ? value : value.id;
}

function buildLineItems(ctx: CreateCheckoutParams) {
  return [
    {
      quantity: 1,
      price_data: {
        currency: ctx.currency,
        unit_amount: minorToStripeUnit(ctx.amountMinor),
        product_data: {
          name: ctx.productName,
          description: ctx.productDescription.slice(0, 500) || undefined,
        },
      },
    },
  ];
}

function buildCheckoutMetadata(ctx: CreateCheckoutParams) {
  return {
    productId: ctx.productId,
    buyerName: ctx.buyerName,
    buyerEmail: ctx.buyerEmail,
    siteUrl: ctx.baseUrl,
    buyerIp: ctx.ip,
    userAgent: ctx.userAgent ?? "",
    couponCode: ctx.couponCode ?? "",
  };
}

function checkoutIdempotencyKey(
  ctx: CreateCheckoutParams,
  mode: string,
): string {
  return createHash("sha256")
    .update(
      `${mode}:${ctx.productId}:${ctx.buyerEmail.toLowerCase()}:${Math.floor(Date.now() / 60000)}`,
    )
    .digest("hex");
}

function mapCheckoutSessionToFulfillment(
  session: Stripe.Checkout.Session,
): FulfillmentEvent | null {
  if (session.payment_status !== "paid") {
    return null;
  }

  const productId = session.metadata?.productId;
  const buyerName = session.metadata?.buyerName;
  const buyerEmail =
    session.metadata?.buyerEmail ||
    session.customer_details?.email ||
    session.customer_email ||
    undefined;

  if (!productId || !buyerName || !buyerEmail) {
    throw new Error(
      `Missing metadata on checkout session ${session.id} (productId/buyerName/buyerEmail).`,
    );
  }

  return {
    provider: "stripe",
    productId,
    buyerName,
    buyerEmail,
    stripeSessionId: session.id,
    stripePaymentIntentId: asId(session.payment_intent),
    amountMinor:
      session.amount_total != null
        ? stripeUnitToMinor(session.amount_total)
        : undefined,
    currency: session.currency ?? undefined,
    buyerIp: session.metadata?.buyerIp,
    userAgent: session.metadata?.userAgent,
    siteUrl: session.metadata?.siteUrl,
    couponCode: session.metadata?.couponCode || undefined,
  };
}

function mapPaymentIntentToFulfillment(
  pi: Stripe.PaymentIntent,
): FulfillmentEvent | null {
  const productId = pi.metadata?.productId;
  const buyerName = pi.metadata?.buyerName;
  const buyerEmail = pi.metadata?.buyerEmail || pi.receipt_email || undefined;

  if (!productId || !buyerName || !buyerEmail) {
    return null;
  }

  return {
    provider: "stripe",
    productId,
    buyerName,
    buyerEmail,
    stripePaymentIntentId: pi.id,
    stripeChargeId: asId(pi.latest_charge),
    amountMinor:
      pi.amount_received != null
        ? stripeUnitToMinor(pi.amount_received)
        : pi.amount != null
          ? stripeUnitToMinor(pi.amount)
          : undefined,
    currency: pi.currency ?? undefined,
    buyerIp: pi.metadata?.buyerIp,
    userAgent: pi.metadata?.userAgent,
    siteUrl: pi.metadata?.siteUrl,
    couponCode: pi.metadata?.couponCode || undefined,
  };
}

function mapChargeToRevocation(charge: Stripe.Charge): RevocationEvent {
  return {
    provider: "stripe",
    stripePaymentIntentId: asId(charge.payment_intent),
    stripeChargeId: charge.id,
  };
}

function mapDisputeToRevocation(dispute: Stripe.Dispute): RevocationEvent {
  return {
    provider: "stripe",
    stripePaymentIntentId: asId(dispute.payment_intent),
    stripeChargeId: asId(dispute.charge),
  };
}

export const stripeProvider: PaymentProvider = {
  id: "stripe",

  async createCheckout(params: CreateCheckoutParams): Promise<CreateCheckoutResult> {
    const stripe = getStripe();
    const metadata = buildCheckoutMetadata(params);
    const mode = params.checkoutMode ?? "embedded";

    if (mode === "redirect") {
      const session = await stripe.checkout.sessions.create(
        {
          mode: "payment",
          customer_email: params.buyerEmail,
          line_items: buildLineItems(params),
          metadata,
          payment_intent_data: { metadata },
          success_url: `${params.baseUrl}/store/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${params.baseUrl}/store/cancel`,
          allow_promotion_codes: false,
        },
        { idempotencyKey: checkoutIdempotencyKey(params, "redirect") },
      );

      if (!session.url) {
        throw new Error("Could not start checkout.");
      }

      return { mode: "redirect", url: session.url };
    }

    const createParams = {
      ui_mode: "embedded",
      mode: "payment",
      customer_email: params.buyerEmail,
      line_items: buildLineItems(params),
      metadata,
      payment_intent_data: { metadata },
      return_url: `${params.baseUrl}/store/success?session_id={CHECKOUT_SESSION_ID}`,
      allow_promotion_codes: false,
    } as unknown as Stripe.Checkout.SessionCreateParams;

    const session = await stripe.checkout.sessions.create(createParams, {
      idempotencyKey: checkoutIdempotencyKey(params, "embedded"),
    });

    if (!session.client_secret) {
      throw new Error("Could not start embedded checkout.");
    }

    return { mode: "embedded", clientSecret: session.client_secret };
  },

  async parseWebhook(request: Request): Promise<ParsedStripeWebhookEvent> {
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("Missing stripe-signature header.");
    }

    const body = await request.text();
    const event = constructWebhookEvent(body, signature);

    return {
      provider: "stripe",
      eventId: event.id,
      eventType: event.type,
      raw: event,
    };
  },

  toFulfillmentEvent(event: ParsedWebhookEvent): FulfillmentEvent | null {
    if (event.provider !== "stripe") {
      return null;
    }

    const stripeEvent = event.raw as Stripe.Event;

    switch (stripeEvent.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        return mapCheckoutSessionToFulfillment(
          stripeEvent.data.object as Stripe.Checkout.Session,
        );
      case "payment_intent.succeeded":
        return mapPaymentIntentToFulfillment(
          stripeEvent.data.object as Stripe.PaymentIntent,
        );
      default:
        return null;
    }
  },

  toRevocationEvent(event: ParsedWebhookEvent): RevocationEvent | null {
    if (event.provider !== "stripe") {
      return null;
    }

    const stripeEvent = event.raw as Stripe.Event;

    switch (stripeEvent.type) {
      case "charge.refunded":
        return mapChargeToRevocation(stripeEvent.data.object as Stripe.Charge);
      case "charge.dispute.created":
      case "charge.dispute.closed":
        return mapDisputeToRevocation(stripeEvent.data.object as Stripe.Dispute);
      default:
        return null;
    }
  },
};

export { asId };
