import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let mockRedisInstance: {
  get: any;
  set: any;
  del: any;
} | null = null;

vi.mock("@upstash/redis", () => {
  return {
    Redis: class {
      constructor() {
        mockRedisInstance = {
          get: vi.fn(),
          set: vi.fn(),
          del: vi.fn(),
        };
        return mockRedisInstance;
      }
    },
  };
});

// Import AFTER mocking
import {
  cachedQuery,
  getRedisClient,
  invalidateCache,
} from "@/lib/redis";

describe("getRedisClient", () => {
  afterEach(() => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  it("returns null when env vars are missing", () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    expect(getRedisClient()).toBeNull();
  });

  it("returns Redis client when env vars are configured", () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://fake.redis";
    process.env.UPSTASH_REDIS_REST_TOKEN = "fake-token";
    const client = getRedisClient();
    expect(client).not.toBeNull();
    expect(mockRedisInstance).not.toBeNull();
  });
});

describe("cachedQuery", () => {
  beforeEach(() => {
    process.env.UPSTASH_REDIS_REST_URL = "https://fake.redis";
    process.env.UPSTASH_REDIS_REST_TOKEN = "fake-token";
    getRedisClient(); // Ensures mockRedisInstance is initialized
    if (mockRedisInstance) {
      mockRedisInstance.get.mockReset();
      mockRedisInstance.set.mockReset();
      mockRedisInstance.del.mockReset();
    }
  });

  afterEach(() => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  it("falls back to fetcher when Redis is unavailable (env missing)", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    const fetcher = vi.fn().mockResolvedValue({ value: 42 });
    const result = await cachedQuery("test:key", fetcher);

    expect(result).toEqual({ value: 42 });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("returns cached data on cache hit without calling fetcher", async () => {
    mockRedisInstance!.get.mockResolvedValueOnce({ value: 99 });
    const fetcher = vi.fn().mockResolvedValue({ value: 0 });

    const result = await cachedQuery("cache:hit", fetcher, 300);

    expect(result).toEqual({ value: 99 });
    expect(fetcher).not.toHaveBeenCalled();
    expect(mockRedisInstance!.get).toHaveBeenCalledWith("cache:hit");
  });

  it("calls fetcher on cache miss and stores the result", async () => {
    mockRedisInstance!.get.mockResolvedValueOnce(null);
    mockRedisInstance!.set.mockResolvedValueOnce("OK");
    const fetcher = vi.fn().mockResolvedValue({ value: 55 });

    const result = await cachedQuery("cache:miss", fetcher, 600);

    expect(result).toEqual({ value: 55 });
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(mockRedisInstance!.set).toHaveBeenCalledWith("cache:miss", { value: 55 }, { ex: 600 });
  });

  it("falls back to fetcher when Redis get throws a non-dynamic error", async () => {
    mockRedisInstance!.get.mockRejectedValueOnce(new Error("network timeout"));
    const fetcher = vi.fn().mockResolvedValue("fresh");

    const result = await cachedQuery("cache:error-get", fetcher);

    expect(result).toBe("fresh");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("re-throws DYNAMIC_SERVER_USAGE errors from get", async () => {
    const dynamicError = Object.assign(new Error("Dynamic server usage"), {
      digest: "DYNAMIC_SERVER_USAGE",
    });
    mockRedisInstance!.get.mockRejectedValueOnce(dynamicError);
    const fetcher = vi.fn();

    await expect(
      cachedQuery("cache:dynamic", fetcher),
    ).rejects.toThrow("Dynamic server usage");

    expect(fetcher).not.toHaveBeenCalled();
  });

  it("gracefully handles Redis set errors without losing fresh data", async () => {
    mockRedisInstance!.get.mockResolvedValueOnce(null);
    mockRedisInstance!.set.mockRejectedValueOnce(new Error("set failed"));
    const fetcher = vi.fn().mockResolvedValue("data");

    const result = await cachedQuery("cache:set-fail", fetcher);

    expect(result).toBe("data");
  });

  it("re-throws DYNAMIC_SERVER_USAGE errors from set", async () => {
    const dynamicError = Object.assign(new Error("Dynamic server usage"), {
      digest: "DYNAMIC_SERVER_USAGE",
    });
    mockRedisInstance!.get.mockResolvedValueOnce(null);
    mockRedisInstance!.set.mockRejectedValueOnce(dynamicError);
    const fetcher = vi.fn().mockResolvedValue("data");

    await expect(
      cachedQuery("cache:set-dynamic", fetcher),
    ).rejects.toThrow("Dynamic server usage");
  });

  it("uses 300s TTL when not specified", async () => {
    mockRedisInstance!.get.mockResolvedValueOnce(null);
    mockRedisInstance!.set.mockResolvedValueOnce("OK");
    const fetcher = vi.fn().mockResolvedValue("ttl-test");

    await cachedQuery("ttl:key", fetcher);

    expect(mockRedisInstance!.set).toHaveBeenCalledWith("ttl:key", "ttl-test", {
      ex: 300,
    });
  });
});

describe("invalidateCache", () => {
  beforeEach(() => {
    process.env.UPSTASH_REDIS_REST_URL = "https://fake.redis";
    process.env.UPSTASH_REDIS_REST_TOKEN = "fake-token";
    getRedisClient();
    if (mockRedisInstance) {
      mockRedisInstance.get.mockReset();
      mockRedisInstance.set.mockReset();
      mockRedisInstance.del.mockReset();
    }
  });

  afterEach(() => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  it("calls redis.del with all provided keys", async () => {
    mockRedisInstance!.del.mockResolvedValueOnce(2);
    await invalidateCache("key:a", "key:b");
    expect(mockRedisInstance!.del).toHaveBeenCalledWith("key:a", "key:b");
  });

  it("does nothing when Redis is null (env missing)", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    await expect(invalidateCache("key:a")).resolves.toBeUndefined();
  });

  it("does nothing when no keys are provided", async () => {
    await invalidateCache();
    expect(mockRedisInstance!.del).not.toHaveBeenCalled();
  });

  it("handles Redis del errors gracefully", async () => {
    mockRedisInstance!.del.mockRejectedValueOnce(new Error("del failed"));
    await expect(invalidateCache("key:x")).resolves.toBeUndefined();
  });

  it("re-throws DYNAMIC_SERVER_USAGE errors from del", async () => {
    const dynamicError = Object.assign(new Error("Dynamic server usage"), {
      digest: "DYNAMIC_SERVER_USAGE",
    });
    mockRedisInstance!.del.mockRejectedValueOnce(dynamicError);

    await expect(
      invalidateCache("key:dynamic"),
    ).rejects.toThrow("Dynamic server usage");
  });
});
