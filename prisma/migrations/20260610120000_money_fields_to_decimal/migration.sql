-- Product
ALTER TABLE "products"
  ALTER COLUMN "price" TYPE DECIMAL(19,4)
  USING ROUND("price"::numeric, 4);

ALTER TABLE "products"
  ALTER COLUMN "priceMinor" TYPE DECIMAL(19,0)
  USING CASE
    WHEN "priceMinor" IS NULL THEN NULL
    ELSE "priceMinor"::numeric
  END;

-- Purchase
ALTER TABLE "purchases"
  ALTER COLUMN "amountMinor" TYPE DECIMAL(19,0)
  USING CASE
    WHEN "amountMinor" IS NULL THEN NULL
    ELSE "amountMinor"::numeric
  END;

-- EstimatorLead
ALTER TABLE "estimator_leads"
  ALTER COLUMN "budgetUsd" TYPE DECIMAL(19,2)
  USING ROUND("budgetUsd"::numeric, 2);

ALTER TABLE "estimator_leads"
  ALTER COLUMN "deliverableSavingsUsd" TYPE DECIMAL(19,2)
  USING CASE
    WHEN "deliverableSavingsUsd" IS NULL THEN NULL
    ELSE ROUND("deliverableSavingsUsd"::numeric, 2)
  END;
