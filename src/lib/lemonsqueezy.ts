import { createHmac, timingSafeEqual } from "node:crypto";
import { lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js";

let configured = false;

export function configureLemonSqueezy(): void {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  if (!apiKey) {
    throw new Error("LEMONSQUEEZY_API_KEY is not configured.");
  }

  if (!configured) {
    lemonSqueezySetup({
      apiKey,
      onError: (error) => {
        console.error("[Lemon Squeezy]", error);
      },
    });
    configured = true;
  }
}

export function isLemonSqueezyConfigured(): boolean {
  return Boolean(
    process.env.LEMONSQUEEZY_API_KEY &&
      process.env.LEMONSQUEEZY_STORE_ID &&
      process.env.LEMONSQUEEZY_WEBHOOK_SECRET,
  );
}

export function getLemonStoreId(): string {
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  if (!storeId) {
    throw new Error("LEMONSQUEEZY_STORE_ID is not configured.");
  }
  return storeId;
}

export function getLemonWebhookSecret(): string {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("LEMONSQUEEZY_WEBHOOK_SECRET is not configured.");
  }
  return secret;
}

/**
 * Verify a Lemon Squeezy webhook payload against the X-Signature header.
 * Uses HMAC-SHA256 over the raw request body.
 */
export function verifyLemonSignature(
  rawBody: string,
  signature: string,
  secret: string = getLemonWebhookSecret(),
): boolean {
  const digest = createHmac("sha256", secret).update(rawBody).digest("hex");
  const digestBuffer = Buffer.from(digest, "utf8");
  const signatureBuffer = Buffer.from(signature, "utf8");

  if (digestBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return timingSafeEqual(digestBuffer, signatureBuffer);
}

/**
 * Fail-fast validation that Lemon Squeezy env vars are internally consistent.
 */
export function assertLemonSqueezyEnv(): string[] {
  const problems: string[] = [];

  if (!process.env.LEMONSQUEEZY_API_KEY) {
    problems.push("LEMONSQUEEZY_API_KEY missing.");
  }
  if (!process.env.LEMONSQUEEZY_STORE_ID) {
    problems.push("LEMONSQUEEZY_STORE_ID missing.");
  }
  if (!process.env.LEMONSQUEEZY_WEBHOOK_SECRET) {
    problems.push("LEMONSQUEEZY_WEBHOOK_SECRET missing.");
  }

  return problems;
}
