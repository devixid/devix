import { createSupabaseBrowser } from "@/lib/supabase-browser";

export type StorageBucket =
  | "portfolio"
  | "case-studies"
  | "testimonials"
  | "media";

export async function deleteFromSupabaseStorage(
  bucket: StorageBucket,
  path: string,
): Promise<void> {
  const supabase = createSupabaseBrowser();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}

export function getPublicUrlFromPath(
  bucket: StorageBucket,
  path: string,
): string {
  const supabase = createSupabaseBrowser();
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export async function uploadToSupabaseStorage(
  file: File,
  bucket: StorageBucket,
  folder: string,
  maxSizeMb = 2,
): Promise<{ publicUrl: string; path: string }> {
  if (file.size > maxSizeMb * 1024 * 1024) {
    throw new Error(`Image size must be less than ${maxSizeMb}MB`);
  }

  const supabase = createSupabaseBrowser();
  const fileExt = file.name.split(".").pop() || "jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return { publicUrl, path: filePath };
}
