import Link from "next/link";
import { PurchaseEmailResend } from "@/components/molecules/PurchaseEmailResend";
import { maskEmail } from "@/lib/purchase-email-resend";
import { resolvePaymentProviderId } from "@/lib/payment";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export const metadata = {
  title: "Payment Successful — Devix Store",
};

type SuccessPageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function StoreSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const { session_id: sessionId } = await searchParams;
  const providerId = await resolvePaymentProviderId();
  let productName: string | null = null;
  let maskedEmail: string | null = null;

  if (sessionId && providerId === "stripe" && isStripeConfigured()) {
    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["line_items"],
      });
      productName = session.line_items?.data[0]?.description ?? null;
      if (!productName && session.metadata?.productId) {
        productName = "your purchase";
      }

      const buyerEmail =
        session.metadata?.buyerEmail ||
        session.customer_details?.email ||
        session.customer_email;
      if (buyerEmail) {
        maskedEmail = maskEmail(buyerEmail);
      }
    } catch {
      // Non-blocking — resend flow re-verifies the session server-side.
    }
  }

  return (
    <div className="grain-overlay flex min-h-screen items-center justify-center bg-white px-6 pt-[120px] pb-32">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <span className="text-2xl">✓</span>
        </div>
        <h1 className="font-syne text-3xl font-bold tracking-tight text-zinc-900">
          Payment successful
        </h1>
        <p className="mt-4 text-zinc-600">
          {productName
            ? `Thank you for purchasing ${productName}.`
            : "Thank you for your purchase."}{" "}
          Your secure download link is sent to your email and expires in 24
          hours.
        </p>
        <p className="mt-2 text-sm text-zinc-500">
          Check your inbox and spam folder. The link allows a limited number of
          downloads.
        </p>

        {sessionId ? (
          <PurchaseEmailResend
            sessionId={sessionId}
            maskedEmail={maskedEmail}
          />
        ) : (
          <p className="mt-6 text-sm text-zinc-500">
            If you don&apos;t receive an email within a few minutes, contact
            support with your receipt.
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/store"
            className="inline-flex items-center justify-center border border-black bg-black px-6 py-3 text-sm font-medium tracking-widest text-white uppercase transition-colors hover:bg-zinc-800"
          >
            Back to store
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center border border-zinc-200 px-6 py-3 text-sm font-medium tracking-widest text-zinc-700 uppercase transition-colors hover:bg-zinc-50"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
