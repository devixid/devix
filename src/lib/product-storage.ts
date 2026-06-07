export const PRODUCTS_STORAGE_BUCKET = "products";

/** Object path inside the bucket (bucket name is passed separately to Supabase). */
export function resolveProductStoragePath(fileKey: string): string {
  const normalized = fileKey.replace(/^\/+/, "");
  const prefix = `${PRODUCTS_STORAGE_BUCKET}/`;

  if (normalized.startsWith(prefix)) {
    return normalized.slice(prefix.length);
  }

  return normalized;
}
