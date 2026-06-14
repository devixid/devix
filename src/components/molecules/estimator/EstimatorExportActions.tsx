import { useState } from "react";
import { Copy, Download, Loader2, Mail } from "lucide-react";
import {
  copyEstimatorSummary,
  downloadEstimatorPdf,
  generateEstimatorPdfBase64,
} from "@/lib/estimator-pdf";
import { emailEstimateToClientAction } from "@/actions/estimator-leads";
import { motion, AnimatePresence } from "framer-motion";
import type { CurrencyCode, EstimatorState } from "@/types/estimator";

interface EstimatorExportActionsProps {
  state: EstimatorState;
  budgetDisplay: string;
  currency: CurrencyCode;
  excludedLabels: string[];
  packageSavings: number;
  ratesError: string | null;
  leadId: string | null;
  onEmailSent?: (data: { name: string; email: string; leadId: string }) => void;
}

export function EstimatorExportActions({
  state,
  budgetDisplay,
  currency,
  excludedLabels,
  packageSavings,
  ratesError,
  leadId,
  onEmailSent,
}: EstimatorExportActionsProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Email form state
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [clientNameInput, setClientNameInput] = useState("");
  const [clientEmailInput, setClientEmailInput] = useState("");
  const [attachPdf, setAttachPdf] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const exportOptions = {
    state,
    budgetDisplay,
    currency,
    excludedLabels,
    packageSavings,
    ratesError,
  };

  const handleDownload = async () => {
    setFeedback(null);
    setIsDownloading(true);
    try {
      await downloadEstimatorPdf(exportOptions);
    } catch {
      setFeedback("Could not generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopy = async () => {
    setFeedback(null);
    setIsCopying(true);
    try {
      await copyEstimatorSummary(exportOptions);
      setFeedback("Summary copied to clipboard.");
    } catch {
      setFeedback("Could not copy summary. Please try again.");
    } finally {
      setIsCopying(false);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSending(true);

    try {
      let pdfBase64: string | undefined = undefined;
      if (attachPdf) {
        pdfBase64 = await generateEstimatorPdfBase64(exportOptions);
      }

      const result = await emailEstimateToClientAction({
        leadId,
        name: clientNameInput,
        email: clientEmailInput,
        state,
        budgetDisplay,
        currency,
        excludedLabels,
        pdfBase64,
      });

      if (result.ok) {
        setEmailSuccess(true);
        setShowEmailForm(false);
        onEmailSent?.({
          name: clientNameInput.trim(),
          email: clientEmailInput.trim().toLowerCase(),
          leadId: result.leadId,
        });
      } else {
        setFormError(result.error);
      }
    } catch (err) {
      console.error(err);
      setFormError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mb-8 flex flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading || isCopying || isSending}
          aria-label="Download project estimate as PDF"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-300 bg-white px-6 py-2.5 text-sm font-medium text-zinc-800 transition-colors hover:border-zinc-400 hover:bg-zinc-50 disabled:opacity-50"
        >
          {isDownloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          <span>{isDownloading ? "Generating..." : "Download PDF"}</span>
        </button>

        <button
          type="button"
          onClick={handleCopy}
          disabled={isDownloading || isCopying || isSending}
          aria-label="Copy estimate summary to clipboard"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-200 bg-transparent px-6 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50 disabled:opacity-50"
        >
          {isCopying ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          <span>{isCopying ? "Copying..." : "Copy summary"}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setFeedback(null);
            setShowEmailForm(!showEmailForm);
          }}
          disabled={isDownloading || isCopying || isSending}
          aria-label="Email project estimate"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-200 bg-transparent px-6 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50 disabled:opacity-50"
        >
          <Mail className="h-4 w-4" />
          <span>Email me estimate</span>
        </button>
      </div>

      {feedback && (
        <p
          className="text-xs text-zinc-500"
          role="status"
          aria-live="polite"
        >
          {feedback}
        </p>
      )}

      <AnimatePresence>
        {showEmailForm && !emailSuccess && (
          <motion.form
            onSubmit={handleSendEmail}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50/50 p-6 text-left shadow-sm backdrop-blur-sm"
          >
            <h4 className="mb-4 text-sm font-medium text-zinc-800">
              Receive a detailed PDF & breakdown in your inbox
            </h4>
            <div className="space-y-4">
              <div>
                <label htmlFor="client-name" className="sr-only">Your Name</label>
                <input
                  type="text"
                  id="client-name"
                  required
                  placeholder="Your Name"
                  value={clientNameInput}
                  onChange={(e) => setClientNameInput(e.target.value)}
                  disabled={isSending}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm placeholder-zinc-400 outline-none transition-all focus:border-zinc-400"
                />
              </div>
              <div>
                <label htmlFor="client-email" className="sr-only">Your Email Address</label>
                <input
                  type="email"
                  id="client-email"
                  required
                  placeholder="Your Email Address"
                  value={clientEmailInput}
                  onChange={(e) => setClientEmailInput(e.target.value)}
                  disabled={isSending}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm placeholder-zinc-400 outline-none transition-all focus:border-zinc-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="attach-pdf"
                  checked={attachPdf}
                  onChange={(e) => setAttachPdf(e.target.checked)}
                  disabled={isSending}
                  className="h-4 w-4 rounded border-zinc-300 text-black focus:ring-black"
                />
                <label htmlFor="attach-pdf" className="text-xs text-zinc-600 select-none">
                  Attach official PDF estimate
                </label>
              </div>
              {formError && (
                <p className="text-xs text-red-500" role="alert">{formError}</p>
              )}
              <button
                type="submit"
                disabled={isSending}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-black py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sending estimate...</span>
                  </>
                ) : (
                  <span>Send Estimate</span>
                )}
              </button>
            </div>
          </motion.form>
        )}

        {emailSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 w-full max-w-md rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6 text-center backdrop-blur-sm"
          >
            <span className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-sm font-bold">✓</span>
            <h4 className="text-sm font-medium text-emerald-800">Estimate sent successfully!</h4>
            <p className="mt-1 text-xs text-emerald-600">
              Please check your inbox at <strong>{clientEmailInput}</strong>.
            </p>
            <button
              type="button"
              onClick={() => setEmailSuccess(false)}
              className="mt-4 text-xs font-medium text-zinc-500 underline underline-offset-2 hover:text-black"
            >
              Send to another email
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
