import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { DownloadComplete } from "@/components/download/DownloadComplete";
import { processDownloadToken } from "@/lib/download-token";
import { getDownloadLimiter, getClientIp } from "@/lib/rate-limit";

export const metadata = {
  title: "Download — Devix",
  robots: { index: false, follow: false },
};

type DownloadPageProps = {
  params: Promise<{ token: string }>;
};

export default async function DownloadTokenPage({ params }: DownloadPageProps) {
  const { token } = await params;

  // Rate limit per IP to blunt token brute-force / parallel-fetch hammering.
  const limiter = getDownloadLimiter();
  if (limiter) {
    const ip = getClientIp(await headers());
    const { success } = await limiter.limit(ip);
    if (!success) {
      redirect("/download/error");
    }
  }

  const result = await processDownloadToken(token);

  if (result.status === "invalid") redirect("/download/invalid");
  if (result.status === "used") redirect("/download/used");
  if (result.status === "expired") redirect("/download/expired");
  if (result.status === "revoked") redirect("/download/revoked");
  if (result.status === "error") redirect("/download/error");

  return (
    <DownloadComplete
      productName={result.productName}
      fileName={result.fileName}
      signedUrl={result.signedUrl}
      downloadsRemaining={result.downloadsRemaining}
    />
  );
}
