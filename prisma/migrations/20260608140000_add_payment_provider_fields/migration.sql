-- AlterTable
ALTER TABLE "products" ADD COLUMN "lemonSqueezyVariantId" TEXT;

-- AlterTable
ALTER TABLE "purchases" ADD COLUMN "provider" TEXT NOT NULL DEFAULT 'stripe';
ALTER TABLE "purchases" ADD COLUMN "lemonSqueezyOrderId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "purchases_lemonSqueezyOrderId_key" ON "purchases"("lemonSqueezyOrderId");
