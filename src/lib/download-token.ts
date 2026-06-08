import { prisma } from "@/lib/prisma";
import {
  PRODUCTS_STORAGE_BUCKET,
  getProductFileStatus,
  resolveProductStoragePath,
} from "@/lib/product-storage";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

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

  const fileKey =
    purchase.deliveredFileKey ?? purchase.product.fileKey;
  const storagePath = resolveProductStoragePath(fileKey);

  const fileStatus = await getProductFileStatus(fileKey);
  if (!fileStatus.exists) {
    console.error(
      `[Download] Object missing/empty (bucket: ${PRODUCTS_STORAGE_BUCKET}, path: ${storagePath}, fileKey: ${fileKey})`,
    );
    return { status: "error" };
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage
    .from(PRODUCTS_STORAGE_BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    console.error("[Download] Failed to generate signed URL:", error);
    return { status: "error" };
  }

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
      ...(purchase.downloadCount + 1 >= purchase.maxDownloads
        ? { tokenUsed: true }
        : {}),
    },
  });

  if (updateResult.count === 0) {
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
