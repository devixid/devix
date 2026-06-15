"use client";

import { useActionState, useEffect, useState } from "react";
import { Product } from "@prisma/client";
import {
  submitPurchase,
  PurchaseState,
  getVisibleProducts,
  validateCouponAction,
  getActivePaymentProvider,
} from "@/actions/purchase";
import { formatMinor, resolveProductAmount, Decimal } from "@/lib/money";
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

  const [visibleProducts, setVisibleProducts] = useState<Product[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [paymentProvider, setPaymentProvider] = useState<string>("stripe");
  const [couponInput, setCouponInput] = useState<string>("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountType: string;
    discountValue: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  useEffect(() => {
    if (state.success && state.checkoutUrl) {
      window.location.assign(state.checkoutUrl);
      return;
    }

    if (state.success) {
      setIsSuccess(true);
    }
  }, [state.success, state.checkoutUrl]);

  // Reset states only when the modal is opened
  useEffect(() => {
    if (isOpen && product) {
      setIsSuccess(false);
      setTurnstileReady(!turnstileEnabled);
      setTurnstileResetKey((key) => key + 1);
      document.body.style.overflow = "hidden";

      setSelectedProductIds([product.id]);
      setCouponInput("");
      setAppliedCoupon(null);
      setCouponError(null);

      const loadData = async () => {
        try {
          const provider = await getActivePaymentProvider();
          setPaymentProvider(provider);
          const products = await getVisibleProducts();
          setVisibleProducts(products);
        } catch (err) {
          console.error("Failed to load checkout data:", err);
        }
      };
      loadData();
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, product]);

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

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponError(null);
    const res = await validateCouponAction(couponInput);
    if (res.success) {
      setAppliedCoupon({
        code: couponInput.trim().toUpperCase(),
        discountType: res.discountType!,
        discountValue: res.discountValue!,
      });
      setCouponError(null);
    } else {
      setCouponError(res.message || "Invalid coupon");
      setAppliedCoupon(null);
    }
  };

  if (!isOpen || !product) return null;

  const selectedProducts = visibleProducts.filter((p) =>
    selectedProductIds.includes(p.id)
  );

  const currentProducts =
    selectedProducts.length > 0 ? selectedProducts : [product];

  const currency = (product.currency || "usd").toLowerCase();

  const subtotalMinor = currentProducts.reduce((sum, p) => {
    return sum.add(resolveProductAmount(p).amountMinor);
  }, new Decimal(0));

  let bundleDiscountRate = 0;
  if (selectedProductIds.length === 2) {
    bundleDiscountRate = 0.1;
  } else if (selectedProductIds.length >= 3) {
    bundleDiscountRate = 0.15;
  }

  const bundleDiscountAmount = subtotalMinor.mul(bundleDiscountRate).round();
  const priceAfterBundling = subtotalMinor.sub(bundleDiscountAmount);

  let couponDiscountAmount = new Decimal(0);
  if (appliedCoupon) {
    if (appliedCoupon.discountType === "PERCENTAGE") {
      couponDiscountAmount = priceAfterBundling
        .mul(appliedCoupon.discountValue / 100)
        .round();
    } else if (appliedCoupon.discountType === "FIXED") {
      const fixedDiscount = new Decimal(appliedCoupon.discountValue).mul(100);
      couponDiscountAmount = Decimal.min(priceAfterBundling, fixedDiscount);
    }
  }

  const totalMinor = Decimal.max(0, priceAfterBundling.sub(couponDiscountAmount));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => !isPending && onOpenChange(false)}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-md bg-white p-6 shadow-xl sm:rounded-none max-h-[90vh] overflow-y-auto">
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

            {/* Hidden input to ensure primary product is always submitted in productIds array */}
            <input
              type="hidden"
              name="productIds"
              value={product.id}
            />

            {/* Hidden input to pass couponCode to server action */}
            <input
              type="hidden"
              name="couponCode"
              value={appliedCoupon?.code || ""}
            />

            <div className="border border-zinc-100 bg-zinc-50 p-4">
              <h3 className="font-medium text-zinc-900">{product.name}</h3>
              <p className="mt-1 text-sm font-semibold text-zinc-500">
                {formatMinor(
                  resolveProductAmount(product).amountMinor,
                  resolveProductAmount(product).currency,
                )}
              </p>
            </div>

            {/* Upsell / Bundle Add-ons */}
            {paymentProvider === "stripe" && visibleProducts.length > 1 && (
              <div className="flex flex-col gap-2.5 border-t border-zinc-100 pt-4">
                <h4 className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                  Add Recommended Templates & Save
                </h4>
                <div className="flex flex-col gap-2">
                  {visibleProducts
                    .filter((p) => p.id !== product.id)
                    .map((p) => {
                      const isChecked = selectedProductIds.includes(p.id);
                      const currentAmount = resolveProductAmount(p).amountMinor;
                      const currentCurrency = resolveProductAmount(p).currency;
                      return (
                        <label
                          key={p.id}
                          className={cn(
                            "flex items-center justify-between border p-3 cursor-pointer transition-all hover:bg-zinc-50",
                            isChecked
                              ? "border-black bg-zinc-50/50"
                              : "border-zinc-200",
                          )}
                        >
                          <div className="flex items-start gap-2.5">
                            <input
                              type="checkbox"
                              name="productIds"
                              value={p.id}
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedProductIds((prev) => [
                                    ...prev,
                                    p.id,
                                  ]);
                                } else {
                                  setSelectedProductIds((prev) =>
                                    prev.filter((id) => id !== p.id),
                                  );
                                }
                              }}
                              className="mt-1 h-4 w-4 border-zinc-300 text-black focus:ring-black cursor-pointer"
                            />
                            <div>
                              <p className="text-sm font-medium text-zinc-900 leading-tight">
                                {p.name}
                              </p>
                              <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">
                                {p.description}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-zinc-800 ml-2">
                            +{formatMinor(currentAmount, currentCurrency)}
                          </span>
                        </label>
                      );
                    })}
                </div>
                {selectedProductIds.length > 1 && (
                  <p className="text-xs text-emerald-600 font-medium animate-pulse">
                    ✨ Bundle discount applied:{" "}
                    {selectedProductIds.length === 2 ? "10%" : "15%"} off!
                  </p>
                )}
              </div>
            )}

            {/* Promo Code Validation */}
            <div className="flex flex-col gap-1.5 border-t border-zinc-100 pt-4">
              <label
                htmlFor="couponInput"
                className="text-sm font-medium text-zinc-700"
              >
                Promo Code
              </label>
              <div className="flex gap-2">
                <input
                  id="couponInput"
                  type="text"
                  placeholder="ENTER CODE"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="w-full border border-zinc-300 px-4 py-2 text-sm uppercase tracking-wider focus:border-black focus:ring-black focus:ring-1 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="bg-zinc-900 hover:bg-black text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
                  disabled={!couponInput.trim()}
                >
                  Apply
                </button>
              </div>
              {couponError && (
                <p className="text-xs text-red-500 mt-0.5">{couponError}</p>
              )}
              {appliedCoupon && (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 px-3 py-2 text-xs text-emerald-800 mt-1">
                  <span>
                    Code <strong>{appliedCoupon.code}</strong> applied (
                    {appliedCoupon.discountType === "PERCENTAGE"
                      ? `${appliedCoupon.discountValue}% Off`
                      : `${formatMinor(new Decimal(appliedCoupon.discountValue).mul(100), product.currency || "usd")} Off`}
                    )
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedCoupon(null);
                      setCouponInput("");
                    }}
                    className="text-emerald-600 hover:text-emerald-800 font-bold uppercase tracking-wider ml-2"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Price Summary Breakdown */}
            <div className="border border-zinc-200 bg-zinc-50/50 p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm text-zinc-600">
                <span>Items Subtotal</span>
                <span>{formatMinor(subtotalMinor, currency)}</span>
              </div>

              {bundleDiscountAmount.gt(0) && (
                <div className="flex items-center justify-between text-sm text-emerald-600 font-medium">
                  <span>
                    Bundle Discount (
                    {selectedProductIds.length === 2 ? "10%" : "15%"})
                  </span>
                  <span>-{formatMinor(bundleDiscountAmount, currency)}</span>
                </div>
              )}

              {couponDiscountAmount.gt(0) && (
                <div className="flex items-center justify-between text-sm text-emerald-600 font-medium">
                  <span>Promo Discount ({appliedCoupon?.code})</span>
                  <span>-{formatMinor(couponDiscountAmount, currency)}</span>
                </div>
              )}

              <div className="border-t border-zinc-200 pt-2 flex items-center justify-between font-bold text-zinc-950">
                <span>Total Due</span>
                <span>{formatMinor(totalMinor, currency)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 border-t border-zinc-100 pt-4">
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
