import Link from "next/link";

export default function DownloadUsedPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md space-y-6">
        <h1 className="font-syne text-4xl font-bold tracking-tight text-zinc-900">
          Link Already Used
        </h1>
        <p className="text-zinc-600">
          For security reasons, download links are single-use only. It appears
          this link has already been used to download the product.
        </p>
        <p className="text-sm text-zinc-500">
          If your download failed or you need another copy, please checkout the
          product again.
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
