// Cloudflare Turnstile server-side verification.
// No-op (returns true) when TURNSTILE_SECRET_KEY is not configured, so the
// checkout still works in dev without bot protection.

export function isTurnstileEnabled(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

export const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

export function isTurnstileClientEnabled(): boolean {
  return Boolean(TURNSTILE_SITE_KEY);
}

export async function verifyTurnstile(
  token: string | null | undefined,
  ip?: string,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // disabled

  if (!token) return false;

  try {
    const body = new URLSearchParams();
    body.set("secret", secret);
    body.set("response", token);
    if (ip) body.set("remoteip", ip);

    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body },
    );
    const data = (await res.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch (err) {
    console.error("[Turnstile] Verification request failed:", err);
    return false;
  }
}
