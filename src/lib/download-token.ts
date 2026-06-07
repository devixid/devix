import { prisma } from "@/lib/prisma";
import {
  PRODUCTS_STORAGE_BUCKET,
  resolveProductStoragePath,
} from "@/lib/product-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Signed URL lifetime. Long enough for large files / slow connections.
const SIGNED_URL_TTL_SECONDS = 300;

export type DownloadTokenResult =
  | { status: "invalid" }
  | { status: "used" }
  | { status: "expired" }
  | { status: "revoked" }
  | { status: "error" }
  | {
      status: "ready";
      productName: string;
      fileName: string;
      signedUrl: string;
      downloadsRemaining: number;
    };

/**
 * Verify the storage object exists and is non-empty BEFORE we consume a
 * download from the grace window. Prevents burning a download on an orphaned
 * or zero-byte file.
 */
async function assertObjectIsDownloadable(
  storagePath: string,
): Promise<boolean> {
  const lastSlash = storagePath.lastIndexOf("/");
  const dir = lastSlash >= 0 ? storagePath.slice(0, lastSlash) : "";
  const name = lastSlash >= 0 ? storagePath.slice(lastSlash + 1) : storagePath;

  const { data, error } = await supabaseAdmin.storage
    .from(PRODUCTS_STORAGE_BUCKET)
    .list(dir, { search: name, limit: 100 });

  if (error || !data) {
    console.error("[Download] Storage list failed:", error);
    return false;
  }

  const match = data.find((obj) => obj.name === name);
  if (!match) return false;

  const size = (match.metadata as { size?: number } | null)?.size;
  // If size metadata is unavailable, fall back to existence only.
  if (typeof size === "number" && size <= 0) return false;

  return true;
}

export async function processDownloadToken(
  token: string,
): Promise<DownloadTokenResult> {
  if (!token) {
    return { status: "invalid" };
  }

  const purchase = await prisma.purchase.findUnique({
    where: { downloadToken: token },
    include: { product: true },
  });

  if (!purchase) {
    return { status: "invalid" };
  }

  if (purchase.revokedAt) {
    return { status: "revoked" };
  }

  if (purchase.tokenExpiresAt < new Date()) {
    return { status: "expired" };
  }

  if (purchase.downloadCount >= purchase.maxDownloads) {
    return { status: "used" };
  }

  const storagePath = resolveProductStoragePath(purchase.product.fileKey);

  const downloadable = await assertObjectIsDownloadable(storagePath);
  if (!downloadable) {
    console.error(
      `[Download] Object missing/empty (bucket: ${PRODUCTS_STORAGE_BUCKET}, path: ${storagePath}, fileKey: ${purchase.product.fileKey})`,
    );
    return { status: "error" };
  }

  const { data, error } = await supabaseAdmin.storage
    .from(PRODUCTS_STORAGE_BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    console.error("[Download] Failed to generate signed URL:", error);
    return { status: "error" };
  }

  // Atomically consume one download from the grace window. The guard ensures
  // we never exceed maxDownloads and never serve a revoked/expired token even
  // under concurrent requests.
  const now = new Date();
  const updateResult = await prisma.purchase.updateMany({
    where: {
      id: purchase.id,
      revokedAt: null,
      tokenExpiresAt: { gt: now },
      downloadCount: { lt: purchase.maxDownloads },
    },
    data: {
      downloadCount: { increment: 1 },
      downloadedAt: now,
      ...(purchase.firstDownloadedAt ? {} : { firstDownloadedAt: now }),
      // Keep the legacy flag meaningful for older tooling.
      ...(purchase.downloadCount + 1 >= purchase.maxDownloads
        ? { tokenUsed: true }
        : {}),
    },
  });

  if (updateResult.count === 0) {
    // Lost the race or state changed between read and write.
    const fresh = await prisma.purchase.findUnique({
      where: { id: purchase.id },
      select: { revokedAt: true, tokenExpiresAt: true },
    });
    if (fresh?.revokedAt) return { status: "revoked" };
    if (fresh && fresh.tokenExpiresAt < new Date())
      return { status: "expired" };
    return { status: "used" };
  }

  const fileName =
    storagePath.split("/").pop() ?? `${purchase.product.slug}.zip`;
  const downloadsRemaining = Math.max(
    0,
    purchase.maxDownloads - (purchase.downloadCount + 1),
  );

  return {
    status: "ready",
    productName: purchase.product.name,
    fileName,
    signedUrl: data.signedUrl,
    downloadsRemaining,
  };
}
