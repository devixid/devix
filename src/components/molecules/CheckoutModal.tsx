"use client";

import { useActionState, useEffect, useState } from "react";
import { Product } from "@prisma/client";
import { submitPurchase, PurchaseState } from "@/actions/purchase";
import { isTurnstileClientEnabled } from "@/lib/turnstile";
import { TurnstileField } from "@/components/molecules/TurnstileField";
import { cn } from "@/utils";

const turnstileEnabled = isTurnstileClientEnabled();

const initialState: PurchaseState = {
  success: false,
};

interface CheckoutModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  product: Product | null;
}

export function CheckoutModal({
  isOpen,
  onOpenChange,
  product,
}: CheckoutModalProps) {
  const [state, formAction, isPending] = useActionState(
    submitPurchase,
    initialState,
  );
  const [isSuccess, setIsSuccess] = useState(false);
  const [turnstileReady, setTurnstileReady] = useState(!turnstileEnabled);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);

  useEffect(() => {
    if (state.success && state.checkoutUrl) {
      window.location.assign(state.checkoutUrl);
      return;
    }

    if (state.success) {
      setIsSuccess(true);
    }
  }, [state.success, state.checkoutUrl]);

  // Reset isSuccess only when the modal is opened
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setTurnstileReady(!turnstileEnabled);
      setTurnstileResetKey((key) => key + 1);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (state.message && !state.success) {
      setTurnstileReady(false);
      setTurnstileResetKey((key) => key + 1);
    }
  }, [state.message, state.success]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isPending) {
        onOpenChange(false);
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isPending, onOpenChange]);

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => !isPending && onOpenChange(false)}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-md bg-white p-6 shadow-xl sm:rounded-none">
        <div className="mb-6 flex items-center justify-between border-b border-zinc-100 pb-4">
          <h2 className="font-syne text-xl font-bold tracking-tight text-zinc-900">
            {isSuccess ? "Success!" : "Checkout"}
          </h2>
          <button
            onClick={() => !isPending && onOpenChange(false)}
            className="text-zinc-400 transition-colors hover:text-zinc-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-zinc-600">
              {state.message ||
                "Your download link has been sent to your email."}
            </p>
            <button
              onClick={() => onOpenChange(false)}
              className="mt-6 w-full border border-black px-6 py-3 text-sm font-medium tracking-widest text-black uppercase transition-colors hover:bg-black hover:text-white"
            >
              Close
            </button>
          </div>
        ) : (
          <form
            action={formAction}
            className="flex flex-col gap-5"
          >
            <input
              type="hidden"
              name="productId"
              value={product.id}
            />

            <div className="mb-2 border border-zinc-100 bg-zinc-50 p-4">
              <h3 className="font-medium text-zinc-900">{product.name}</h3>
              <p className="mt-1 text-sm font-semibold text-zinc-500">
                ${product.price.toFixed(2)}
              </p>
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
                placeholder="John Doe"
                className={cn(
                  "w-full border px-4 py-2.5 text-sm transition-colors focus:ring-1 focus:outline-none",
                  state.errors?.buyerName
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-zinc-300 focus:border-black focus:ring-black",
                )}
                required
              />
              {state.errors?.buyerName && (
                <p className="text-xs text-red-500">
                  {state.errors.buyerName[0]}
                </p>
              )}
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
                placeholder="john@example.com"
                className={cn(
                  "w-full border px-4 py-2.5 text-sm transition-colors focus:ring-1 focus:outline-none",
                  state.errors?.buyerEmail
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-zinc-300 focus:border-black focus:ring-black",
                )}
                required
              />
              <p className="text-xs text-zinc-500">
                You&apos;ll complete payment on Stripe. The download link is
                sent here after payment.
              </p>
              {state.errors?.buyerEmail && (
                <p className="text-xs text-red-500">
                  {state.errors.buyerEmail[0]}
                </p>
              )}
            </div>

            <TurnstileField
              resetKey={turnstileResetKey}
              onVerifiedChange={setTurnstileReady}
            />

            {state.message && !state.success && (
              <p className="text-sm text-red-500">{state.message}</p>
            )}

            <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
                className="w-full border border-zinc-200 px-6 py-3 text-sm font-medium tracking-widest text-zinc-600 uppercase transition-colors hover:bg-zinc-50 disabled:opacity-50 sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || !turnstileReady}
                className="flex w-full items-center justify-center gap-2 bg-black px-6 py-3 text-sm font-medium tracking-widest text-white uppercase transition-colors hover:bg-zinc-800 disabled:opacity-50 sm:w-auto"
              >
                {isPending || (state.success && state.checkoutUrl) ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></span>
                ) : (
                  "Continue to payment"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
