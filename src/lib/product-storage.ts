import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const PRODUCTS_STORAGE_BUCKET = "products";

export const MAX_PRODUCT_FILE_BYTES = 50 * 1024 * 1024;

const ALLOWED_EXTENSIONS = [".zip", ".pdf", ".tar.gz", ".tgz"] as const;

/** Object path inside the bucket (bucket name is passed separately to Supabase). */
export function resolveProductStoragePath(fileKey: string): string {
  const normalized = fileKey.replace(/^\/+/, "");
  const prefix = `${PRODUCTS_STORAGE_BUCKET}/`;

  if (normalized.startsWith(prefix)) {
    return normalized.slice(prefix.length);
  }

  return normalized;
}

export function sanitizeProductFilename(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? "file";
  const lower = base.toLowerCase();
  let ext = "";
  for (const allowed of ALLOWED_EXTENSIONS) {
    if (lower.endsWith(allowed)) {
      ext = allowed;
      break;
    }
  }
  const stem = ext ? base.slice(0, -ext.length) : base;
  const safeStem = stem
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `${safeStem || "file"}${ext || ".zip"}`;
}

export function buildProductFileKey(slug: string, filename: string): string {
  return `${slug}/${sanitizeProductFilename(filename)}`;
}

export function isAllowedProductExtension(filename: string): boolean {
  const lower = filename.toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export type ProductFileStatus = {
  exists: boolean;
  sizeBytes?: number;
};

export async function getProductFileStatus(
  fileKey: string,
): Promise<ProductFileStatus> {
  const storagePath = resolveProductStoragePath(fileKey);
  const lastSlash = storagePath.lastIndexOf("/");
  const dir = lastSlash >= 0 ? storagePath.slice(0, lastSlash) : "";
  const name =
    lastSlash >= 0 ? storagePath.slice(lastSlash + 1) : storagePath;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage
    .from(PRODUCTS_STORAGE_BUCKET)
    .list(dir, { search: name, limit: 100 });

  if (error || !data) {
    return { exists: false };
  }

  const match = data.find((obj) => obj.name === name);
  if (!match) return { exists: false };

  const size = (match.metadata as { size?: number } | null)?.size;
  if (typeof size === "number" && size <= 0) {
    return { exists: false };
  }

  return { exists: true, sizeBytes: size };
}

export async function assertProductFileExists(fileKey: string): Promise<boolean> {
  const status = await getProductFileStatus(fileKey);
  return status.exists;
}

export async function uploadProductFile(
  fileKey: string,
  body: Buffer | ArrayBuffer,
  contentType: string,
): Promise<void> {
  const storagePath = resolveProductStoragePath(fileKey);
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage
    .from(PRODUCTS_STORAGE_BUCKET)
    .upload(storagePath, body, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Product upload failed: ${error.message}`);
  }
}

export async function deleteProductFile(fileKey: string): Promise<void> {
  const storagePath = resolveProductStoragePath(fileKey);
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage
    .from(PRODUCTS_STORAGE_BUCKET)
    .remove([storagePath]);

  if (error) {
    throw new Error(`Product file delete failed: ${error.message}`);
  }
}
