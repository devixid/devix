import { Resend } from "resend";
import { getNotificationEmail } from "@/lib/site-settings";
import type { EstimatorSummary } from "@/lib/estimator-summary";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "";
}

type ResendConfig = {
  resend: Resend;
  fromEmail: string;
};

function getResendConfig(): ResendConfig | null {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    console.warn("[Email] RESEND_API_KEY or RESEND_FROM_EMAIL not configured.");
    return null;
  }

  return { resend: new Resend(apiKey), fromEmail };
}

export async function sendInquiryNotification({
  name,
  email,
  message,
  source = "contact",
}: {
  name: string;
  email: string;
  message: string;
  source?: string;
}) {
  const config = getResendConfig();
  if (!config) return;

  const to = await getNotificationEmail();
  if (!to) {
    console.warn("[Email] No notification recipient configured.");
    return;
  }

  const sourceLabel =
    source === "estimator" ? "Estimator Lead" : "Contact Form";
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");
  const inboxUrl = `${getSiteUrl()}/admin/inbox`;

  const { error } = await config.resend.emails.send({
    from: config.fromEmail,
    to: [to],
    subject: `[Devix] New ${sourceLabel} from ${name}`,
    html: `
      <h2>New inquiry received</h2>
      <p><strong>Source:</strong> ${escapeHtml(sourceLabel)}</p>
      <p><strong>Name:</strong> ${safeName}</p>
      <p><strong>Email:</strong> ${safeEmail}</p>
      <hr />
      <p>${safeMessage}</p>
      <hr />
      <p><a href="${escapeHtml(inboxUrl)}">View in Admin Inbox</a></p>
    `,
  });

  if (error) {
    console.error(
      "[Email] Failed to send inquiry notification:",
      error.message,
    );
  }
}

export async function sendContactConfirmation({
  name,
  email,
  source = "contact",
}: {
  name: string;
  email: string;
  source?: string;
}) {
  const config = getResendConfig();
  if (!config) return;

  const safeName = escapeHtml(name);
  const siteUrl = getSiteUrl();
  const isEstimator = source === "estimator";

  const bodyCopy = isEstimator
    ? `<p>Thank you for scheduling a consultation with Devix. We have received your project details and saved your estimate. Our team will review everything and follow up within <strong>24 hours</strong>.</p>
       <p>If you need to add anything in the meantime, simply reply to this email.</p>`
    : `<p>Thank you for reaching out to Devix. We have received your message and will get back to you within <strong>24 hours</strong>.</p>
       <p>If your inquiry is urgent, feel free to reply to this email.</p>`;

  const { error } = await config.resend.emails.send({
    from: config.fromEmail,
    to: [email],
    subject: "We received your message — Devix",
    html: `
      <h2>Hi ${safeName},</h2>
      ${bodyCopy}
      <p><a href="${escapeHtml(siteUrl)}">Visit Devix</a></p>
      <hr />
      <p style="color:#666;font-size:12px;">This is an automated confirmation from Devix. Please do not share sensitive credentials over email.</p>
    `,
  });

  if (error) {
    console.error(
      "[Email] Failed to send contact confirmation:",
      error.message,
    );
  }
}

export type EstimatorLeadEmailData = {
  leadId: string;
  projectType: string;
  designApproach: string | null;
  platform: string | null;
  scope: string;
  complexity: string;
  timeline: string;
  budgetDisplay: string;
  currency: string;
  excludedDeliverables: unknown;
};

function formatExcludedDeliverables(excluded: unknown): string {
  if (!excluded) return "None";
  if (Array.isArray(excluded)) {
    if (excluded.length === 0) return "None";
    return excluded
      .map((item) =>
        typeof item === "string"
          ? item
          : typeof item === "object" && item && "label" in item
            ? String((item as { label: string }).label)
            : JSON.stringify(item),
      )
      .join(", ");
  }
  return escapeHtml(String(excluded));
}

export async function sendEstimatorLeadNotification(
  data: EstimatorLeadEmailData,
) {
  const config = getResendConfig();
  if (!config) return;

  const to = await getNotificationEmail();
  if (!to) {
    console.warn("[Email] No notification recipient configured.");
    return;
  }

  const leadUrl = `${getSiteUrl()}/admin/leads/${data.leadId}`;
  const excluded = formatExcludedDeliverables(data.excludedDeliverables);

  const { error } = await config.resend.emails.send({
    from: config.fromEmail,
    to: [to],
    subject: `[Devix] New estimator lead — ${data.projectType} / ${data.budgetDisplay}`,
    html: `
      <h2>New estimator lead</h2>
      <p>A visitor completed the project estimator and saved a new lead.</p>
      <table cellpadding="4" cellspacing="0" style="border-collapse:collapse;">
        <tr><td><strong>Project type</strong></td><td>${escapeHtml(data.projectType)}</td></tr>
        <tr><td><strong>Design</strong></td><td>${escapeHtml(data.designApproach ?? "—")}</td></tr>
        <tr><td><strong>Platform</strong></td><td>${escapeHtml(data.platform ?? "—")}</td></tr>
        <tr><td><strong>Scope</strong></td><td>${escapeHtml(data.scope)}</td></tr>
        <tr><td><strong>Complexity</strong></td><td>${escapeHtml(data.complexity)}</td></tr>
        <tr><td><strong>Timeline</strong></td><td>${escapeHtml(data.timeline)}</td></tr>
        <tr><td><strong>Budget</strong></td><td>${escapeHtml(data.budgetDisplay)} (${escapeHtml(data.currency)})</td></tr>
        <tr><td><strong>Excluded deliverables</strong></td><td>${escapeHtml(excluded)}</td></tr>
      </table>
      <p><a href="${escapeHtml(leadUrl)}">View lead in Admin</a></p>
      <p style="color:#666;font-size:12px;">Contact details will appear after the visitor submits the consultation form.</p>
    `,
  });

  if (error) {
    console.error(
      "[Email] Failed to send estimator lead notification:",
      error.message,
    );
  }
}

