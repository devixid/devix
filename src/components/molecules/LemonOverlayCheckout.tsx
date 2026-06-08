"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createOverlayCheckoutSession } from "@/actions/purchase";
import { isTurnstileClientEnabled } from "@/lib/turnstile";
import { TurnstileField } from "@/components/molecules/TurnstileField";
import { cn } from "@/utils";

const turnstileEnabled = isTurnstileClientEnabled();
const LEMON_JS_URL = "https://assets.lemonsqueezy.com/lemon.js";

type LemonSqueezyGlobal = {
  Url: {
    Open: (url: string) => void;
    Close: () => void;
  };
  Setup: (options: {
    eventHandler: (event: { event: string }) => void;
  }) => void;
};

declare global {
  interface Window {
    createLemonSqueezy?: () => void;
    LemonSqueezy?: LemonSqueezyGlobal;
  }
}

function loadLemonScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Window is unavailable."));
  }

  if (window.LemonSqueezy) {
    return Promise.resolve();
  }

  const existing = document.querySelector<HTMLScriptElement>(
    `script[src="${LEMON_JS_URL}"]`,
  );
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Failed to load Lemon.js")),
        { once: true },
      );
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = LEMON_JS_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Lemon.js"));
    document.body.appendChild(script);
  });
}

interface LemonOverlayCheckoutProps {
  productId: string;
  productName: string;
  priceLabel: string;
}

export function LemonOverlayCheckout({
  productId,
  productName,
  priceLabel,
}: LemonOverlayCheckoutProps) {
  const router = useRouter();
  const lemonReadyRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [turnstileReady, setTurnstileReady] = useState(!turnstileEnabled);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);

  const setupLemon = useCallback(() => {
    if (lemonReadyRef.current || !window.LemonSqueezy) {
      return;
    }

    window.createLemonSqueezy?.();
    window.LemonSqueezy?.Setup({
      eventHandler: (event) => {
        if (event.event === "Checkout.Success") {
          router.push("/store/success");
        }
      },
    });
    lemonReadyRef.current = true;
  }, [router]);

  useEffect(() => {
    loadLemonScript()
      .then(() => setupLemon())
      .catch((err) => {
        console.error(err);
        setError("Could not load checkout. Please refresh and try again.");
      });
  }, [setupLemon]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    formData.set("productId", productId);

    const result = await createOverlayCheckoutSession(formData);
    setIsPending(false);

    if (!result.ok) {
      setError(result.error);
      setTurnstileReady(false);
      setTurnstileResetKey((key) => key + 1);
      return;
    }

    try {
      await loadLemonScript();
      setupLemon();
      window.LemonSqueezy?.Url.Open(result.url);
    } catch {
      setError("Could not open checkout. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-md flex-col gap-5"
    >
      <div className="border border-zinc-100 bg-zinc-50 p-4">
        <h2 className="font-medium text-zinc-900">{productName}</h2>
        <p className="mt-1 text-sm font-semibold text-zinc-500">{priceLabel}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="lemon-buyerName"
          className="text-sm font-medium text-zinc-700"
        >
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          id="lemon-buyerName"
          name="buyerName"
          type="text"
          required
          placeholder="John Doe"
          className="w-full border border-zinc-300 px-4 py-2.5 text-sm transition-colors focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="lemon-buyerEmail"
          className="text-sm font-medium text-zinc-700"
        >
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          id="lemon-buyerEmail"
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
