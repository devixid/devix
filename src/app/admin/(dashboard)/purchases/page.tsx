import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { PurchaseRowActions } from "@/components/admin/PurchaseRowActions";
import { parseDateRangeFilter } from "@/lib/admin-filters";
import { PurchasesFilter } from "@/components/admin/PurchasesFilter";
import { Prisma } from "@prisma/client";

export const revalidate = 0;

function statusBadge(
  label: string,
  tone: "blue" | "red" | "green" | "amber" | "zinc",
) {
  const tones: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-400",
    red: "bg-red-500/10 text-red-400",
    green: "bg-emerald-500/10 text-emerald-400",
    amber: "bg-amber-500/10 text-amber-400",
    zinc: "bg-zinc-500/10 text-zinc-400",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {label}
    </span>
  );
}

interface Props {
  searchParams: Promise<{
    dateFrom?: string;
    dateTo?: string;
  }>;
}

export default async function AdminPurchasesPage({ searchParams }: Props) {
  const { dateFrom, dateTo } = await searchParams;

  const where: Prisma.PurchaseWhereInput = {};
  const createdAtRange = parseDateRangeFilter(dateFrom, dateTo);
  if (createdAtRange) {
    where.createdAt = createdAtRange;
  }

  const purchases = await prisma.purchase.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { product: true },
  });

  return (
    <div className="flex flex-col gap-y-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-zinc-100">
            Purchases
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            View product downloads, fulfillment, refunds and disputes.
          </p>
        </div>
      </div>

      <PurchasesFilter />


      <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/50">
        <table className="w-full text-left text-sm text-zinc-300">
          <thead className="border-b border-zinc-800 bg-zinc-800/50 text-xs text-zinc-400 uppercase">
            <tr>
              <th
                scope="col"
                className="px-6 py-4 font-medium"
              >
                Buyer
              </th>
              <th
                scope="col"
                className="px-6 py-4 font-medium"
              >
                Product
              </th>
              <th
                scope="col"
                className="px-6 py-4 font-medium"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-6 py-4 font-medium"
              >
                Email
              </th>
              <th
                scope="col"
                className="px-6 py-4 font-medium"
              >
                Downloads
              </th>
              <th
                scope="col"
                className="px-6 py-4 font-medium"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-4 font-medium"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {purchases.map((purchase) => {
              const isExpired = purchase.tokenExpiresAt < new Date();
              const isExhausted =
                purchase.downloadCount >= purchase.maxDownloads;

              return (
                <tr
                  key={purchase.id}
                  className="transition-colors hover:bg-zinc-800/50"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-zinc-100">
                      {purchase.buyerName}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {purchase.buyerEmail}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-300">
                    {purchase.product.name}
                  </td>
                  <td className="px-6 py-4 text-zinc-400">
                    {format(new Date(purchase.createdAt), "MMM d, yyyy HH:mm")}
                  </td>
                  <td className="px-6 py-4">
                    {purchase.emailSentAt
                      ? statusBadge("Sent", "green")
                      : statusBadge("Pending", "amber")}
                  </td>
                  <td className="px-6 py-4 text-zinc-400">
                    {purchase.downloadCount}/{purchase.maxDownloads}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-start gap-1">
                      {purchase.revokedAt
                        ? statusBadge("Revoked", "red")
                        : isExpired
                          ? statusBadge("Expired", "red")
                          : isExhausted
                            ? statusBadge("Used", "blue")
                            : statusBadge("Active", "green")}
                      {purchase.disputeStatus &&
                        statusBadge(
                          `Dispute: ${purchase.disputeStatus}`,
                          "amber",
                        )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <PurchaseRowActions
                      purchaseId={purchase.id}
                      isRevoked={Boolean(purchase.revokedAt)}
                    />
                  </td>
                </tr>
              );
            })}
            {purchases.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-8 text-center text-zinc-500"
                >
                  No purchases found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
