import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      // Built-in exponential backoff for transient network errors / 429s.
      maxNetworkRetries: 2,
    });
  }

  return stripeClient;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/**
 * Webhook signing secrets, supporting a rotation window. Set either
 * STRIPE_WEBHOOK_SECRET (single) or STRIPE_WEBHOOK_SECRETS (comma-separated).
 */
export function getWebhookSecrets(): string[] {
  const multi = process.env.STRIPE_WEBHOOK_SECRETS;
  const single = process.env.STRIPE_WEBHOOK_SECRET;
  const raw = [multi, single].filter(Boolean).join(",");
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Verify a webhook payload against any configured signing secret (rotation-safe).
 * Throws if no secret matches.
 */
export function constructWebhookEvent(
  payload: string,
  signature: string,
): Stripe.Event {
  const secrets = getWebhookSecrets();
  if (secrets.length === 0) {
    throw new Error("No Stripe webhook secret configured.");
  }

  const stripe = getStripe();
  let lastError: unknown;
  for (const secret of secrets) {
    try {
      return stripe.webhooks.constructEvent(payload, signature, secret);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("Webhook signature verification failed.");
}

/**
 * Fail-fast validation that Stripe env vars are internally consistent.
 * Returns a list of problems (empty = OK). Safe to call at request time.
 */
export function assertStripeEnv(): string[] {
  const problems: string[] = [];
  const secretKey = process.env.STRIPE_SECRET_KEY ?? "";
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
  const isProd = process.env.VERCEL_ENV === "production";

  if (!secretKey) {
    problems.push("STRIPE_SECRET_KEY missing.");
  } else {
    const isLiveSecret = secretKey.startsWith("sk_live_");
    const isTestSecret = secretKey.startsWith("sk_test_");
    if (!isLiveSecret && !isTestSecret) {
      problems.push("STRIPE_SECRET_KEY has an unexpected prefix.");
    }
    if (isProd && isTestSecret) {
      problems.push("Production is using a TEST Stripe secret key.");
    }
    if (!isProd && isLiveSecret) {
      problems.push("Non-production env is using a LIVE Stripe secret key.");
    }

    if (publishableKey) {
      const liveSecret = secretKey.startsWith("sk_live_");
      const livePub = publishableKey.startsWith("pk_live_");
      if (liveSecret !== livePub) {
        problems.push(
          "Stripe secret and publishable keys are from different modes (test vs live).",
        );
      }
    }
  }

  if (getWebhookSecrets().length === 0) {
    problems.push("No STRIPE_WEBHOOK_SECRET(S) configured.");
  }

  return problems;
}