export async function sendClientEstimateEmail({
  name,
  email,
  summary,
  pdfBase64,
  shareToken,
}: {
  name: string;
  email: string;
  summary: EstimatorSummary;
  pdfBase64?: string;
  shareToken?: string;
}) {
  const config = getResendConfig();
  if (!config) return;

  const safeName = escapeHtml(name);
  const siteUrl = getSiteUrl();
  const summaryText = summary.lines
    .map(
      (line) =>
        `<tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>${escapeHtml(line.label)}</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${escapeHtml(line.value)}</td></tr>`,
    )
    .join("");

  const attachments = pdfBase64
    ? [
        {
          filename: `devix-estimate-${new Date().toISOString().slice(0, 10)}.pdf`,
          content: pdfBase64,
        },
      ]
    : undefined;

  const { error } = await config.resend.emails.send({
    from: config.fromEmail,
    to: [email],
    subject: "Your Project Estimate breakdown — Devix",
    attachments,
    html: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="font-weight: 300; margin-bottom: 10px;">Hi ${safeName},</h2>
        <p style="font-size: 15px; line-height: 1.5; color: #666;">Thank you for using the Devix Project Estimator. Here is the breakdown of your estimated budget and scope:</p>
        
        <table cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          ${summaryText}
          <tr>
            <td style="padding: 15px 0 5px 0;"><strong>Estimated Budget</strong></td>
            <td style="padding: 15px 0 5px 0; text-align: right; font-size: 20px; font-weight: bold; color: #a0783c;">${escapeHtml(summary.budgetDisplay)} (${escapeHtml(summary.currency)})</td>
          </tr>
        </table>
        
        ${
          summary.packageSavingsUsd
            ? `<p style="font-size: 14px; color: #2e7d32; margin-top: 5px;"><strong>Package savings (USD):</strong> $${summary.packageSavingsUsd.toLocaleString()}</p>`
            : ""
        }
        
        ${
          summary.excludedLabels.length > 0
            ? `<p style="font-size: 13px; color: #666; margin-top: 15px;"><strong>Removed deliverables:</strong> ${escapeHtml(summary.excludedLabels.join(", "))}</p>`
            : ""
        }
        
        ${
          summary.ratesFallback
            ? `<p style="font-size: 12px; color: #c62828; margin-top: 15px;"><em>Note: Live exchange rates were unavailable when this estimate was generated.</em></p>`
            : ""
        }
        
        <p style="font-size: 14px; line-height: 1.6; color: #777; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
          ${escapeHtml(summary.disclaimer)}
        </p>
        
        <div style="margin-top: 35px; text-align: center;">
          ${
            shareToken
              ? `<a href="${escapeHtml(siteUrl)}/estimate/share/${encodeURIComponent(shareToken)}" style="background-color: #a0783c; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px; display: inline-block; margin-right: 10px;">View Interactive Proposal</a>`
              : ""
          }
          <a href="${escapeHtml(siteUrl)}" style="background-color: #000; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px; display: inline-block;">Explore Devix Portfolio</a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0 20px 0;" />
        <p style="color:#999;font-size:11px;text-align:center;">This is an automated estimation copy from Devix. Please do not reply directly to this email.</p>
      </div>
    `,
  });

  if (error) {
    console.error("[Email] Failed to send client estimate email:", error.message);
    throw new Error(`Client estimate email failed: ${error.message}`);
  }
}

export async function sendPurchaseConfirmation({
  name,
  email,
  productName,
  downloadToken,
  siteUrl,
}: {
  name: string;
  email: string;
  productName: string;
  downloadToken: string;
  siteUrl?: string;
}) {
  const config = getResendConfig();
  if (!config) {
    throw new Error(
      "Purchase confirmation email failed: RESEND_API_KEY or RESEND_FROM_EMAIL not configured.",
    );
  }

  const safeName = escapeHtml(name);
  const baseUrl = (siteUrl || getSiteUrl()).replace(/\/$/, "");
  const downloadUrl = `${baseUrl}/download/${encodeURIComponent(downloadToken)}`;

  const { error } = await config.resend.emails.send({
    from: config.fromEmail,
    to: [email],
    subject: `Your download link: ${escapeHtml(productName)} — Devix`,
    html: `
      <h2>Hi ${safeName},</h2>
      <p>Thank you for downloading <strong>${escapeHtml(productName)}</strong> from Devix.</p>
      <p>Here is your unique download link. For security reasons, this link is valid for a <strong>limited number of downloads</strong> and will expire in 24 hours.</p>
      <p style="margin: 30px 0;">
        <a href="${escapeHtml(downloadUrl)}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Download ${escapeHtml(productName)}</a>
      </p>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${escapeHtml(downloadUrl)}</p>
      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;" />
      <p style="color:#666;font-size:12px;">This is an automated message from Devix. Please do not share this link.</p>
    `,
  });

  if (error) {
    // Throw so the caller (webhook fulfillment) can return 500 and let Stripe
    // retry until the email is actually delivered. The emailSentAt gate
    // prevents duplicate sends on retry.
    console.error(
      "[Email] Failed to send purchase confirmation:",
      error.message,
    );
    throw new Error(`Purchase confirmation email failed: ${error.message}`);
  }
}
