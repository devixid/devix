import type { CurrencyCode } from "@/types/estimator";

export const CURRENCIES: {
  code: CurrencyCode;
  symbol: string;
  name: string;
}[] = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "BND", symbol: "B$", name: "Brunei Dollar" },
  { code: "PHP", symbol: "₱", name: "Philippine Peso" },
  { code: "THB", symbol: "฿", name: "Thai Baht" },
];

const VALID_CURRENCIES = new Set<CurrencyCode>(CURRENCIES.map((c) => c.code));

export function convertUsdToCurrency(
  amountUsd: number,
  currency: CurrencyCode,
  rates: Partial<Record<CurrencyCode, number>> | null,
): number {
  const rate = rates?.[currency] ?? 1;
  return amountUsd * rate;
}

export function formatUsdAsCurrency(
  amountUsd: number,
  currency: CurrencyCode,
  rates: Partial<Record<CurrencyCode, number>> | null,
): string {
  return formatEstimatePrice(
    convertUsdToCurrency(amountUsd, currency, rates),
    currency,
  );
}

export function formatEstimatePrice(
  price: number,
  currency: CurrencyCode,
): string {
  const isIDR = currency === "IDR";
  const roundedPrice = isIDR
    ? Math.round(price / 1000) * 1000
    : Math.round(price);

  return new Intl.NumberFormat(isIDR ? "id-ID" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(roundedPrice);
}

export function detectDefaultCurrency(): CurrencyCode {
  if (typeof navigator === "undefined") return "USD";

  const locale = (
    navigator.language ||
    Intl.DateTimeFormat().resolvedOptions().locale ||
    ""
  ).toLowerCase();

  if (locale.startsWith("id")) return "IDR";
  if (locale.startsWith("ms")) return "MYR";
  if (locale.startsWith("sg")) return "SGD";
  if (locale.startsWith("th")) return "THB";
  if (locale.startsWith("fil") || locale.startsWith("ph")) return "PHP";
  if (locale.startsWith("bn")) return "BND";

  return "USD";
}

export function isValidCurrencyCode(value: unknown): value is CurrencyCode {
  return (
    typeof value === "string" && VALID_CURRENCIES.has(value as CurrencyCode)
  );
}
