-- Rename processed_stripe_events to processed_payment_events and add provider column
ALTER TABLE "processed_stripe_events" RENAME TO "processed_payment_events";

ALTER TABLE "processed_payment_events" ADD COLUMN "provider" TEXT NOT NULL DEFAULT 'stripe';
