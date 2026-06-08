import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { lemonSqueezyProvider } from "@/lib/payment/providers/lemonsqueezy";
import type { ParsedLemonSqueezyWebhookEvent } from "@/lib/payment/types";
import {
  fulfillFromPaymentEvent,
} from "@/lib/purchase-fulfillment";
import { revokeFromPaymentEvent } from "@/lib/purchase-revocation";
import { isLemonSqueezyConfigured } from "@/lib/lemonsqueezy";

export const runtime = "nodejs";
export const maxDuration = 30;

function isUniqueViolation(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002"
  );
}

export async function POST(request: Request) {
  if (!isLemonSqueezyConfigured()) {
    console.error("[Lemon Squeezy Webhook] Not configured.");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 },
    );
  }

  let parsed: ParsedLemonSqueezyWebhookEvent;
  try {
    const event = await lemonSqueezyProvider.parseWebhook(request);
    if (event.provider !== "lemonsqueezy") {
      throw new Error("Unexpected webhook provider.");
    }
    parsed = event;
  } catch (error) {
    console.error("[Lemon Squeezy Webhook] Verification failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid webhook" },
      { status: 400 },
    );
  }

  try {
    await prisma.processedPaymentEvent.create({
      data: {
        id: parsed.eventId,
        provider: "lemonsqueezy",
        type: parsed.eventName,
      },
    });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error("[Lemon Squeezy Webhook] Failed to record event:", err);
    return NextResponse.json({ error: "Event record failed" }, { status: 500 });
  }

  try {
    switch (parsed.eventName) {
      case "order_created": {
        const fulfillment = lemonSqueezyProvider.toFulfillmentEvent(parsed);
        if (fulfillment) {
          await fulfillFromPaymentEvent(fulfillment);
        }
        break;
      }
      case "order_refunded": {
        const revocation = lemonSqueezyProvider.toRevocationEvent(parsed);
        if (revocation) {
          const found = await revokeFromPaymentEvent(revocation, {
            revoke: true,
          });
          if (!found) {
            throw new Error(
              `Refund for unknown purchase (order ${revocation.lemonSqueezyOrderId}); will retry.`,
            );
          }
        }
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(
      `[Lemon Squeezy Webhook] Handler error for ${parsed.eventName} (${parsed.eventId}):`,
      error,
    );
    await prisma.processedPaymentEvent
      .delete({ where: { id: parsed.eventId } })
      .catch(() => {});
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}
