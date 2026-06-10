import { vi, type Mock } from "vitest";

type PurchaseMocks = {
  findUnique: Mock;
  findFirst: Mock;
  create: Mock;
  update: Mock;
  updateMany: Mock;
};

type ProductMocks = {
  findUnique: Mock;
};

type UserMocks = {
  findUnique: Mock;
};

type SiteSettingsMocks = {
  findUnique: Mock;
  upsert: Mock;
};

export type MockPrismaMocks = {
  purchase: PurchaseMocks;
  product: ProductMocks;
  user: UserMocks;
  siteSettings: SiteSettingsMocks;
};

export type MockPrismaClient = {
  purchase: PurchaseMocks;
  product: ProductMocks;
  user: UserMocks;
  siteSettings: SiteSettingsMocks;
};

function createDelegate<T extends Record<string, Mock>>(methods: (keyof T)[]): T {
  return Object.fromEntries(
    methods.map((method) => [method, vi.fn()]),
  ) as T;
}

export function buildPrismaMocks(): {
  prisma: MockPrismaClient;
  mocks: MockPrismaMocks;
} {
  return createMockPrisma();
}

export function createMockPrisma(): {
  prisma: MockPrismaClient;
  mocks: MockPrismaMocks;
} {
  const mocks: MockPrismaMocks = {
    purchase: createDelegate<PurchaseMocks>([
      "findUnique",
      "findFirst",
      "create",
      "update",
      "updateMany",
    ]),
    product: createDelegate<ProductMocks>(["findUnique"]),
    user: createDelegate<UserMocks>(["findUnique"]),
    siteSettings: createDelegate<SiteSettingsMocks>(["findUnique", "upsert"]),
  };

  return { prisma: mocks, mocks };
}

export function resetMockPrisma(mocks: MockPrismaMocks): void {
  for (const delegate of Object.values(mocks)) {
    for (const method of Object.values(delegate)) {
      method.mockReset();
    }
  }
}
