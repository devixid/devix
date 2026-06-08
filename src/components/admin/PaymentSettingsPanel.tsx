"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updatePaymentProvider } from "@/actions/admin/settings";
import {
  PAYMENT_PROVIDERS,
  type PaymentProviderId,
  type PaymentProviderStatus,
} from "@/lib/payment/constants";

const PROVIDER_LABELS: Record<PaymentProviderId, string> = {
  stripe: "Stripe (embedded checkout)",
  lemonsqueezy: "Lemon Squeezy (overlay checkout)",
};

type PaymentSettingsPanelProps = {
  activeProvider: PaymentProviderId;
  stripe: PaymentProviderStatus;
  lemonsqueezy: PaymentProviderStatus;
};

function StatusBadge({ status }: { status: PaymentProviderStatus }) {
  if (status.configured) {
    return (
      <span className="text-xs text-green-400">Env keys configured</span>
    );
  }

  return (
    <span className="text-xs text-amber-400">
      Missing: {status.missing.join(", ")}
    </span>
  );
}

export function PaymentSettingsPanel({
  activeProvider: initialProvider,
  stripe,
  lemonsqueezy,
}: PaymentSettingsPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [provider, setProvider] = useState<PaymentProviderId>(initialProvider);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const statusByProvider: Record<PaymentProviderId, PaymentProviderStatus> = {
    stripe,
    lemonsqueezy,
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    startTransition(async () => {
      try {
        await updatePaymentProvider(provider);
        setMessage("Payment provider updated. Store checkout will use this provider immediately.");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed.");
      }
    });
  };

  return (
    <section className="border border-zinc-800 bg-[#0F0F0F] p-8">
      <h2 className="font-display mb-2 text-xl font-light text-zinc-100">
        Payments
      </h2>
      <p className="mb-6 max-w-2xl text-sm text-zinc-400">
        Choose which provider powers the store checkout. API keys and webhook
        secrets stay in server environment variables — this toggle only selects
        which integration is active.
      </p>

      {message && (
        <div className="mb-4 border-l border-green-500 bg-green-950/30 p-3 text-sm text-green-400">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 border-l border-red-500 bg-red-950/30 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="max-w-2xl space-y-4"
      >
        <fieldset className="space-y-3">
          <legend className="sr-only">Payment provider</legend>
          {PAYMENT_PROVIDERS.map((id) => {
            const status = statusByProvider[id];
            const disabled = !status.configured;

            return (
              <label
                key={id}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                  provider === id
                    ? "border-[#C8A96E] bg-zinc-900/80"
                    : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
              >
                <input
                  type="radio"
                  name="paymentProvider"
                  value={id}
                  checked={provider === id}
                  disabled={disabled}
                  onChange={() => setProvider(id)}
                  className="mt-1"
                />
                <span className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-zinc-100">
                    {PROVIDER_LABELS[id]}
                  </span>
                  <StatusBadge status={status} />
                </span>
              </label>
            );
          })}
        </fieldset>

        <button
          type="submit"
          disabled={isPending || provider === initialProvider}
          className="rounded-lg bg-[#C8A96E] px-5 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save payment provider"}
        </button>
      </form>
    </section>
  );
}
