"use client";

import { useState } from "react";
import { Copy, Download, Loader2 } from "lucide-react";
import {
  copyEstimatorSummary,
  downloadEstimatorPdf,
} from "@/lib/estimator-pdf";
import type { CurrencyCode, EstimatorState } from "@/types/estimator";

interface EstimatorExportActionsProps {
  state: EstimatorState;
  budgetDisplay: string;
  currency: CurrencyCode;
  excludedLabels: string[];
  packageSavings: number;
  ratesError: string | null;
}

export function EstimatorExportActions({
  state,
  budgetDisplay,
  currency,
  excludedLabels,
  packageSavings,
  ratesError,
}: EstimatorExportActionsProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

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

  return (
    <div className="mb-8 flex flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading || isCopying}
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
          disabled={isDownloading || isCopying}
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
      </div>

      {feedback && (
        <p className="text-xs text-zinc-500" role="status" aria-live="polite">
          {feedback}
        </p>
      )}
    </div>
  );
}
