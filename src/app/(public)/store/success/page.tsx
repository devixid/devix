import Link from "next/link";
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
  let productName: string | null = null;

  if (sessionId && isStripeConfigured()) {
    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["line_items"],
      });
      productName = session.line_items?.data[0]?.description ?? null;
      if (!productName && session.metadata?.productId) {
        productName = "your purchase";
      }
    } catch {
      // Non-blocking — email is the source of truth for the download link
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
          We&apos;ve sent a secure, one-time download link to your email. It
          expires in 24 hours.
        </p>
        <p className="mt-2 text-sm text-zinc-500">
          Check your inbox (and spam folder). The link can only be used once.
        </p>
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
