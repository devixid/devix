import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth";
import { parseDateRangeFilter } from "@/lib/admin-filters";
import { toCsvContent } from "@/lib/csv";
import { Prisma } from "@prisma/client";

const CSV_HEADERS = [
  "id",
  "buyerName",
  "buyerEmail",
  "productId",
  "productName",
  "createdAt",
  "amount",
  "currency",
  "provider",
  "status",
  "downloadCount",
  "maxDownloads",
  "stripeSessionId",
  "lemonSqueezyOrderId",
  "disputeStatus",
] as const;

export async function GET(request: NextRequest) {
  try {
    await verifyAdminSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const dateFrom = searchParams.get("dateFrom") ?? undefined;
  const dateTo = searchParams.get("dateTo") ?? undefined;

  const where: Prisma.PurchaseWhereInput = {};
  const createdAtRange = parseDateRangeFilter(dateFrom, dateTo);
  if (createdAtRange) {
    where.createdAt = createdAtRange;
  }

  const purchases = await prisma.purchase.findMany({
    where,
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();

  const rows = purchases.map((purchase) => {
    const isExpired = purchase.tokenExpiresAt < now;
    const isExhausted = purchase.downloadCount >= purchase.maxDownloads;
    
    let status = "Active";
    if (purchase.revokedAt) {
      status = "Revoked";
    } else if (isExpired) {
      status = "Expired";
    } else if (isExhausted) {
      status = "Used";
    }

    const amount = purchase.amountMinor 
      ? (Number(purchase.amountMinor) / 100).toFixed(2)
      : "0.00";

    return [
      purchase.id,
      purchase.buyerName,
      purchase.buyerEmail,
      purchase.productId,
      purchase.product.name,
      purchase.createdAt.toISOString(),
      amount,
      purchase.currency,
      purchase.provider,
      status,
      purchase.downloadCount.toString(),
      purchase.maxDownloads.toString(),
      purchase.stripeSessionId ?? "",
      purchase.lemonSqueezyOrderId ?? "",
      purchase.disputeStatus ?? "",
    ];
  });

  const csv = toCsvContent([...CSV_HEADERS], rows);
  const dateStamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="devix-purchases-${dateStamp}.csv"`,
    },
  });
}
