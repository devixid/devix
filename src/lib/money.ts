// Currency-aware money helpers. Persisted amounts use Prisma Decimal; payment
// SDKs (Stripe/Lemon) receive integer minor units as JS numbers at the boundary.

import { Decimal } from "@prisma/client/runtime/client";

export type MoneyMinor = Decimal;
export type MoneyMajor = Decimal;

export { Decimal };

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
  idr: 10000,
  jpy: 50,
  sgd: 50,
};

const MAX_SAFE_STRIPE_UNIT = new Decimal(Number.MAX_SAFE_INTEGER);

export function decimalFromNumber(value: number): MoneyMinor {
  return new Decimal(value);
}

export function decimalFromMajorPrice(
  price: number | Decimal,
  currency: string,
): MoneyMinor {
  const major =
    price instanceof Decimal ? price : new Decimal(price);
  if (isZeroDecimalCurrency(currency)) {
    return major.round();
  }
  return major.mul(100).round();
}

export function stripeUnitToMinor(amount: number): MoneyMinor {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error(`Invalid Stripe unit amount: ${amount}`);
  }
  return new Decimal(amount);
}

export function isZeroDecimalCurrency(currency: string): boolean {
  return ZERO_DECIMAL_CURRENCIES.has(currency.toLowerCase());
}

/** Convert stored minor-unit Decimal to the integer Stripe expects. */
export function minorToStripeUnit(amount: MoneyMinor): number {
  if (!amount.isInteger()) {
    throw new Error(`Invalid priceMinor: ${amount.toString()}`);
  }
  if (amount.isNegative()) {
    throw new Error(`Invalid priceMinor: ${amount.toString()}`);
  }
  if (amount.gt(MAX_SAFE_STRIPE_UNIT)) {
    throw new Error(`Amount exceeds safe integer range: ${amount.toString()}`);
  }
  return amount.toNumber();
}

/** @deprecated Use minorToStripeUnit — kept for gradual migration of call sites. */
export function toStripeAmount(priceMinor: number): number {
  return minorToStripeUnit(decimalFromNumber(priceMinor));
}

/** Derive minor units from a major-unit price + currency. */
export function priceToMinor(
  price: number | Decimal,
  currency: string,
): MoneyMinor {
  return decimalFromMajorPrice(price, currency);
}

export function getStripeMinimumMinor(currency: string): MoneyMinor {
  return decimalFromNumber(
    STRIPE_MINIMUM_MINOR[currency.toLowerCase()] ?? 50,
  );
}

export function isAboveStripeMinimum(
  amountMinor: MoneyMinor,
  currency: string,
): boolean {
  return amountMinor.gte(getStripeMinimumMinor(currency));
}

/** Resolve a product's chargeable amount + currency, tolerating legacy rows. */
export function resolveProductAmount(product: {
  price: Decimal;
  priceMinor: Decimal | null;
  currency: string;
}): { amountMinor: MoneyMinor; currency: string } {
  const currency = (product.currency || "usd").toLowerCase();
  const amountMinor =
    product.priceMinor ?? decimalFromMajorPrice(product.price, currency);
  return { amountMinor, currency };
}

/** Convert stored minor units to major units for form display. */
export function minorToMajor(
  amountMinor: MoneyMinor,
  currency: string,
): number {
  if (isZeroDecimalCurrency(currency)) {
    return amountMinor.toNumber();
  }
  return amountMinor.div(100).toNumber();
}

/** Display formatting from minor units. */
export function formatMinor(
  amountMinor: MoneyMinor,
  currency: string,
): string {
  const value = isZeroDecimalCurrency(currency)
    ? amountMinor.toNumber()
    : amountMinor.div(100).toNumber();
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(value);
  } catch {
    return `${currency.toUpperCase()} ${value}`;
  }
}

/** Format USD major amounts stored as Decimal (estimator fields). */
export function formatUsdDecimal(amount: Decimal): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount.toNumber());
}
