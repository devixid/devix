import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCurrencyRates } from "@/hooks/useCurrencyRates";
import { Loader2, ArrowRight, ChevronDown } from "lucide-react";
import type { EstimatorState, CurrencyCode } from "@/types/estimator";
import {
  BASE_PRICES,
  PLATFORM_MULTIPLIERS,
  SCOPE_MULTIPLIERS,
  COMPLEXITY_MULTIPLIERS,
  TIMELINE_MULTIPLIERS,
} from "@/types/estimator";

interface StepResultProps {
  state: EstimatorState;
  onBack: () => void;
}

const CURRENCIES: { code: CurrencyCode; symbol: string; name: string }[] = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "BND", symbol: "B$", name: "Brunei Dollar" },
  { code: "PHP", symbol: "₱", name: "Philippine Peso" },
  { code: "THB", symbol: "฿", name: "Thai Baht" },
];

export function StepResult({ state, onBack }: StepResultProps) {
  const router = useRouter();
  const { rates, isLoading, error } = useCurrencyRates();
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>("USD");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClose = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleClose);
    return () => document.removeEventListener("click", handleClose);
  }, [isOpen]);

  const basePriceUSD = useMemo(() => {
    if (!state.type || !state.scope || !state.complexity || !state.timeline)
      return 0;

    if (state.type === "mobile_app" && !state.platform)
      return 0;

    const base = BASE_PRICES[state.type];
    const platformMult = state.type === "mobile_app" && state.platform ? PLATFORM_MULTIPLIERS[state.platform] : 1.0;
    const scopeMult = SCOPE_MULTIPLIERS[state.scope];
    const complexMult = COMPLEXITY_MULTIPLIERS[state.complexity];
    const timeMult = TIMELINE_MULTIPLIERS[state.timeline];

    return base * platformMult * scopeMult * complexMult * timeMult;
  }, [state]);

  const finalPrice = useMemo(() => {
    if (!rates) return basePriceUSD;
    return basePriceUSD * rates[selectedCurrency];
  }, [basePriceUSD, rates, selectedCurrency]);

  const formatPrice = (price: number, currency: CurrencyCode) => {
    const isIDR = currency === "IDR";
    // For IDR, we don't want decimals, we want whole thousands/millions
    const roundedPrice = isIDR
      ? Math.round(price / 1000) * 1000
      : Math.round(price);

    return new Intl.NumberFormat(isIDR ? "id-ID" : "en-US", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: isIDR ? 0 : 0,
    }).format(roundedPrice);
  };

  const handleContactRedirect = () => {
    const params = new URLSearchParams({
      type: state.type || "",
      scope: state.scope || "",
      complexity: state.complexity || "",
      timeline: state.timeline || "",
      budget: `${selectedCurrency} ${Math.round(finalPrice)}`,
    });
    router.push(`/?${params.toString()}#contact`);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <Loader2 className="text-accent h-8 w-8 animate-spin" />
        <p className="mt-4 text-sm text-zinc-500">
          Calculating your estimate...
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col text-center">
      <div className="mb-6">
        <div className="bg-accent/10 mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full">
          <span className="text-3xl">✨</span>
        </div>
        <h2 className="text-3xl font-light text-zinc-900">
          Your Project Estimate
        </h2>
        <p className="mt-2 text-zinc-500">
          Based on your selections, here is the estimated cost.
        </p>
      </div>

      <div className="mb-8 flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 p-8 shadow-inner">
        <div className="mb-6 flex items-center gap-4">
          <span className="text-sm text-zinc-500">Currency:</span>
          <div ref={dropdownRef} className="relative inline-block text-left">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex w-32 items-center justify-between gap-x-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 shadow-sm transition-all hover:bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <span>{selectedCurrency}</span>
              <ChevronDown
                className={`h-4 w-4 text-zinc-400 transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isOpen && (
              <div className="absolute left-0 mt-1.5 z-30 w-60 origin-top-left rounded-lg border border-zinc-200 bg-white shadow-lg focus:outline-none">
                <div className="py-1 max-h-60 overflow-y-auto">
                  {CURRENCIES.map((currency) => (
                    <button
                      key={currency.code}
                      type="button"
                      onClick={() => {
                        setSelectedCurrency(currency.code);
                        setIsOpen(false);
                      }}
                      className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm transition-colors ${
                        selectedCurrency === currency.code
                          ? "bg-zinc-50 text-accent font-medium"
                          : "text-zinc-700 hover:bg-zinc-50"
                      }`}
                    >
                      <span>{currency.code}</span>
                      <span className="text-zinc-400 font-light text-xs">{currency.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-accent text-5xl font-bold tracking-tighter md:text-7xl">
            {formatPrice(finalPrice, selectedCurrency)}
          </span>
        </div>

        {error && (
          <p className="mt-4 text-xs text-red-400">
            Note: Live exchange rates unavailable. Using default fallback rates.
          </p>
        )}

        <p className="mx-auto mt-4 max-w-sm text-sm text-zinc-500">
          This is a rough estimate. Final pricing may vary based on specific
          feature requirements, integrations, and design revisions.
        </p>
      </div>

      <div className="mt-auto flex flex-col-reverse justify-between gap-4 sm:flex-row">
        <button
          onClick={onBack}
          className="group relative inline-flex items-center justify-center gap-x-2 rounded-full border border-zinc-200 bg-transparent px-8 py-3 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-black"
        >
          <span className="transition-transform duration-300 group-hover:-translate-x-1">
            ←
          </span>
          <span>Recalculate</span>
        </button>
        <button
          onClick={handleContactRedirect}
          className="group relative inline-flex items-center justify-center gap-x-2 rounded-full bg-black px-8 py-3 text-sm font-medium text-white transition-all hover:bg-zinc-800 active:scale-95"
        >
          <span>Schedule Consultation</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
