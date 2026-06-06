import { prisma } from "@/lib/prisma";
import CatalogClient from "@/components/organisms/CatalogClient";

export const metadata = {
  title: "Store - Starter Kits & Templates",
  description: "High-quality, production-ready starter kits and templates from Devix.",
};

export const revalidate = 3600;

export default async function StorePage() {
  const products = await prisma.product.findMany({
    where: { isVisible: true },
    orderBy: { order: "asc" },
  });

  const mappedProducts = products.map((p) => ({
    ...p,
    title: p.name,
  }));

  return (
    <div className="grain-overlay min-h-screen bg-white pt-[120px] pb-32">
      <CatalogClient
        title="Store."
        eyebrow="Digital Products"
        items={mappedProducts}
        cardType="product"
        emptyStateMessage="No products available at the moment. Please check back later."
      />
    </div>
  );
}
