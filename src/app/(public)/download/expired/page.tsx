import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Link Expired — Devix",
  robots: { index: false, follow: false },
};

export default function DownloadExpiredPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md space-y-6">
        <h1 className="font-syne text-4xl font-bold tracking-tight text-zinc-900">
          Link Expired
        </h1>
        <p className="text-zinc-600">
          This download link has expired. Download links are only valid for 24
          hours after your request.
        </p>
        <p className="text-sm text-zinc-500">
          Please request a new download from the store if you still need the
          product.
        </p>
        <div className="pt-4">
          <Link
            href="/store"
            className="inline-block border border-black bg-black px-6 py-3 text-sm font-medium tracking-widest text-white uppercase transition-colors hover:bg-white hover:text-black"
          >
            Return to Store
          </Link>
        </div>
      </div>
    </div>
  );
}
