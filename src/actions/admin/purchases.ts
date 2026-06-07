"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession, verifyCsrfOrigin } from "@/lib/auth";
import { logActivity } from "@/lib/activity-log";
import { sendPurchaseConfirmation } from "@/lib/email";
import { generateDownloadToken } from "@/lib/tokens";

export type AdminPurchaseActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

export async function resendPurchaseEmail(
  purchaseId: string,
): Promise<AdminPurchaseActionResult> {
  await verifyAdminSession();
  await verifyCsrfOrigin();

  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    include: { product: true },
  });
  if (!purchase) return { ok: false, error: "Purchase not found." };
  if (purchase.revokedAt) {
    return { ok: false, error: "Cannot resend: access has been revoked." };
  }

  try {
    await sendPurchaseConfirmation({
      name: purchase.buyerName,
      email: purchase.buyerEmail,
      productName: purchase.product.name,
      downloadToken: purchase.downloadToken,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "",
    });
  } catch {
    return { ok: false, error: "Email failed to send. Try again." };
  }

  await prisma.purchase.update({
    where: { id: purchase.id },
    data: { emailSentAt: new Date() },
  });

  await logActivity({
    action: "purchase.email_resent",
    entityType: "Purchase",
    entityId: purchase.id,
  });

  revalidatePath("/admin/purchases");
  return { ok: true, message: "Confirmation email resent." };
}

export async function revokePurchase(
  purchaseId: string,
): Promise<AdminPurchaseActionResult> {
  await verifyAdminSession();
  await verifyCsrfOrigin();

  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
  });
  if (!purchase) return { ok: false, error: "Purchase not found." };

  await prisma.purchase.update({
    where: { id: purchase.id },
    data: { revokedAt: purchase.revokedAt ?? new Date() },
  });

  await logActivity({
    action: "purchase.revoked",
    entityType: "Purchase",
    entityId: purchase.id,
  });

  revalidatePath("/admin/purchases");
  return { ok: true, message: "Download access revoked." };
}

export async function regeneratePurchaseToken(
  purchaseId: string,
): Promise<AdminPurchaseActionResult> {
  await verifyAdminSession();
  await verifyCsrfOrigin();

  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    include: { product: true },
  });
  if (!purchase) return { ok: false, error: "Purchase not found." };

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  const updated = await prisma.purchase.update({
    where: { id: purchase.id },
    data: {
      downloadToken: generateDownloadToken(),
      downloadCount: 0,
      tokenUsed: false,
      firstDownloadedAt: null,
      downloadedAt: null,
      revokedAt: null,
      tokenExpiresAt: expiresAt,
      emailSentAt: null,
    },
    include: { product: true },
  });

  // Re-send the link with the fresh token.
  try {
    await sendPurchaseConfirmation({
      name: updated.buyerName,
      email: updated.buyerEmail,
      productName: updated.product.name,
      downloadToken: updated.downloadToken,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "",
    });
    await prisma.purchase.update({
      where: { id: updated.id },
      data: { emailSentAt: new Date() },
    });
  } catch {
    // Token is regenerated even if email fails; admin can resend.
  }

  await logActivity({
    action: "purchase.token_regenerated",
    entityType: "Purchase",
    entityId: purchase.id,
  });

  revalidatePath("/admin/purchases");
  return { ok: true, message: "New download link generated and emailed." };
}
