import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Download Error — Devix",
  robots: { index: false, follow: false },
};

export default function DownloadErrorPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md space-y-6">
        <h1 className="font-syne text-4xl font-bold tracking-tight text-zinc-900">
          Download Error
        </h1>
        <p className="text-zinc-600">
          There was a problem preparing your download. The file might be
          temporarily unavailable or misconfigured.
        </p>
        <p className="text-sm text-zinc-500">
          Please try again later. If the problem persists, please contact
          support.
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
