import { prisma } from "@/lib/prisma";

export const revalidate = 0;

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div className="flex flex-col gap-y-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-zinc-100">
            Products
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Manage your digital products and starter kits.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/50">
        <table className="w-full text-left text-sm text-zinc-300">
          <thead className="border-b border-zinc-800 bg-zinc-800/50 text-xs uppercase text-zinc-400">
            <tr>
              <th scope="col" className="px-6 py-4 font-medium">Name</th>
              <th scope="col" className="px-6 py-4 font-medium">Price</th>
              <th scope="col" className="px-6 py-4 font-medium">Visibility</th>
              <th scope="col" className="px-6 py-4 font-medium">File Key</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {products.map((product) => (
              <tr key={product.id} className="transition-colors hover:bg-zinc-800/50">
                <td className="px-6 py-4 font-medium text-zinc-100">
                  {product.name}
                </td>
                <td className="px-6 py-4">
                  ${product.price.toFixed(2)}
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
                <td className="px-6 py-4 text-xs font-mono text-zinc-500">
                  {product.fileKey}
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
