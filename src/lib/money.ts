// Currency-aware money helpers for Stripe charging.
// Stripe expects integer amounts in the currency's smallest unit. For
// zero-decimal currencies the "minor" unit IS the major unit (no x100).

const ZERO_DECIMAL_CURRENCIES = new Set([
  "bif",
  "clp",
  "djf",
  "gnf",
  "jpy",
  "kmf",
  "krw",
  "mga",
  "pyg",
  "rwf",
  "ugx",
  "vnd",
  "vuv",
  "xaf",
  "xof",
  "xpf",
]);

// Stripe minimum charge per currency (smallest unit). Approximate, expand as needed.
// https://docs.stripe.com/currencies#minimum-and-maximum-charge-amounts
const STRIPE_MINIMUM_MINOR: Record<string, number> = {
  usd: 50,
  eur: 50,
  gbp: 30,
  aud: 50,
  idr: 10000, // ~ Rp 10.000 (zero-decimal)
  jpy: 50,
  sgd: 50,
};

export function isZeroDecimalCurrency(currency: string): boolean {
  return ZERO_DECIMAL_CURRENCIES.has(currency.toLowerCase());
}

/**
 * Convert a stored minor-unit amount into the integer Stripe expects.
 * priceMinor is already in the smallest unit, so this is identity; the helper
 * exists to centralize validation and make the contract explicit.
 */
export function toStripeAmount(priceMinor: number): number {
  if (!Number.isInteger(priceMinor) || priceMinor < 0) {
    throw new Error(`Invalid priceMinor: ${priceMinor}`);
  }
  return priceMinor;
}

/** Derive minor units from a legacy float price + currency. */
export function priceToMinor(price: number, currency: string): number {
  if (isZeroDecimalCurrency(currency)) {
    return Math.round(price);
  }
  return Math.round(price * 100);
}

export function getStripeMinimumMinor(currency: string): number {
  return STRIPE_MINIMUM_MINOR[currency.toLowerCase()] ?? 50;
}

export function isAboveStripeMinimum(
  amountMinor: number,
  currency: string,
): boolean {
  return amountMinor >= getStripeMinimumMinor(currency);
}

/** Resolve a product's chargeable amount + currency, tolerating legacy rows. */
export function resolveProductAmount(product: {
  price: number;
  priceMinor: number | null;
  currency: string;
}): { amountMinor: number; currency: string } {
  const currency = (product.currency || "usd").toLowerCase();
  const amountMinor =
    product.priceMinor ?? priceToMinor(product.price, currency);
  return { amountMinor, currency };
}

/** Convert stored minor units to major units for form display. */
export function minorToMajor(amountMinor: number, currency: string): number {
  return isZeroDecimalCurrency(currency) ? amountMinor : amountMinor / 100;
}

/** Display formatting from minor units. */
export function formatMinor(amountMinor: number, currency: string): string {
  const value = isZeroDecimalCurrency(currency)
    ? amountMinor
    : amountMinor / 100;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(value);
  } catch {
    return `${currency.toUpperCase()} ${value}`;
  }
}
