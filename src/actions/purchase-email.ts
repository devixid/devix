"use server";

import { headers } from "next/headers";
import { logActivity } from "@/lib/activity-log";
import {
  resendPurchaseEmailByStripeSession,
  type PurchaseEmailResendResult,
} from "@/lib/purchase-email-resend";
import {
  getClientIp,
  getPurchaseEmailResendLimiter,
} from "@/lib/rate-limit";
import { getRequestBaseUrl } from "@/lib/request-url";
import { verifyTurnstile } from "@/lib/turnstile";

export async function resendPurchaseConfirmationEmail(
  sessionId: string,
  turnstileToken?: string | null,
): Promise<PurchaseEmailResendResult> {
  const trimmed = sessionId.trim();
  if (!trimmed) {
    return { ok: false, error: "Missing checkout reference." };
  }

  const headerList = await headers();
  const ip = getClientIp(headerList);

  const humanVerified = await verifyTurnstile(turnstileToken, ip);
  if (!humanVerified) {
    return {
      ok: false,
      error: "Verification failed. Please refresh and try again.",
    };
  }

  const limiter = getPurchaseEmailResendLimiter();
  if (limiter) {
    const { success } = await limiter.limit(`${trimmed}:${ip}`);
    if (!success) {
      return {
        ok: false,
        error: "Too many resend attempts. Please wait a few minutes.",
      };
    }
  }

  const result = await resendPurchaseEmailByStripeSession(
    trimmed,
    getRequestBaseUrl(headerList),
  );

  if (result.ok) {
    await logActivity({
      action: "purchase.email_resent_customer",
      entityType: "Purchase",
      metadata: { stripeSessionId: trimmed, tokenRotated: true },
      actorEmail: "customer",
    });
  }

  return result;
}
