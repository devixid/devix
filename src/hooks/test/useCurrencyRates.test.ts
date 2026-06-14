import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { useCurrencyRates } from "@/hooks/useCurrencyRates";

// Mock variables to track state changes and the effect callback
let stateValues: any[] = [];
let stateSetters: any[] = [];
let effectCallback: (() => void) | null = null;

// Mock React
vi.mock("react", () => {
  return {
    useState: (initialValue: any) => {
      const idx = stateValues.length;
      stateValues.push(initialValue);
      const setter = vi.fn((newValue) => {
        if (typeof newValue === "function") {
          stateValues[idx] = newValue(stateValues[idx]);
        } else {
          stateValues[idx] = newValue;
        }
      });
      stateSetters.push(setter);
      return [initialValue, setter];
    },
    useEffect: (callback: any) => {
      effectCallback = callback;
    },
  };
});

describe("useCurrencyRates hook logic", () => {
  let dateNowSpy: any;
  const mockLocalStorageStore: Record<string, string> = {};

  beforeEach(() => {
    stateValues = [];
    stateSetters = [];
    effectCallback = null;

    // Define window object on global to pass client-side environment checks
    (global as any).window = global;

    // Reset localStorage mock
    for (const key of Object.keys(mockLocalStorageStore)) {
      delete mockLocalStorageStore[key];
    }

    global.localStorage = {
      getItem: vi.fn((key) => mockLocalStorageStore[key] || null),
      setItem: vi.fn((key, val) => {
        mockLocalStorageStore[key] = val.toString();
      }),
      removeItem: vi.fn((key) => {
        delete mockLocalStorageStore[key];
      }),
      clear: vi.fn(() => {
        for (const k of Object.keys(mockLocalStorageStore)) {
          delete mockLocalStorageStore[k];
        }
      }),
      length: 0,
      key: vi.fn(),
    } as unknown as Storage;

    // Mock console methods to avoid test pollution
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});

    // Mock Date.now() for cache expiry tests (fixed baseline timestamp)
    dateNowSpy = vi.spyOn(Date, "now").mockReturnValue(1000000000000);
  });

  afterEach(() => {
    dateNowSpy.mockRestore();
    delete (global as any).window;
    vi.restoreAllMocks();
  });

  const getSetRates = () => stateSetters[0];
  const getSetIsLoading = () => stateSetters[1];
  const getSetError = () => stateSetters[2];

  it("returns initial states correctly", () => {
    const result = useCurrencyRates();
    expect(result).toEqual({ rates: null, isLoading: true, error: null });
    expect(effectCallback).toBeTypeOf("function");
  });

  it("loads and validates fresh cache from localStorage on client-side", async () => {
    // 12 hours = 43200000 ms.
    // Set timestamp to be 1 hour ago (1000000000000 - 3600000 = 999996400000)
    const freshTimestamp = 999996400000;
    const cachedData = {
      rates: {
        USD: 1.0,
        IDR: 17900.0,
        MYR: 4.02,
        SGD: 1.28,
        BND: 1.27,
        PHP: 61.2,
        THB: 32.6,
      },
      timestamp: freshTimestamp,
    };
    mockLocalStorageStore["devix-currency-rates"] = JSON.stringify(cachedData);

    // Call hook
    useCurrencyRates();

    // Trigger effect
    effectCallback!();

    // Wait for async cache load path
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(global.localStorage.getItem).toHaveBeenCalledWith("devix-currency-rates");
    expect(getSetRates()).toHaveBeenCalledWith(cachedData.rates);
    expect(getSetIsLoading()).toHaveBeenCalledWith(false);
    expect(getSetError()).not.toHaveBeenCalled();
  });

  it("ignores cache if it is expired", async () => {
    // 13 hours ago (expired since TTL is 12 hours)
    const expiredTimestamp = 1000000000000 - 13 * 60 * 60 * 1000;
    const cachedData = {
      rates: {
        USD: 1.0,
        IDR: 17900.0,
        MYR: 4.02,
        SGD: 1.28,
        BND: 1.27,
        PHP: 61.2,
        THB: 32.6,
      },
      timestamp: expiredTimestamp,
    };
    mockLocalStorageStore["devix-currency-rates"] = JSON.stringify(cachedData);

    // Mock successful fetch response
    const fetchedRates = {
      USD: 1.0,
      IDR: 17500.0,
      MYR: 4.00,
      SGD: 1.25,
      BND: 1.25,
      PHP: 60.0,
      THB: 32.0,
    };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        result: "success",
        rates: fetchedRates,
      }),
    });

    useCurrencyRates();
    effectCallback!();

    // Wait for fetch path
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(global.fetch).toHaveBeenCalled();
    expect(getSetRates()).toHaveBeenCalledWith(expect.objectContaining({ IDR: 17500.0 }));
    expect(mockLocalStorageStore["devix-currency-rates"]).toContain("17500");
  });

  it("ignores cache if rates verification fails", async () => {
    // Fresh timestamp but IDR is missing
    const cachedData = {
      rates: {
        USD: 1.0,
        MYR: 4.02,
        SGD: 1.28,
        BND: 1.27,
        PHP: 61.2,
        THB: 32.6,
      },
      timestamp: 1000000000000 - 1000,
    };
    mockLocalStorageStore["devix-currency-rates"] = JSON.stringify(cachedData);

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        result: "success",
        rates: {
          USD: 1.0,
          IDR: 18000.0,
          MYR: 4.03,
          SGD: 1.29,
          BND: 1.28,
          PHP: 61.53,
          THB: 32.73,
        },
      }),
    });

    useCurrencyRates();
    effectCallback!();

    // Wait for fetch path
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(global.fetch).toHaveBeenCalled();
  });

  it("handles fetch failure by using fallback DEFAULT_RATES", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    useCurrencyRates();
    effectCallback!();

    // Wait for fetch path to catch and handle
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(getSetRates()).toHaveBeenCalledWith({
      USD: 1.0,
      IDR: 18000.0,
      MYR: 4.03,
      SGD: 1.29,
      BND: 1.28,
      PHP: 61.53,
      THB: 32.73,
    });
    expect(getSetError()).toHaveBeenCalledWith(
      "Failed to fetch exchange rates (status: 500)"
    );
    expect(getSetIsLoading()).toHaveBeenCalledWith(false);
  });

  it("handles fetch parse error or invalid API structure", async () => {
    // API returns success but misses rates object
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        result: "error",
      }),
    });

    useCurrencyRates();
    effectCallback!();

    // Wait for fetch path
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(getSetRates()).toHaveBeenCalledWith(expect.objectContaining({ IDR: 18000.0 }));
    expect(getSetError()).toHaveBeenCalledWith(
      "Invalid response structure from exchange rate API."
    );
  });

  it("handles validation checks on fetched rates", async () => {
    // API returns invalid rates (zero or negative)
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        result: "success",
        rates: {
          IDR: -100, // Invalid
          MYR: 4.0,
          SGD: 1.2,
          BND: 1.2,
          PHP: 60,
          THB: 30,
        },
      }),
    });

    useCurrencyRates();
    effectCallback!();

    // Wait for fetch path
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(getSetRates()).toHaveBeenCalledWith(expect.objectContaining({ IDR: 18000.0 })); // Falls back
    expect(getSetError()).toHaveBeenCalledWith(
      expect.stringContaining("Fetched rates validation failed")
    );
  });

  it("does not update state if the component has unmounted (active = false)", async () => {
    let resolveFetch: any;
    const fetchPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });

    global.fetch = vi.fn().mockReturnValue(fetchPromise);

    useCurrencyRates();

    // Trigger effect callback, which begins fetch
    const cleanupFn = (effectCallback as any)();

    // Unmount hook immediately by calling the effect cleanup
    cleanupFn();

    // Resolve fetch
    resolveFetch({
      ok: true,
      json: async () => ({
        result: "success",
        rates: {
          USD: 1.0,
          IDR: 17500.0,
          MYR: 4.00,
          SGD: 1.25,
          BND: 1.25,
          PHP: 60.0,
          THB: 32.0,
        },
      }),
    });

    // Wait for promise resolution ticks
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Rates should not have been set
    expect(getSetRates()).not.toHaveBeenCalled();
    expect(getSetIsLoading()).not.toHaveBeenCalled();
  });

  it("handles error when reading from localStorage cache throws", async () => {
    global.localStorage.getItem = vi.fn().mockImplementation(() => {
      throw new Error("localStorage read error");
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        result: "success",
        rates: {
          USD: 1.0,
          IDR: 18000.0,
          MYR: 4.03,
          SGD: 1.29,
          BND: 1.28,
          PHP: 61.53,
          THB: 32.73,
        },
      }),
    });

    useCurrencyRates();
    effectCallback!();

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(global.fetch).toHaveBeenCalled();
  });

  it("handles error when writing to localStorage cache throws", async () => {
    global.localStorage.setItem = vi.fn().mockImplementation(() => {
      throw new Error("localStorage write error");
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        result: "success",
        rates: {
          USD: 1.0,
          IDR: 18000.0,
          MYR: 4.03,
          SGD: 1.29,
          BND: 1.28,
          PHP: 61.53,
          THB: 32.73,
        },
      }),
    });

    useCurrencyRates();
    effectCallback!();

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(getSetRates()).toHaveBeenCalled();
  });
});
