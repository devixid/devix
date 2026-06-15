import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout Cancelled — Devix Store",
  robots: { index: false, follow: false },
};

export default function StoreCancelPage() {
  return (
    <div className="grain-overlay flex min-h-screen items-center justify-center bg-white px-6 pt-[120px] pb-32">
      <div className="max-w-md text-center">
        <h1 className="font-syne text-3xl font-bold tracking-tight text-zinc-900">
          Checkout cancelled
        </h1>
        <p className="mt-4 text-zinc-600">
          No payment was taken. You can return to the store and try again
          whenever you&apos;re ready.
        </p>
        <Link
          href="/store"
          className="mt-8 inline-flex items-center justify-center border border-black bg-black px-6 py-3 text-sm font-medium tracking-widest text-white uppercase transition-colors hover:bg-zinc-800"
        >
          Back to store
        </Link>
      </div>
    </div>
  );
}
