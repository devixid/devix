"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { uploadToSupabaseStorage } from "@/lib/supabase-storage";
import { registerMediaAsset, deleteMediaAsset } from "@/actions/admin/media";

interface MediaAsset {
  id: string;
  publicUrl: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: Date;
}

export function MediaLibraryPanel({
  initialAssets,
  total,
}: {
  initialAssets: MediaAsset[];
  total: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { publicUrl, path } = await uploadToSupabaseStorage(
        file,
        "media",
        "uploads",
        5,
      );
      await registerMediaAsset({
        bucket: "media",
        path,
        publicUrl,
        filename: file.name,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
      });
      router.refresh();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">{total} assets</p>
        <label className="cursor-pointer bg-[#C8A96E] px-4 py-2 text-xs tracking-wider text-black uppercase">
          {uploading || isPending ? "Uploading..." : "Upload file"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={handleUpload}
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
        {initialAssets.map((asset) => (
          <div
            key={asset.id}
            className="group relative border border-zinc-800"
          >
            {asset.mimeType.startsWith("image/") ? (
              <Image
                src={asset.publicUrl}
                alt={asset.filename}
                width={200}
                height={200}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center p-2 text-center text-xs text-zinc-500">
                {asset.filename}
              </div>
            )}
            <button
              type="button"
              onClick={() =>
                startTransition(async () => {
                  try {
                    await deleteMediaAsset(asset.id);
                    router.refresh();
                  } catch (err) {
                    alert(err instanceof Error ? err.message : "Delete failed");
                  }
                })
              }
              className="absolute top-2 right-2 bg-red-950/80 px-2 py-1 text-[10px] text-red-300 uppercase opacity-0 group-hover:opacity-100"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
