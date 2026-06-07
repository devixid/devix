import Link from "next/link";

export default function DownloadRevokedPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md space-y-6">
        <h1 className="font-syne text-4xl font-bold tracking-tight text-zinc-900">
          Download Unavailable
        </h1>
        <p className="text-zinc-600">
          Access to this download has been revoked. This usually happens after a
          refund or a payment dispute on the order.
        </p>
        <p className="text-sm text-zinc-500">
          If you believe this is a mistake, please contact support with your
          purchase email.
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
