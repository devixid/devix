import { Decimal } from "@/lib/money";

export type ProductFixture = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: Decimal;
  fileKey: string;
  previewUrl: string | null;
  isVisible: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  priceMinor: Decimal | null;
  currency: string;
  lemonSqueezyVariantId: string | null;
};

export type PurchaseFixture = {
  id: string;
  productId: string;
  buyerName: string;
  buyerEmail: string;
  downloadToken: string;
  tokenUsed: boolean;
  tokenExpiresAt: Date;
  createdAt: Date;
  stripeSessionId: string | null;
  downloadCount: number;
  maxDownloads: number;
  firstDownloadedAt: Date | null;
  downloadedAt: Date | null;
  stripePaymentIntentId: string | null;
  stripeChargeId: string | null;
  currency: string;
  amountMinor: Decimal | null;
  emailSentAt: Date | null;
  revokedAt: Date | null;
  disputeStatus: string | null;
  buyerIp: string | null;
  userAgent: string | null;
  deliveredFileKey: string | null;
  provider: string;
  lemonSqueezyOrderId: string | null;
  product: ProductFixture;
};

export function buildProduct(
  overrides: Partial<ProductFixture> = {},
): ProductFixture {
  return {
    id: "prod_fixture_1",
    name: "Starter Kit",
    slug: "starter-kit",
    description: "A downloadable starter kit for new projects.",
    price: new Decimal("29.0000"),
    fileKey: "starter-kit/starter-kit.zip",
    previewUrl: null,
    isVisible: true,
    order: 0,
    createdAt: new Date("2026-06-01T00:00:00.000Z"),
    updatedAt: new Date("2026-06-01T00:00:00.000Z"),
    priceMinor: new Decimal("2900"),
    currency: "usd",
    lemonSqueezyVariantId: null,
    ...overrides,
  };
}

export function buildPurchase(
  overrides: Partial<PurchaseFixture> & {
    product?: Partial<ProductFixture>;
  } = {},
): PurchaseFixture {
  const { product: productOverrides, ...purchaseOverrides } = overrides;
  const product = buildProduct({
    id: purchaseOverrides.productId ?? "prod_fixture_1",
    ...productOverrides,
  });

  return {
    id: "purchase_fixture_1",
    productId: product.id,
    buyerName: "Jane Doe",
    buyerEmail: "jane@example.com",
    downloadToken: "download-token-fixture",
    tokenUsed: false,
    tokenExpiresAt: new Date("2026-06-09T12:00:00.000Z"),
    createdAt: new Date("2026-06-08T12:00:00.000Z"),
    stripeSessionId: "cs_test_fixture",
    downloadCount: 0,
    maxDownloads: 3,
    firstDownloadedAt: null,
    downloadedAt: null,
    stripePaymentIntentId: "pi_test_fixture",
    stripeChargeId: null,
    currency: "usd",
    amountMinor: new Decimal("2900"),
    emailSentAt: null,
    revokedAt: null,
    disputeStatus: null,
    buyerIp: "127.0.0.1",
    userAgent: "vitest",
    deliveredFileKey: product.fileKey,
    provider: "stripe",
    lemonSqueezyOrderId: null,
    product,
    ...purchaseOverrides,
  };
}

export type PurchaseWithProductFixture = PurchaseFixture;
