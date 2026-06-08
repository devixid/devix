"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Star, X } from "lucide-react";
import { submitConsultationFeedback } from "@/actions/feedback";
import { containsProfanity } from "@/lib/profanity";

const DISMISS_PREFIX = "feedback:dismissed:";
const MAX_COMMENT = 500;

interface ConsultationFeedbackWidgetProps {
  contactSubmissionId: string;
  delayMs?: number;
}

function dismissKey(id: string) {
  return `${DISMISS_PREFIX}${id}`;
}

export function ConsultationFeedbackWidget({
  contactSubmissionId,
  delayMs = 400,
}: ConsultationFeedbackWidgetProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (sessionStorage.getItem(dismissKey(contactSubmissionId))) return;

    const timer = window.setTimeout(() => setVisible(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [contactSubmissionId, delayMs]);

  const dismiss = useCallback(() => {
    sessionStorage.setItem(dismissKey(contactSubmissionId), "1");
    setVisible(false);
  }, [contactSubmissionId]);

  useEffect(() => {
    if (!visible) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [visible, dismiss]);

  useEffect(() => {
    if (!submitted) return;
    const timer = window.setTimeout(() => setVisible(false), 3000);
    return () => window.clearTimeout(timer);
  }, [submitted]);

  const handleSubmit = async () => {
    setError("");
    if (rating < 1) {
      setError("Pilih rating bintang terlebih dahulu.");
      return;
    }

    const trimmed = comment.trim();
    if (trimmed && containsProfanity(trimmed)) {
      setError(
        "Komentar mengandung kata yang tidak pantas. Mohon gunakan bahasa yang sopan.",
      );
      return;
    }

    setSubmitting(true);
    const result = await submitConsultationFeedback({
      contactSubmissionId,
      rating,
      comment: trimmed || null,
    });
    setSubmitting(false);

    if (!result.success) {
      setError(result.error ?? "Gagal mengirim feedback.");
      return;
    }

    sessionStorage.setItem(dismissKey(contactSubmissionId), "1");
    setSubmitted(true);
  };

  if (!mounted || !visible) return null;

  const displayRating = hoverRating || rating;

  return createPortal(
    <div
      role="dialog"
      aria-labelledby="consultation-feedback-title"
      aria-modal="false"
      className="fixed right-4 bottom-4 z-[90] w-[min(100vw-2rem,20rem)] rounded-xl border border-zinc-200 bg-white p-5 shadow-2xl"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2
            id="consultation-feedback-title"
            className="font-display text-base font-medium text-zinc-900"
          >
            {submitted ? "Terima kasih!" : "Bagaimana pengalaman Anda?"}
          </h2>
          {!submitted && (
            <p className="mt-1 text-xs leading-relaxed text-zinc-500">
              Bantu kami meningkatkan proses konsultasi (opsional, ~30 detik)
            </p>
          )}
        </div>
        {!submitted && (
          <button
            type="button"
            onClick={dismiss}
            className="shrink-0 rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {submitted ? (
        <p className="text-sm text-zinc-600">
          Feedback Anda sangat membantu kami meningkatkan layanan.
        </p>
      ) : (
        <>
          <div
            className="mb-4 flex gap-1"
            role="group"
            aria-label="Rating"
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoverRating(value)}
                onMouseLeave={() => setHoverRating(0)}
                className="rounded p-0.5 transition-transform hover:scale-110"
                aria-label={`${value} bintang`}
              >
                <Star
                  className={`h-6 w-6 ${
                    value <= displayRating
                      ? "fill-[#C8A96E] text-[#C8A96E]"
                      : "text-zinc-300"
                  }`}
                />
              </button>
            ))}
          </div>

          <label
            htmlFor="consultation-feedback-comment"
            className="mb-1 block text-[10px] font-medium tracking-wider text-zinc-500 uppercase"
          >
            Komentar (opsional)
          </label>
          <textarea
            id="consultation-feedback-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, MAX_COMMENT))}
            rows={3}
            placeholder="Ceritakan pengalaman Anda…"
            className="mb-1 w-full resize-none rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800 outline-none focus:border-[#C8A96E]"
          />
          <p className="mb-3 text-right text-[10px] text-zinc-400">
            {comment.length}/{MAX_COMMENT}
          </p>

          {error && (
            <p className="mb-3 text-xs text-red-600">{error}</p>
          )}

          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Mengirim…" : "Kirim feedback"}
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="text-xs text-zinc-500 transition-colors hover:text-zinc-800"
            >
              Nanti saja
            </button>
          </div>
        </>
      )}
    </div>,
    document.body,
  );
}
