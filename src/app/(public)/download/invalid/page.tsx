import Link from "next/link";


export default function DownloadInvalidPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md space-y-6">
        <h1 className="font-syne text-4xl font-bold tracking-tight text-zinc-900">
          Invalid Link
        </h1>
        <p className="text-zinc-600">
          We couldn't find a valid download token. Please ensure you copied the entire link from your email correctly.
        </p>
        <div className="pt-4">
          <Link
            href="/store"
            className="inline-block border border-black bg-black px-6 py-3 text-sm font-medium tracking-widest text-white uppercase transition-colors hover:bg-white hover:text-black"
          >
            Browse Store
          </Link>
        </div>
      </div>
    </div>
  );
}
