import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { constructWebhookEvent, getWebhookSecrets } from "@/lib/stripe";
import { fulfillProductPurchase } from "@/lib/purchase-fulfillment";
import {
  revokePurchaseAccess,
  setDisputeStatus,
} from "@/lib/purchase-revocation";
import { submitDisputeEvidence } from "@/lib/dispute-evidence";
import { stripeUnitToMinor } from "@/lib/money";

export const runtime = "nodejs";
export const maxDuration = 30;

function isUniqueViolation(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002"
  );
}

function asId(
  value: string | Stripe.PaymentIntent | Stripe.Charge | null | undefined,
): string | undefined {
  if (!value) return undefined;
  return typeof value === "string" ? value : value.id;
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") {
    // Async payment methods settle later via async_payment_succeeded.
    return;
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

  await fulfillProductPurchase({
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
  });
}

async function handlePaymentIntentSucceeded(pi: Stripe.PaymentIntent) {
  // Only used by the embedded/raw PaymentIntent flow. Requires metadata set
  // server-side at creation time. Checkout-backed payments are fulfilled via
  // checkout.session.completed instead (deduped by stripePaymentIntentId).
  const productId = pi.metadata?.productId;
  const buyerName = pi.metadata?.buyerName;
  const buyerEmail = pi.metadata?.buyerEmail || pi.receipt_email || undefined;

  if (!productId || !buyerName || !buyerEmail) {
    // No actionable metadata: likely a Checkout-backed PI already handled by
    // the session event. Skip silently.
    return;
  }

  await fulfillProductPurchase({
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
  });
}

export async function POST(request: Request) {
  if (getWebhookSecrets().length === 0) {
    console.error("[Stripe Webhook] No webhook secret configured.");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;

  try {
    event = constructWebhookEvent(body, signature);
  } catch (error) {
    console.error("[Stripe Webhook] Signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Idempotency: record the event id first. A duplicate delivery short-circuits.
  try {
    await prisma.processedPaymentEvent.create({
      data: { id: event.id, provider: "stripe", type: event.type },
    });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error("[Stripe Webhook] Failed to record event:", err);
    return NextResponse.json({ error: "Event record failed" }, { status: 500 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      }

      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.warn(
          `[Stripe Webhook] Async payment failed for session ${session.id}`,
        );
        break;
      }

      case "payment_intent.succeeded": {
        await handlePaymentIntentSucceeded(
          event.data.object as Stripe.PaymentIntent,
        );
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        console.warn(
          `[Stripe Webhook] PaymentIntent failed ${pi.id}: ${pi.last_payment_error?.message ?? "unknown"}`,
        );
        break;
      }

      case "payment_intent.processing": {
        // Pending (e.g. bank debit). Do NOT fulfill; wait for succeeded.
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const found = await revokePurchaseAccess(
          {
            stripePaymentIntentId: asId(charge.payment_intent),
            stripeChargeId: charge.id,
          },
          { revoke: true, chargeId: charge.id },
        );
        if (!found) {
          // Refund arrived before fulfillment — let Stripe retry.
          throw new Error(
            `Refund for unknown purchase (charge ${charge.id}); will retry.`,
          );
        }
        break;
      }

      case "charge.dispute.created": {
        const dispute = event.data.object as Stripe.Dispute;
        const found = await setDisputeStatus(
          {
            stripePaymentIntentId: asId(dispute.payment_intent),
            stripeChargeId: asId(dispute.charge),
          },
          dispute.status,
          { revoke: true, chargeId: asId(dispute.charge) },
        );
        if (!found) {
          throw new Error(
            `Dispute for unknown purchase (dispute ${dispute.id}); will retry.`,
          );
        }
        await submitDisputeEvidence(dispute);
        break;
      }

      case "charge.dispute.closed": {
        const dispute = event.data.object as Stripe.Dispute;
        // Keep access revoked for digital goods regardless of won/lost.
        await setDisputeStatus(
          {
            stripePaymentIntentId: asId(dispute.payment_intent),
            stripeChargeId: asId(dispute.charge),
          },
          dispute.status,
          { revoke: false, chargeId: asId(dispute.charge) },
        );
        break;
      }

      default:
        // Unhandled event types are acknowledged so Stripe stops retrying.
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(
      `[Stripe Webhook] Handler error for ${event.type} (${event.id}):`,
      error,
    );
    // Remove the idempotency record so the retry can reprocess this event.
    await prisma.processedPaymentEvent
      .delete({ where: { id: event.id } })
      .catch(() => {});
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}
