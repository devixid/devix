"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { submitContactForm } from "@/actions/contact";
import { buildEstimatorContactMessage } from "@/lib/estimator-contact";
import { m, AnimatePresence } from "framer-motion";
import { Loader2, Check } from "lucide-react";
import { ConsultationFeedbackWidget } from "@/components/molecules/ConsultationFeedbackWidget";

interface ContactFormProps {
  initialName?: string;
  initialEmail?: string;
  initialMessage?: string;
  estimatorLeadId?: string | null;
  /** When false, only uses props for prefill (estimator inline form) */
  fillFromUrlParams?: boolean;
  variant?: "default" | "estimator";
  onEstimatorSuccess?: () => void;
  onSuccess?: (submissionId?: string) => void;
  className?: string;
}

export function ContactForm({
  initialName = "",
  initialEmail = "",
  initialMessage,
  estimatorLeadId: estimatorLeadIdProp = null,
  fillFromUrlParams = true,
  variant = "default",
  onEstimatorSuccess,
  onSuccess,
  className,
}: ContactFormProps = {}) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [message, setMessage] = useState(initialMessage ?? "");
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [estimatorLeadId, setEstimatorLeadId] = useState<string | null>(
    estimatorLeadIdProp,
  );
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (initialName && !name) {
      setName(initialName);
    }
  }, [initialName, name]);

  useEffect(() => {
    if (initialEmail && !email) {
      setEmail(initialEmail);
    }
  }, [initialEmail, email]);

  useEffect(() => {
    setEstimatorLeadId(estimatorLeadIdProp);
  }, [estimatorLeadIdProp]);

  useEffect(() => {
    if (initialMessage) {
      setMessage(initialMessage);
    }
  }, [initialMessage]);

  useEffect(() => {
    if (!fillFromUrlParams || typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const leadId = params.get("leadId");
    if (leadId) setEstimatorLeadId(leadId);

    const type = params.get("type") || "Not specified";
    const scope = params.get("scope") || "Not specified";
    const complexity = params.get("complexity") || "Not specified";
    const timeline = params.get("timeline") || "Not specified";
    const design = params.get("design");
    const platform = params.get("platform");
    const excluded = params.get("excluded");
    const budget = params.get("budget");

    if (type !== "Not specified" || budget) {
      setMessage(
        buildEstimatorContactMessage({
          type,
          scope,
          complexity,
          timeline,
          design,
          platform,
          budget: budget ?? undefined,
          excludedLabels: excluded ? excluded.split("|") : [],
        }),
      );
    }
  }, [fillFromUrlParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");

    // Client-side validation
    if (!name.trim() || name.trim().length < 2) {
      setErrorMsg("Name must be at least 2 characters.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (!message.trim() || message.trim().length < 10) {
      setErrorMsg("Message must be at least 10 characters.");
      return;
    }

    startTransition(async () => {
      const result = await submitContactForm({
        name,
        email,
        message,
        estimatorLeadId,
      });

      if (result.success) {
        setSuccess(true);
        if (result.submissionId) {
          setSubmissionId(result.submissionId);
        }
        setName("");
        setEmail("");
        setMessage("");
        onSuccess?.(result.submissionId);
      } else {
        setErrorMsg(result.error || "An unexpected error occurred.");
      }
    });
  };

  return (
    <div
      className={`relative w-full ${variant === "estimator" ? "min-h-[320px]" : "min-h-[400px] lg:col-span-2"} ${className ?? ""}`}
    >
      <AnimatePresence mode="wait">
        {!success ? (
          <m.form
            key="contact-form"
            onSubmit={handleSubmit}
            className="space-y-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Name field */}
            <div className="group relative">
              <input
                type="text"
                id="name"
                required
                disabled={isPending}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="peer font-body focus:border-accent w-full border-b border-zinc-200 bg-transparent py-4 text-base placeholder-zinc-400 transition-colors duration-300 focus:outline-none disabled:opacity-50"
              />
              <div className="bg-accent absolute bottom-0 left-0 h-[2px] w-0 transition-all duration-500 peer-focus:w-full" />
            </div>

            {/* Email field */}
            <div className="group relative">
              <input
                type="email"
                id="email"
                required
                disabled={isPending}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your Email Address"
                className="peer font-body focus:border-accent w-full border-b border-zinc-200 bg-transparent py-4 text-base placeholder-zinc-400 transition-colors duration-300 focus:outline-none disabled:opacity-50"
              />
              <div className="bg-accent absolute bottom-0 left-0 h-[2px] w-0 transition-all duration-500 peer-focus:w-full" />
            </div>

            {/* Message field */}
            <div className="group relative">
              <textarea
                id="message"
                required
                disabled={isPending}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us about your project, goals, and budget"
                rows={5}
                className="peer font-body focus:border-accent w-full resize-none border-b border-zinc-200 bg-transparent py-4 text-base placeholder-zinc-400 transition-colors duration-300 focus:outline-none disabled:opacity-50"
              />
              <div className="bg-accent absolute bottom-0 left-0 h-[2px] w-0 transition-all duration-500 peer-focus:w-full" />
            </div>

            {/* Error Notification */}
            {errorMsg && (
              <div className="font-body text-sm text-red-500">{errorMsg}</div>
            )}

            <p className="font-body text-xs leading-relaxed text-zinc-500">
              By submitting, you agree to our{" "}
              <Link
                href="/privacy"
                className="text-zinc-700 underline-offset-2 hover:text-black hover:underline"
              >
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link
                href="/terms"
                className="text-zinc-700 underline-offset-2 hover:text-black hover:underline"
              >
                Terms of Service
              </Link>
              .
            </p>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="group hover:bg-accent relative inline-flex cursor-pointer items-center justify-center rounded-none bg-black px-10 py-4 text-sm font-medium tracking-wider text-white uppercase transition-colors duration-300 disabled:opacity-50"
            >
              {isPending ? (
                <span className="flex items-center gap-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </span>
              ) : (
                "Send Message"
              )}
            </button>
          </m.form>
        ) : variant === "estimator" ? (
          <m.div
            key="success-estimator"
            className="flex h-full flex-col items-start justify-center space-y-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="border-accent text-accent flex h-16 w-16 items-center justify-center rounded-full border-2">
              <Check className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-display mb-2 text-2xl font-light">
                Consultation request received.
              </h3>
              <p className="font-body text-base text-zinc-500">
                We&apos;ve saved your estimate and will follow up within 24
                hours to discuss your project.
              </p>
            </div>
            <div className="mt-2 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onEstimatorSuccess?.()}
                className="inline-flex items-center justify-center rounded-full bg-black px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
              >
                Adjust your estimate
              </button>
              <a
                href="/projects"
                className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-transparent px-8 py-3 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-black"
              >
                View portfolio
              </a>
            </div>
          </m.div>
        ) : (
          <m.div
            key="success-message"
            className="flex h-full flex-col items-start justify-center space-y-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="border-accent text-accent flex h-16 w-16 items-center justify-center border">
              <Check className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-display mb-2 text-2xl font-light">
                Thank you for reaching out.
              </h3>
              <p className="font-body text-base text-zinc-500">
                We&apos;ve received your submission and will get back to you
                within 24 hours.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSuccess(false)}
              className="font-body mt-4 cursor-pointer border-b border-zinc-300 pb-0.5 text-sm text-zinc-500 transition-colors hover:border-black hover:text-black"
            >
              Send another message
            </button>
          </m.div>
        )}
      </AnimatePresence>

      {variant === "estimator" && submissionId && success && (
        <ConsultationFeedbackWidget contactSubmissionId={submissionId} />
      )}
    </div>
  );
}
