"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  deleteProduct,
  toggleProductVisibility,
} from "@/actions/admin/products";

interface ProductRowActionsProps {
  productId: string;
  isVisible: boolean;
}

export function ProductRowActions({
  productId,
  isVisible,
}: ProductRowActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  const run = (
    action: () => Promise<unknown>,
    confirmMessage?: string,
  ) => {
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    setFeedback(null);
    startTransition(async () => {
      try {
        await action();
        setFeedback("Saved.");
      } catch (err) {
        setFeedback(err instanceof Error ? err.message : "Action failed.");
      }
    });
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/admin/products/${productId}`}
          className="rounded border border-zinc-700 px-2.5 py-1 text-xs text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
        >
          Edit
        </Link>
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            run(
              () => toggleProductVisibility(productId, !isVisible),
              isVisible
                ? "Hide this product from the store?"
                : "Show this product on the store?",
            )
          }
          className="rounded border border-zinc-700 px-2.5 py-1 text-xs text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white disabled:opacity-40"
        >
          {isVisible ? "Hide" : "Show"}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            run(
              () => deleteProduct(productId),
              "Delete this product? This cannot be undone.",
            )
          }
          className="rounded border border-red-900 px-2.5 py-1 text-xs text-red-400 transition-colors hover:border-red-700 hover:text-red-300 disabled:opacity-40"
        >
          Delete
        </button>
      </div>
      {feedback && <p className="text-[11px] text-zinc-500">{feedback}</p>}
    </div>
  );
}
