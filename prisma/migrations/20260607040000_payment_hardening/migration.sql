-- Product: currency-aware pricing
ALTER TABLE "products" ADD COLUMN "priceMinor" INTEGER;
ALTER TABLE "products" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'usd';
UPDATE "products" SET "priceMinor" = ROUND("price" * 100) WHERE "priceMinor" IS NULL;

-- Purchase: download grace window
ALTER TABLE "purchases" ADD COLUMN "downloadCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "purchases" ADD COLUMN "maxDownloads" INTEGER NOT NULL DEFAULT 3;
ALTER TABLE "purchases" ADD COLUMN "firstDownloadedAt" TIMESTAMP(3);
ALTER TABLE "purchases" ADD COLUMN "downloadedAt" TIMESTAMP(3);

-- Backfill grace window from legacy tokenUsed flag
UPDATE "purchases" SET "downloadCount" = "maxDownloads" WHERE "tokenUsed" = true;

-- Purchase: Stripe linkage
ALTER TABLE "purchases" ADD COLUMN "stripePaymentIntentId" TEXT;
ALTER TABLE "purchases" ADD COLUMN "stripeChargeId" TEXT;

-- Purchase: money snapshot
ALTER TABLE "purchases" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'usd';
ALTER TABLE "purchases" ADD COLUMN "amountMinor" INTEGER;

-- Purchase: fulfillment + lifecycle
ALTER TABLE "purchases" ADD COLUMN "emailSentAt" TIMESTAMP(3);
ALTER TABLE "purchases" ADD COLUMN "revokedAt" TIMESTAMP(3);
ALTER TABLE "purchases" ADD COLUMN "disputeStatus" TEXT;

-- Purchase: fraud evidence
ALTER TABLE "purchases" ADD COLUMN "buyerIp" TEXT;
ALTER TABLE "purchases" ADD COLUMN "userAgent" TEXT;

-- Unique index for PaymentIntent dedup (Elements flow + refund mapping)
CREATE UNIQUE INDEX "purchases_stripePaymentIntentId_key" ON "purchases"("stripePaymentIntentId");

-- Processed Stripe events (webhook idempotency)
CREATE TABLE "processed_stripe_events" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "processed_stripe_events_pkey" PRIMARY KEY ("id")
);
