"use client";

import { useCallback, useState } from "react";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { getStripeBrowser } from "@/lib/stripe-client";
import { createEmbeddedCheckoutSession } from "@/actions/purchase";
import { isTurnstileClientEnabled } from "@/lib/turnstile";
import { TurnstileField } from "@/components/molecules/TurnstileField";
import { cn } from "@/utils";

const turnstileEnabled = isTurnstileClientEnabled();

interface EmbeddedProductCheckoutProps {
  productId: string;
  productName: string;
  priceLabel: string;
  coupon?: string;
}

type Phase = "form" | "checkout";

export function EmbeddedProductCheckout({
  productId,
  productName,
  priceLabel,
  coupon,
}: EmbeddedProductCheckoutProps) {
  const [phase, setPhase] = useState<Phase>("form");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [turnstileReady, setTurnstileReady] = useState(!turnstileEnabled);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    formData.set("productId", productId);

    const result = await createEmbeddedCheckoutSession(formData);
    setIsPending(false);

    if (!result.ok) {
      setError(result.error);
      setTurnstileReady(false);
      setTurnstileResetKey((key) => key + 1);
      return;
    }

    setClientSecret(result.clientSecret);
    setPhase("checkout");
  };

  const fetchClientSecret = useCallback(async () => {
    if (clientSecret) return clientSecret;
    throw new Error("Missing client secret");
  }, [clientSecret]);

  if (phase === "checkout" && clientSecret) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <EmbeddedCheckoutProvider
          stripe={getStripeBrowser()}
          options={{ fetchClientSecret }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-md flex-col gap-5"
    >
      <input type="hidden" name="couponCode" value={coupon || ""} />
      <div className="border border-zinc-100 bg-zinc-50 p-4">
        <h2 className="font-medium text-zinc-900">{productName}</h2>
        <p className="mt-1 text-sm font-semibold text-zinc-500">{priceLabel}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="buyerName"
          className="text-sm font-medium text-zinc-700"
        >
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          id="buyerName"
          name="buyerName"
          type="text"
          required
          placeholder="John Doe"
          className="w-full border border-zinc-300 px-4 py-2.5 text-sm transition-colors focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="buyerEmail"
          className="text-sm font-medium text-zinc-700"
        >
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          id="buyerEmail"
          name="buyerEmail"
          type="email"
          required
          placeholder="john@example.com"
          className="w-full border border-zinc-300 px-4 py-2.5 text-sm transition-colors focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
        />
        <p className="text-xs text-zinc-500">
          The download link is emailed here after payment.
        </p>
      </div>

      <TurnstileField
        resetKey={turnstileResetKey}
        onVerifiedChange={setTurnstileReady}
      />

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={isPending || !turnstileReady}
        className={cn(
          "flex w-full items-center justify-center gap-2 bg-black px-6 py-3 text-sm font-medium tracking-widest text-white uppercase transition-colors hover:bg-zinc-800 disabled:opacity-50",
        )}
      >
        {isPending ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        ) : (
          "Continue to payment"
        )}
      </button>
    </form>
  );
}
