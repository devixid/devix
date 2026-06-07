export function getRequestBaseUrl(headerList: Headers): string {
  const forwardedHost = headerList.get("x-forwarded-host");
  const host =
    forwardedHost?.split(",")[0]?.trim() ?? headerList.get("host") ?? "";

  if (!host) {
    return (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  }

  const forwardedProto = headerList.get("x-forwarded-proto");
  const proto =
    forwardedProto?.split(",")[0]?.trim() ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https");

  return `${proto}://${host}`;
}
