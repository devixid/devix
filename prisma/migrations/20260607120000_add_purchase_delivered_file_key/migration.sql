-- Snapshot product file at fulfillment so admin can replace files safely.
ALTER TABLE "purchases" ADD COLUMN "deliveredFileKey" TEXT;

UPDATE "purchases" AS p
SET "deliveredFileKey" = pr."fileKey"
FROM "products" AS pr
WHERE p."productId" = pr.id
  AND p."deliveredFileKey" IS NULL;
