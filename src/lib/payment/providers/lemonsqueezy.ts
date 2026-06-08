import { createHash } from "node:crypto";
import { createCheckout } from "@lemonsqueezy/lemonsqueezy.js";
import {
  configureLemonSqueezy,
  getLemonStoreId,
  getLemonWebhookSecret,
  verifyLemonSignature,
} from "@/lib/lemonsqueezy";
import {
  buildLemonWebhookEventId,
  parseLemonOrderWebhook,
  type LemonOrderWebhookPayload,
} from "@/lib/payment/lemonsqueezy-schema";
import type {
  CreateCheckoutParams,
  CreateCheckoutResult,
  FulfillmentEvent,
  ParsedLemonSqueezyWebhookEvent,
  ParsedWebhookEvent,
  PaymentProvider,
  RevocationEvent,
} from "@/lib/payment/types";

function mapOrderToFulfillment(
  payload: LemonOrderWebhookPayload,
): FulfillmentEvent | null {
  if (payload.meta.event_name !== "order_created") {
    return null;
  }

  const { attributes } = payload.data;
  if (attributes.status !== "paid") {
    return null;
  }

  const custom = payload.meta.custom_data;
  const productId = custom?.productId;
  const buyerName = custom?.buyerName ?? attributes.user_name;
  const buyerEmail = attributes.user_email;

  if (!productId || !buyerName || !buyerEmail) {
    throw new Error(
      `Missing custom_data on Lemon Squeezy order ${payload.data.id} (productId/buyerName/buyerEmail).`,
    );
  }

  return {
    provider: "lemonsqueezy",
    productId,
    buyerName,
    buyerEmail,
    lemonSqueezyOrderId: payload.data.id,
    amountMinor: attributes.total,
    currency: attributes.currency.toLowerCase(),
    buyerIp: custom?.buyerIp,
    userAgent: custom?.userAgent,
    siteUrl: custom?.siteUrl,
  };
}

function mapOrderToRevocation(
  payload: LemonOrderWebhookPayload,
): RevocationEvent | null {
  if (payload.meta.event_name !== "order_refunded") {
    return null;
  }

  return {
    provider: "lemonsqueezy",
    lemonSqueezyOrderId: payload.data.id,
  };
}

export const lemonSqueezyProvider: PaymentProvider = {
  id: "lemonsqueezy",

  async createCheckout(params: CreateCheckoutParams): Promise<CreateCheckoutResult> {
    if (!params.lemonSqueezyVariantId) {
      throw new Error(
        "This product is not configured for Lemon Squeezy checkout.",
      );
    }

    configureLemonSqueezy();
    const storeId = getLemonStoreId();
    const useOverlay = params.checkoutMode !== "redirect";

    const { data, error } = await createCheckout(
      storeId,
      params.lemonSqueezyVariantId,
      {
        productOptions: {
          name: params.productName,
          description: params.productDescription.slice(0, 500) || undefined,
          redirectUrl: `${params.baseUrl}/store/success`,
        },
        checkoutOptions: {
          embed: useOverlay,
        },
        checkoutData: {
          email: params.buyerEmail,
          name: params.buyerName,
          custom: {
            productId: params.productId,
            buyerName: params.buyerName,
            siteUrl: params.baseUrl,
            buyerIp: params.ip,
            userAgent: params.userAgent ?? "",
          },
        },
      },
    );

    if (error) {
      throw error;
    }

    const url = data?.data.attributes.url;
    if (!url) {
      throw new Error("Could not start Lemon Squeezy checkout.");
    }

    return useOverlay ? { mode: "overlay", url } : { mode: "redirect", url };
  },

  async parseWebhook(request: Request): Promise<ParsedLemonSqueezyWebhookEvent> {
    const secret = getLemonWebhookSecret();
    const signature = request.headers.get("x-signature");

    if (!signature) {
      throw new Error("Missing X-Signature header.");
    }

    const rawBody = await request.text();

    if (!verifyLemonSignature(rawBody, signature, secret)) {
      throw new Error("Invalid Lemon Squeezy webhook signature.");
    }

    const parsed = parseLemonOrderWebhook(JSON.parse(rawBody) as unknown);

    return {
      provider: "lemonsqueezy",
      eventId: buildLemonWebhookEventId(
        parsed.data.id,
        parsed.meta.event_name,
      ),
      eventName: parsed.meta.event_name,
      raw: parsed,
    };
  },

  toFulfillmentEvent(event: ParsedWebhookEvent): FulfillmentEvent | null {
    if (event.provider !== "lemonsqueezy") {
      return null;
    }
    return mapOrderToFulfillment(event.raw as LemonOrderWebhookPayload);
  },

  toRevocationEvent(event: ParsedWebhookEvent): RevocationEvent | null {
    if (event.provider !== "lemonsqueezy") {
      return null;
    }
    return mapOrderToRevocation(event.raw as LemonOrderWebhookPayload);
  },
};

export function lemonCheckoutIdempotencyKey(params: CreateCheckoutParams): string {
  return createHash("sha256")
    .update(
      `lemonsqueezy:${params.productId}:${params.buyerEmail.toLowerCase()}:${Math.floor(Date.now() / 60000)}`,
    )
    .digest("hex");
}
