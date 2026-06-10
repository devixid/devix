import { beforeEach, describe, expect, it, vi } from "vitest";
import { getTestMocks } from "@/lib/test/mocks/registry";

vi.mock("@/lib/redis", async () => {
  const { createRedisMock } = await import("@/lib/test/mocks/redis");
  const { getTestMocks } = await import("@/lib/test/mocks/registry");
  getTestMocks().redis = createRedisMock();

  return {
    getRedisClient: () => getTestMocks().redis ?? null,
    cachedQuery: async <T>(
      key: string,
      fetcher: () => Promise<T>,
      ttlSeconds = 300,
    ): Promise<T> => {
      const redis = getTestMocks().redis;
      if (!redis) {
        return fetcher();
      }

      const cachedData = (await redis.get(key)) as T | null;
      if (cachedData) {
        return cachedData;
      }

      const freshData = await fetcher();
      await redis.set(key, freshData, { ex: ttlSeconds });
      return freshData;
    },
    invalidateCache: vi.fn(),
  };
});

import { cachedQuery } from "@/lib/redis";

describe("mock kit / redis", () => {
  beforeEach(() => {
    const redisMock = getTestMocks().redis!;
    redisMock.get.mockClear();
    redisMock.get.mockResolvedValue({ value: 42 });
  });

  it("returns cached data without calling the fetcher", async () => {
    const redisMock = getTestMocks().redis!;
    const fetcher = vi.fn(async () => ({ value: 99 }));

    const result = await cachedQuery("cache:example", fetcher, 300);

    expect(result).toEqual({ value: 42 });
    expect(fetcher).not.toHaveBeenCalled();
    expect(redisMock.get).toHaveBeenCalledWith("cache:example");
  });
});
