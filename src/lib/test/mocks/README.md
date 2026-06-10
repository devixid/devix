# Lib unit test mock kit

Shared mocks for modules under `src/lib` that depend on Prisma, Supabase, Next.js headers, email, Stripe, or Redis.

## Import order (required)

Vitest hoists `vi.mock`, but keep this order in every test file for clarity and generator safety:

1. `vitest` imports (`describe`, `it`, `expect`, `vi`, `beforeEach`)
2. Declare async `vi.mock` factories that store handles in `getTestMocks()` ([`registry.ts`](registry.ts))
3. Import SUT **after** `vi.mock` declarations
4. Read mocks via `getTestMocks().prisma!` in tests / `beforeEach` resets

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { resetMockPrisma } from "@/lib/test/mocks/prisma";
import { getTestMocks } from "@/lib/test/mocks/registry";

vi.mock("@/lib/prisma", async () => {
  const { createMockPrisma } = await import("@/lib/test/mocks/prisma");
  const { getTestMocks } = await import("@/lib/test/mocks/registry");
  const { prisma, mocks } = createMockPrisma();
  getTestMocks().prisma = mocks;
  return { prisma };
});

import { buildPurchase } from "@/lib/test/mocks/fixtures/purchase";
import { rotatePurchaseDownloadToken } from "@/lib/rotate-purchase-download-token";

describe("example", () => {
  beforeEach(() => resetMockPrisma(getTestMocks().prisma!));

  it("works", async () => {
    mocks.purchase.update.mockResolvedValue(buildPurchase());
    await rotatePurchaseDownloadToken("purchase_fixture_1");
    expect(mocks.purchase.update).toHaveBeenCalled();
  });
});
```

## Modules

| File | Purpose |
|------|---------|
| `registry.ts` | `getTestMocks()` global registry for mock handles |
| `prisma.ts` | `createMockPrisma`, `resetMockPrisma` |
| `supabase-admin.ts` | Storage chain mocks (`list`, `createSignedUrl`, …) |
| `next-headers.ts` | `headers()` / `cookies()` helpers |
| `email.ts` | Resend function mocks + `expectEmailSent` |
| `stripe.ts` | Checkout session / dispute mocks |
| `redis.ts` | In-memory Redis mock + `withFrozenTime` |
| `fixtures/` | Typed `buildPurchase`, `buildProduct`, `buildUser`, `buildSiteSettings` |

## Rules

- Mock at **module boundaries** (`@/lib/prisma`, not `@prisma/client`).
- Call `resetMockPrisma` / `resetSupabaseAdminMock` / etc. in `beforeEach`.
- Use fixture builders instead of inline objects to avoid schema drift.

For `@/lib/redis`, avoid `importOriginal` when mocking: the real `cachedQuery` closes over the real `getRedisClient`. Re-export a thin `cachedQuery` in the mock factory (see `__examples__/redis.example.test.ts`).

- Example tests live in `__examples__/` — copy patterns from there when adding real tests.

## Dynamic imports

`auth.ts` uses `await import("@/lib/prisma")`. A hoisted `vi.mock("@/lib/prisma")` still applies as long as the mock exports `{ prisma }`.
