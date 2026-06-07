import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

/**
 * Best-effort automatic dispute evidence submission for digital goods.
 * Pulls captured buyer/download evidence from our Purchase row and submits it
 * to Stripe. Never throws — evidence is supplementary to revocation.
 */
export async function submitDisputeEvidence(
  dispute: Stripe.Dispute,
): Promise<void> {
  try {
    const paymentIntentId =
      typeof dispute.payment_intent === "string"
        ? dispute.payment_intent
        : dispute.payment_intent?.id;
    const chargeId =
      typeof dispute.charge === "string" ? dispute.charge : dispute.charge?.id;

    const purchase = paymentIntentId
      ? await prisma.purchase.findUnique({
          where: { stripePaymentIntentId: paymentIntentId },
          include: { product: true },
        })
      : chargeId
        ? await prisma.purchase.findFirst({
            where: { stripeChargeId: chargeId },
            include: { product: true },
          })
        : null;

    if (!purchase) return;

    const downloadInfo = purchase.downloadedAt
      ? `Digital product was downloaded by the customer at ${purchase.downloadedAt.toISOString()} (download count: ${purchase.downloadCount}).`
      : `Digital product download link was delivered by email; not yet downloaded at dispute time.`;

    const evidenceText = [
      `Order: ${purchase.product.name}.`,
      `Purchased ${purchase.createdAt.toISOString()} by ${purchase.buyerEmail}.`,
      downloadInfo,
      purchase.buyerIp ? `Buyer IP at checkout: ${purchase.buyerIp}.` : "",
      `Confirmation email sent: ${purchase.emailSentAt ? "yes" : "no"}.`,
      `This is a non-tangible digital product delivered via a unique, time-limited download link.`,
    ]
      .filter(Boolean)
      .join(" ");

    const stripe = getStripe();
    await stripe.disputes.update(dispute.id, {
      evidence: {
        customer_email_address: purchase.buyerEmail,
        customer_name: purchase.buyerName,
        customer_purchase_ip: purchase.buyerIp ?? undefined,
        product_description: purchase.product.description.slice(0, 500),
        uncategorized_text: evidenceText.slice(0, 20000),
      },
      metadata: { purchaseId: purchase.id },
    });
  } catch (err) {
    console.error("[Dispute] Evidence submission failed:", err);
  }
}
