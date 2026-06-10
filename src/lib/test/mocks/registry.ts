import type { EmailMocks } from "./email";
import type { NextHeadersMock } from "./next-headers";
import type { MockPrismaMocks } from "./prisma";
import type { RedisClientMock } from "./redis";
import type { StripeMocks } from "./stripe";
import type { SupabaseAdminMock } from "./supabase-admin";

export type TestMockRegistry = {
  prisma?: MockPrismaMocks;
  supabase?: SupabaseAdminMock;
  nextHeaders?: NextHeadersMock;
  email?: EmailMocks;
  stripe?: StripeMocks;
  redis?: RedisClientMock;
};

declare global {
  // eslint-disable-next-line no-var
  var __devixTestMocks: TestMockRegistry | undefined;
}

export function getTestMocks(): TestMockRegistry {
  globalThis.__devixTestMocks ??= {};
  return globalThis.__devixTestMocks;
}

export function resetTestMockRegistry(): void {
  globalThis.__devixTestMocks = {};
}
