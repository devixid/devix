import { Resend } from "resend";
import { getNotificationEmail } from "@/lib/site-settings";

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
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    console.warn("[Email] RESEND_API_KEY or RESEND_FROM_EMAIL not configured.");
    return;
  }

  const to = await getNotificationEmail();
  if (!to) {
    console.warn("[Email] No notification recipient configured.");
    return;
  }

  const resend = new Resend(apiKey);
  const sourceLabel = source === "estimator" ? "Estimator Lead" : "Contact Form";

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: [to],
    subject: `[Devix] New ${sourceLabel} from ${name}`,
    html: `
      <h2>New inquiry received</h2>
      <p><strong>Source:</strong> ${sourceLabel}</p>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <hr />
      <p>${message.replace(/\n/g, "<br />")}</p>
      <hr />
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || ""}/admin/inbox">View in Admin Inbox</a></p>
    `,
  });

  if (error) {
    console.error("[Email] Failed to send inquiry notification:", error.message);
  }
}
