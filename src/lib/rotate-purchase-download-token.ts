import { prisma } from "@/lib/prisma";
import { generateDownloadToken } from "@/lib/tokens";

const DOWNLOAD_LINK_TTL_HOURS = 24;

/**
 * Issue a fresh download token and invalidate the previous one (lookup by old
 * token returns invalid). Resets the download grace window and extends expiry.
 */
export async function rotatePurchaseDownloadToken(purchaseId: string) {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + DOWNLOAD_LINK_TTL_HOURS);

  return prisma.purchase.update({
    where: { id: purchaseId },
    data: {
      downloadToken: generateDownloadToken(),
      downloadCount: 0,
      tokenUsed: false,
      firstDownloadedAt: null,
      downloadedAt: null,
      tokenExpiresAt: expiresAt,
    },
    include: { product: true },
  });
}
