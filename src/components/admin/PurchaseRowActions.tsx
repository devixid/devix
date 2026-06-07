"use client";

import { useState, useTransition } from "react";
import {
  resendPurchaseEmail,
  revokePurchase,
  regeneratePurchaseToken,
} from "@/actions/admin/purchases";

interface PurchaseRowActionsProps {
  purchaseId: string;
  isRevoked: boolean;
}

export function PurchaseRowActions({
  purchaseId,
  isRevoked,
}: PurchaseRowActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  const run = (
    action: () => Promise<{ ok: boolean; message?: string; error?: string }>,
    confirmMessage?: string,
  ) => {
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    setFeedback(null);
    startTransition(async () => {
      const result = await action();
      setFeedback(
        result.ok ? (result.message ?? "Done.") : (result.error ?? "Failed."),
      );
    });
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isPending || isRevoked}
          onClick={() => run(() => resendPurchaseEmail(purchaseId))}
          className="rounded border border-zinc-700 px-2.5 py-1 text-xs text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white disabled:opacity-40"
        >
          Resend
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            run(
              () => regeneratePurchaseToken(purchaseId),
              "Generate a new download link and email it? The old link stops working.",
            )
          }
          className="rounded border border-zinc-700 px-2.5 py-1 text-xs text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white disabled:opacity-40"
        >
          New link
        </button>
        <button
          type="button"
          disabled={isPending || isRevoked}
          onClick={() =>
            run(
              () => revokePurchase(purchaseId),
              "Revoke download access for this purchase?",
            )
          }
          className="rounded border border-red-900 px-2.5 py-1 text-xs text-red-400 transition-colors hover:border-red-700 hover:text-red-300 disabled:opacity-40"
        >
          Revoke
        </button>
      </div>
      {feedback && <p className="text-[11px] text-zinc-500">{feedback}</p>}
    </div>
  );
}
