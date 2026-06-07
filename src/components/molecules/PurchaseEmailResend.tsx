"use client";

import { useState, useTransition } from "react";
import { resendPurchaseConfirmationEmail } from "@/actions/purchase-email";
import { TurnstileField } from "@/components/molecules/TurnstileField";
import { isTurnstileClientEnabled } from "@/lib/turnstile";
import { cn } from "@/utils";

const turnstileEnabled = isTurnstileClientEnabled();

interface PurchaseEmailResendProps {
  sessionId: string;
  maskedEmail?: string | null;
}

export function PurchaseEmailResend({
  sessionId,
  maskedEmail,
}: PurchaseEmailResendProps) {
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [turnstileReady, setTurnstileReady] = useState(!turnstileEnabled);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);

  const bumpTurnstile = () => {
    setTurnstileReady(!turnstileEnabled);
    setTurnstileToken("");
    setTurnstileResetKey((key) => key + 1);
  };

  const handleResend = () => {
    setFeedback(null);
    startTransition(async () => {
      const result = await resendPurchaseConfirmationEmail(
        sessionId,
        turnstileToken || null,
      );
      // Turnstile tokens are single-use — always refresh after an attempt.
      bumpTurnstile();

      if (result.ok) {
        setFeedback({ type: "success", text: result.message });
      } else {
        setFeedback({ type: "error", text: result.error });
      }
    });
  };

  return (
    <div className="mt-8 rounded-none border border-zinc-100 bg-zinc-50 p-5 text-left">
      <p className="text-sm font-medium text-zinc-800">
        Didn&apos;t get the email?
      </p>
      <p className="mt-1 text-sm text-zinc-600">
        {maskedEmail
          ? `We can email a fresh download link to ${maskedEmail}. Any older link will stop working. Check spam first.`
          : "We can email a fresh download link. Any older link will stop working. Check spam first."}
      </p>

      <TurnstileField
        resetKey={turnstileResetKey}
        onVerifiedChange={setTurnstileReady}
        onTokenChange={setTurnstileToken}
      />

      <button
        type="button"
        onClick={handleResend}
        disabled={isPending || !turnstileReady}
        className={cn(
          "mt-4 inline-flex w-full items-center justify-center border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium tracking-wide text-zinc-800 uppercase transition-colors hover:bg-zinc-100 disabled:opacity-50 sm:w-auto",
        )}
      >
        {isPending ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-800" />
        ) : (
          "Send new download link"
        )}
      </button>
      {feedback && (
        <p
          className={cn(
            "mt-3 text-sm",
            feedback.type === "success" ? "text-emerald-700" : "text-red-600",
          )}
          role="status"
        >
          {feedback.text}
        </p>
      )}
    </div>
  );
}
