import { useState, useEffect } from "react";
import type { CurrencyCode } from "@/types/estimator";

export type ExchangeRates = Record<CurrencyCode, number>;

const CACHE_KEY = "devix-currency-rates";
const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

// Robust default rates as defined by user feedback
const DEFAULT_RATES: ExchangeRates = {
  USD: 1.0,
  IDR: 18000.0,
  MYR: 4.03,
  SGD: 1.29,
  BND: 1.28,
  PHP: 61.53,
  THB: 32.73,
};

interface CachedData {
  rates: ExchangeRates;
  timestamp: number;
}

export function useCurrencyRates() {
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const getRates = async () => {
      // 1. Attempt to load from localStorage cache first (Client-side only)
      if (typeof window !== "undefined") {
        try {
          const cachedStr = localStorage.getItem(CACHE_KEY);
          if (cachedStr) {
            const cached: CachedData = JSON.parse(cachedStr);
            const isFresh = Date.now() - cached.timestamp < CACHE_TTL_MS;

            // Simple validation that all expected currencies exist and are valid numbers
            const currencies: CurrencyCode[] = [
              "USD",
              "IDR",
              "MYR",
              "SGD",
              "BND",
              "PHP",
              "THB",
            ];
            const isValid = currencies.every(
              (code) =>
                typeof cached.rates[code] === "number" &&
                !isNaN(cached.rates[code]) &&
                cached.rates[code] > 0,
            );

            if (isFresh && isValid) {
              if (active) {
                setRates(cached.rates);
                setIsLoading(false);
              }
              return;
            }
          }
        } catch (e) {
          console.warn("Error reading or parsing currency rates cache:", e);
        }
      }

      // 2. Fetch fresh rates from the API if no valid cache
      try {
        const response = await fetch("https://open.er-api.com/v6/latest/USD");
        if (!response.ok) {
          throw new Error(
            `Failed to fetch exchange rates (status: ${response.status})`,
          );
        }

        const data = await response.json();
        if (data && data.result === "success" && data.rates) {
          const fetchedRates: ExchangeRates = {
            USD: 1.0,
            IDR: Number(data.rates.IDR) || DEFAULT_RATES.IDR,
            MYR: Number(data.rates.MYR) || DEFAULT_RATES.MYR,
            SGD: Number(data.rates.SGD) || DEFAULT_RATES.SGD,
            BND: Number(data.rates.BND) || DEFAULT_RATES.BND,
            PHP: Number(data.rates.PHP) || DEFAULT_RATES.PHP,
            THB: Number(data.rates.THB) || DEFAULT_RATES.THB,
          };

          // Final safety validation check on fetched rates
          const currencies: CurrencyCode[] = [
            "USD",
            "IDR",
            "MYR",
            "SGD",
            "BND",
            "PHP",
            "THB",
          ];
          const allValid = currencies.every(
            (code) =>
              typeof fetchedRates[code] === "number" &&
              !isNaN(fetchedRates[code]) &&
              fetchedRates[code] > 0,
          );

          if (!allValid) {
            throw new Error(
              "Fetched rates validation failed: some rates were invalid or missing.",
            );
          }

          if (typeof window !== "undefined") {
            try {
              const cacheData: CachedData = {
                rates: fetchedRates,
                timestamp: Date.now(),
              };
              localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
            } catch (e) {
              console.warn(
                "Failed to write currency rates to localStorage:",
                e,
              );
            }
          }

          if (active) {
            setRates(fetchedRates);
            setError(null);
          }
        } else {
          throw new Error("Invalid response structure from exchange rate API.");
        }
      } catch (err: unknown) {
        console.error("Currency rates fetch error:", err);
        if (active) {
          const errMsg =
            err instanceof Error ? err.message : "Failed to load current rates";
          setError(errMsg);
          // Fall back to robust fallback rates
          setRates(DEFAULT_RATES);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    getRates();

    return () => {
      active = false;
    };
  }, []);

  return { rates, isLoading, error };
}
