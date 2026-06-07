"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface DownloadCompleteProps {
  productName: string;
  fileName: string;
  signedUrl: string;
  downloadsRemaining: number;
}

export function DownloadComplete({
  productName,
  fileName,
  signedUrl,
  downloadsRemaining,
}: DownloadCompleteProps) {
  const [downloadStarted, setDownloadStarted] = useState(false);

  useEffect(() => {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = signedUrl;
    iframe.title = "Download";
    document.body.appendChild(iframe);
    setDownloadStarted(true);

    return () => {
      iframe.remove();
    };
  }, [signedUrl]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="max-w-lg space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <span className="text-2xl">✓</span>
        </div>

        <h1 className="font-syne text-4xl font-bold tracking-tight text-zinc-900">
          Thank you for your purchase
        </h1>

        <p className="text-lg text-zinc-700">
          <strong>{productName}</strong> is on its way to your device.
        </p>

        <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-left text-sm text-amber-950">
          <p className="font-medium">Please read before you leave this page:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              This link is limited and expires 24 hours after purchase.{" "}
              {downloadsRemaining > 0 ? (
                <>
                  You have <strong>{downloadsRemaining}</strong> download
                  {downloadsRemaining === 1 ? "" : "s"} remaining.
                </>
              ) : (
                <>
                  This was your <strong>last available download</strong> — the
                  link is now used up.
                </>
              )}{" "}
              Do not close this tab until your file has finished downloading.
            </li>
            <li>
              If your download fails and the link is exhausted, you will need to
              purchase the product again from the store.
            </li>
            <li>
              Check your Downloads folder for{" "}
              <strong className="font-mono text-xs">{fileName}</strong>.
            </li>
          </ul>
        </div>

        {downloadStarted && (
          <p
            className="text-sm text-zinc-500"
            role="status"
          >
            Your download should start automatically.
          </p>
        )}

        <p className="text-sm text-zinc-600">
          Download not working?{" "}
          <a
            href={signedUrl}
            download={fileName}
            className="text-zinc-900 underline underline-offset-2 transition-colors hover:text-zinc-600"
          >
            Click here to download it manually
          </a>
          .
        </p>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-center">
          <a
            href={signedUrl}
            download={fileName}
            className="inline-flex items-center justify-center border border-black bg-black px-6 py-3 text-sm font-medium tracking-widest text-white uppercase transition-colors hover:bg-zinc-800"
          >
            Download again
          </a>
          <Link
            href="/store"
            className="inline-flex items-center justify-center border border-zinc-200 px-6 py-3 text-sm font-medium tracking-widest text-zinc-700 uppercase transition-colors hover:bg-zinc-50"
          >
            Back to store
          </Link>
        </div>
      </div>
    </div>
  );
}
