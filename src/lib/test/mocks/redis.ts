import { vi, type Mock } from "vitest";

export type RedisClientMock = {
  get: Mock;
  set: Mock;
  del: Mock;
  ping: Mock;
};

export function buildRedisMocks(
  initialValues: Record<string, unknown> = {},
): RedisClientMock {
  return createRedisMock(initialValues);
}

export function createRedisMock(
  initialValues: Record<string, unknown> = {},
): RedisClientMock {
  const store = new Map<string, unknown>(Object.entries(initialValues));

  return {
    get: vi.fn(async (key: string) => store.get(key) ?? null),
    set: vi.fn(async (key: string, value: unknown) => {
      store.set(key, value);
      return "OK";
    }),
    del: vi.fn(async (...keys: string[]) => {
      let deleted = 0;
      for (const key of keys) {
        if (store.delete(key)) deleted += 1;
      }
      return deleted;
    }),
    ping: vi.fn(async () => "PONG"),
  };
}

export function resetRedisMock(mock: RedisClientMock): void {
  mock.get.mockReset();
  mock.set.mockReset();
  mock.del.mockReset();
  mock.ping.mockReset().mockResolvedValue("PONG");
}

export async function withFrozenTime<T>(
  iso: string,
  fn: () => Promise<T> | T,
): Promise<T> {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(iso));
  try {
    return await fn();
  } finally {
    vi.useRealTimers();
  }
}
