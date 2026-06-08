import ProductForm from "@/components/admin/ProductForm";
import { prisma } from "@/lib/prisma";
import { getProductFileStatus } from "@/lib/product-storage";
import { notFound } from "next/navigation";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    notFound();
  }

  const fileStatus = await getProductFileStatus(product.fileKey);

  return (
    <ProductForm
      initialData={product}
      fileExists={fileStatus.exists}
    />
  );
}
