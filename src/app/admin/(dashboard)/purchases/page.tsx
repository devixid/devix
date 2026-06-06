import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export const revalidate = 0;

export default async function AdminPurchasesPage() {
  const purchases = await prisma.purchase.findMany({
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
            View product downloads and one-time link usage.
          </p>
        </div>
      </div>

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
                Token Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {purchases.map((purchase) => {
              const isExpired = purchase.tokenExpiresAt < new Date();

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
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        purchase.tokenUsed
                          ? "bg-blue-500/10 text-blue-400"
                          : isExpired
                            ? "bg-red-500/10 text-red-400"
                            : "bg-emerald-500/10 text-emerald-400"
                      }`}
                    >
                      {purchase.tokenUsed
                        ? "Used"
                        : isExpired
                          ? "Expired"
                          : "Active"}
                    </span>
                  </td>
                </tr>
              );
            })}
            {purchases.length === 0 && (
              <tr>
                <td
                  colSpan={4}
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
