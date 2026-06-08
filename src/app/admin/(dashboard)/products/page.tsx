import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMinor, resolveProductAmount } from "@/lib/money";
import { getProductFileStatus } from "@/lib/product-storage";
import { ProductRowActions } from "@/components/admin/ProductRowActions";
import { Plus } from "lucide-react";

export const revalidate = 0;

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { order: "asc" },
  });

  const fileStatuses = await Promise.all(
    products.map(async (product) => ({
      id: product.id,
      status: await getProductFileStatus(product.fileKey),
    })),
  );
  const statusById = Object.fromEntries(
    fileStatuses.map(({ id, status }) => [id, status]),
  );

  return (
    <div className="flex flex-col gap-y-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-zinc-100">
            Products
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Manage digital products, files, and store visibility.
          </p>
        </div>
        <Link
          href="/admin/products/create"
          className="inline-flex items-center gap-2 rounded-lg bg-[#C8A96E] px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add product
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/50">
        <table className="w-full text-left text-sm text-zinc-300">
          <thead className="border-b border-zinc-800 bg-zinc-800/50 text-xs text-zinc-400 uppercase">
            <tr>
              <th
                scope="col"
                className="px-6 py-4 font-medium"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-4 font-medium"
              >
                Price
              </th>
              <th
                scope="col"
                className="px-6 py-4 font-medium"
              >
                Visibility
              </th>
              <th
                scope="col"
                className="px-6 py-4 font-medium"
              >
                File
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
            {products.map((product) => {
              const { amountMinor, currency } = resolveProductAmount(product);
              const fileStatus = statusById[product.id];

              return (
                <tr
                  key={product.id}
                  className="transition-colors hover:bg-zinc-800/50"
                >
                  <td className="px-6 py-4 font-medium text-zinc-100">
                    {product.name}
                  </td>
                  <td className="px-6 py-4">
                    {formatMinor(amountMinor, currency)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        product.isVisible
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-zinc-500/10 text-zinc-400"
                      }`}
                    >
                      {product.isVisible ? "Visible" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-mono text-xs text-zinc-500">
                      {product.fileKey}
                    </div>
                    <span
                      className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        fileStatus?.exists
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {fileStatus?.exists ? "In storage" : "Missing"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <ProductRowActions
                      productId={product.id}
                      isVisible={product.isVisible}
                    />
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-zinc-500"
                >
                  No products yet.{" "}
                  <Link
                    href="/admin/products/create"
                    className="text-[#C8A96E] hover:underline"
                  >
                    Create one
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
