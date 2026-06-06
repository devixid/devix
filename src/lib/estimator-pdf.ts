import {
  buildEstimatorSummaryLines,
  buildEstimatorSummaryText,
  type EstimatorSummary,
} from "@/lib/estimator-summary";
import type { CurrencyCode, EstimatorState } from "@/types/estimator";

export type DownloadEstimatorPdfOptions = {
  state: EstimatorState;
  budgetDisplay: string;
  currency: CurrencyCode;
  excludedLabels?: string[];
  packageSavings?: number;
  ratesError?: string | null;
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

function renderSummaryToPdf(summary: EstimatorSummary, doc: import("jspdf").jsPDF) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const ensureSpace = (height: number) => {
    const pageHeight = doc.internal.pageSize.getHeight();
    if (y + height > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(summary.title, margin, y);
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${summary.generatedAt}`, margin, y);
  y += 12;
  doc.setTextColor(0);

  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  doc.setFontSize(12);
  for (const line of summary.lines) {
    ensureSpace(10);
    doc.setFont("helvetica", "bold");
    doc.text(`${line.label}:`, margin, y);
    doc.setFont("helvetica", "normal");
    const wrapped = doc.splitTextToSize(line.value, contentWidth - 50);
    doc.text(wrapped, margin + 50, y);
    y += Math.max(8, wrapped.length * 6);
  }

  y += 6;
  ensureSpace(30);
  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 14;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Estimated Budget", margin, y);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(160, 120, 60);
  doc.text(summary.budgetDisplay, margin, y);
  doc.setTextColor(0);
  y += 14;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Currency: ${summary.currency}`, margin, y);
  y += 10;

  if (summary.packageSavingsUsd) {
    ensureSpace(8);
    doc.text(
      `Package savings (USD): $${summary.packageSavingsUsd.toLocaleString()}`,
      margin,
      y,
    );
    y += 8;
  }

  if (summary.excludedLabels.length > 0) {
    ensureSpace(12);
    doc.setFont("helvetica", "bold");
    doc.text("Removed deliverables:", margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    const excludedText = doc.splitTextToSize(
      summary.excludedLabels.join(" · "),
      contentWidth,
    );
    doc.text(excludedText, margin, y);
    y += excludedText.length * 5 + 4;
  }

  if (summary.ratesFallback) {
    ensureSpace(10);
    doc.setTextColor(180, 80, 60);
    const note = doc.splitTextToSize(
      "Note: Live exchange rates were unavailable. Fallback rates were used.",
      contentWidth,
    );
    doc.text(note, margin, y);
    doc.setTextColor(0);
    y += note.length * 5 + 6;
  }

  ensureSpace(20);
  y += 4;
  doc.setFontSize(9);
  doc.setTextColor(120);
  const disclaimer = doc.splitTextToSize(summary.disclaimer, contentWidth);
  doc.text(disclaimer, margin, y);
}

export async function downloadEstimatorPdf(
  options: DownloadEstimatorPdfOptions,
): Promise<void> {
  const summary = buildEstimatorSummaryLines(options);
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  renderSummaryToPdf(summary, doc);

  const projectSlug = slugify(options.state.type ?? "project");
  const dateStamp = new Date().toISOString().slice(0, 10);
  doc.save(`devix-estimate-${projectSlug}-${dateStamp}.pdf`);
}

export async function copyEstimatorSummary(
  options: DownloadEstimatorPdfOptions,
): Promise<void> {
  const summary = buildEstimatorSummaryLines(options);
  const text = buildEstimatorSummaryText(summary);
  await navigator.clipboard.writeText(text);
}
