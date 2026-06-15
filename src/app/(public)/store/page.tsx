import { prisma } from "@/lib/prisma";
import CatalogClient from "@/components/organisms/CatalogClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Store - Starter Kits & Templates",
  description:
    "High-quality, production-ready starter kits and templates from Devix.",
  alternates: {
    canonical: "/store",
  },
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

  // Product structured data for rich results
  const productSchema = products.map((p) => ({
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://devixid.vercel.app"}/store`,
    offers: {
      "@type": "Offer",
      price: p.price.toString(),
      priceCurrency: p.currency.toUpperCase(),
      availability: "https://schema.org/InStock",
      url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://devixid.vercel.app"}/store/checkout?product=${p.slug}`,
    },
  }));

  return (
    <div className="grain-overlay min-h-screen bg-white pt-[120px] pb-32">
      {productSchema.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productSchema),
          }}
        />
      )}
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
