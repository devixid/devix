"use server";

import {
  Decimal,
  isAboveStripeMinimum,
  priceToMinor,
} from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { verifyAdminSession, verifyCsrfOrigin } from "@/lib/auth";
import { logActivity } from "@/lib/activity-log";
import { ProductSchema } from "@/lib/schemas";
import {
  assertProductFileExists,
  buildProductFileKey,
  deleteProductFile,
  getProductFileStatus,
  isAllowedProductExtension,
  MAX_PRODUCT_FILE_BYTES,
  uploadProductFile,
} from "@/lib/product-storage";

const PRODUCT_PATHS = ["/admin/products", "/store", "/"] as const;

function revalidateProductPaths() {
  for (const path of PRODUCT_PATHS) {
    revalidatePath(path);
  }
}

function parseProductFormData(formData: FormData) {
  const parsed = ProductSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    price: formData.get("price"),
    currency: formData.get("currency") ?? "usd",
    previewUrl: formData.get("previewUrl") ?? "",
    lemonSqueezyVariantId: formData.get("lemonSqueezyVariantId") ?? "",
    isVisible: formData.get("isVisible") ?? "true",
    order: formData.get("order") ?? "0",
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid product data.");
  }

  return parsed.data;
}

function validateProductFile(file: File, required: boolean) {
  if (!file || file.size === 0) {
    if (required) {
      throw new Error("A digital product file is required.");
    }
    return null;
  }

  if (file.size > MAX_PRODUCT_FILE_BYTES) {
    throw new Error("File must be 50 MB or smaller.");
  }

  if (!isAllowedProductExtension(file.name)) {
    throw new Error("Allowed file types: .zip, .pdf, .tar.gz, .tgz");
  }

  return file;
}

async function uploadValidatedProductFile(slug: string, file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileKey = buildProductFileKey(slug, file.name);
  const contentType = file.type || "application/octet-stream";

  await uploadProductFile(fileKey, buffer, contentType);

  const exists = await assertProductFileExists(fileKey);
  if (!exists) {
    throw new Error("Upload completed but file could not be verified in storage.");
  }

  return fileKey;
}

function resolvePriceFields(price: number, currency: string) {
  const priceDecimal = new Decimal(price);
  const priceMinor = priceToMinor(priceDecimal, currency);
  if (!isAboveStripeMinimum(priceMinor, currency)) {
    throw new Error(
      `Price is below Stripe's minimum charge for ${currency.toUpperCase()}.`,
    );
  }
  return { priceMinor, price: priceDecimal };
}

async function countPurchasesReferencingFileKey(fileKey: string) {
  return prisma.purchase.count({
    where: { deliveredFileKey: fileKey },
  });
}

export async function getAdminProducts() {
  await verifyAdminSession();
  return prisma.product.findMany({ orderBy: { order: "asc" } });
}

export async function getAdminProduct(id: string) {
  await verifyAdminSession();
  return prisma.product.findUnique({ where: { id } });
}

export async function toggleProductVisibility(id: string, isVisible: boolean) {
  await verifyAdminSession();
  await verifyCsrfOrigin();

  const updated = await prisma.product.update({
    where: { id },
    data: { isVisible },
  });

  revalidateProductPaths();
  await logActivity({
    action: "product.updated",
    entityType: "Product",
    entityId: id,
    metadata: { isVisible },
  });
  return updated;
}

export async function verifyProductFile(id: string) {
  await verifyAdminSession();

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    return { ok: false as const, error: "Product not found." };
  }

  const status = await getProductFileStatus(product.fileKey);
  return {
    ok: true as const,
    exists: status.exists,
    sizeBytes: status.sizeBytes,
    fileKey: product.fileKey,
  };
}

export async function createProduct(formData: FormData) {
  await verifyAdminSession();
  await verifyCsrfOrigin();

  const data = parseProductFormData(formData);
  const file = validateProductFile(
    formData.get("productFile") as File,
    true,
  );
  if (!file) {
    throw new Error("A digital product file is required.");
  }

  const existing = await prisma.product.findUnique({
    where: { slug: data.slug },
  });
  if (existing) {
    throw new Error(`A product with slug "${data.slug}" already exists.`);
  }

  const { priceMinor, price } = resolvePriceFields(data.price, data.currency);
  const fileKey = await uploadValidatedProductFile(data.slug, file);

  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      price,
      priceMinor,
      currency: data.currency,
      fileKey,
      previewUrl: data.previewUrl,
      lemonSqueezyVariantId: data.lemonSqueezyVariantId,
      isVisible: data.isVisible ?? true,
      order: data.order ?? 0,
    },
  });

  revalidateProductPaths();
  await logActivity({
    action: "product.created",
    entityType: "Product",
    entityId: product.id,
    metadata: { name: product.name, slug: product.slug },
  });
  return product;
}

export async function updateProduct(id: string, formData: FormData) {
  await verifyAdminSession();
  await verifyCsrfOrigin();

  const current = await prisma.product.findUnique({ where: { id } });
  if (!current) {
    throw new Error("Product not found.");
  }

  const data = parseProductFormData(formData);
  const file = validateProductFile(
    formData.get("productFile") as File,
    false,
  );

  if (data.slug !== current.slug) {
    const slugTaken = await prisma.product.findUnique({
      where: { slug: data.slug },
    });
    if (slugTaken && slugTaken.id !== id) {
      throw new Error(`A product with slug "${data.slug}" already exists.`);
    }
  }

  const { priceMinor, price } = resolvePriceFields(data.price, data.currency);
  let fileKey = current.fileKey;
  let oldFileKeyToDelete: string | null = null;

  if (file) {
    const newFileKey = await uploadValidatedProductFile(data.slug, file);
    oldFileKeyToDelete = current.fileKey !== newFileKey ? current.fileKey : null;
    fileKey = newFileKey;
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      price,
      priceMinor,
      currency: data.currency,
      fileKey,
      previewUrl: data.previewUrl,
      lemonSqueezyVariantId: data.lemonSqueezyVariantId,
      isVisible: data.isVisible ?? true,
      order: data.order ?? 0,
    },
  });

  if (oldFileKeyToDelete) {
    const refs = await countPurchasesReferencingFileKey(oldFileKeyToDelete);
    if (refs === 0) {
      try {
        await deleteProductFile(oldFileKeyToDelete);
      } catch (err) {
        console.error("[Product] Failed to delete replaced file:", err);
      }
    }
    await logActivity({
      action: "product.file_replaced",
      entityType: "Product",
      entityId: id,
      metadata: { oldFileKey: oldFileKeyToDelete, newFileKey: fileKey },
    });
  }

  revalidateProductPaths();
  await logActivity({
    action: "product.updated",
    entityType: "Product",
    entityId: product.id,
    metadata: { name: product.name },
  });
  return product;
}

export async function deleteProduct(id: string) {
  await verifyAdminSession();
  await verifyCsrfOrigin();

  const product = await prisma.product.findUnique({
    where: { id },
    include: { _count: { select: { purchases: true } } },
  });

  if (!product) {
    throw new Error("Product not found.");
  }

  if (product._count.purchases > 0) {
    throw new Error(
      "Cannot delete a product with purchases. Hide it from the store instead.",
    );
  }

  try {
    await deleteProductFile(product.fileKey);
  } catch (err) {
    console.error("[Product] Storage delete failed (continuing):", err);
  }

  await prisma.product.delete({ where: { id } });

  revalidateProductPaths();
  await logActivity({
    action: "product.deleted",
    entityType: "Product",
    entityId: id,
    metadata: { name: product.name, slug: product.slug },
  });
}
