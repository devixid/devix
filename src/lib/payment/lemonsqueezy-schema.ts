import { z } from "zod";

const lemonCustomDataSchema = z
  .object({
    productId: z.string().optional(),
    buyerName: z.string().optional(),
    siteUrl: z.string().optional(),
    buyerIp: z.string().optional(),
    userAgent: z.string().optional(),
  })
  .passthrough();

export const lemonOrderWebhookSchema = z.object({
  meta: z.object({
    event_name: z.string(),
    custom_data: lemonCustomDataSchema.optional(),
  }),
  data: z.object({
    id: z.union([z.string(), z.number()]).transform(String),
    type: z.literal("orders"),
    attributes: z.object({
      status: z.string(),
      total: z.number(),
      currency: z.string(),
      user_name: z.string(),
      user_email: z.string(),
      first_order_item: z
        .object({
          product_id: z.number().optional(),
          variant_id: z.number().optional(),
          product_name: z.string().optional(),
        })
        .optional(),
    }),
  }),
});

export type LemonOrderWebhookPayload = z.infer<typeof lemonOrderWebhookSchema>;

export function buildLemonWebhookEventId(
  orderId: string,
  eventName: string,
): string {
  return `lemonsqueezy:${orderId}:${eventName}`;
}

export function parseLemonOrderWebhook(body: unknown): LemonOrderWebhookPayload {
  return lemonOrderWebhookSchema.parse(body);
}
