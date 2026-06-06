"use client";

import { useEffect, useState, useTransition } from "react";
import { listMediaAssets } from "@/actions/admin/media";
import Image from "next/image";

interface MediaAsset {
  id: string;
  publicUrl: string;
  filename: string;
  mimeType: string;
}

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  imageOnly?: boolean;
}

export function MediaPicker({
  open,
  onClose,
  onSelect,
  imageOnly = true,
}: MediaPickerProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    startTransition(async () => {
      const result = await listMediaAssets({
        mimeType: imageOnly ? "image" : undefined,
      });
      setAssets(result.items);
    });
  }, [open, imageOnly]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[80vh] w-full max-w-3xl overflow-hidden border border-zinc-800 bg-[#0F0F0F]">
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <h2 className="text-sm font-medium text-zinc-200">Media Library</h2>
          <button type="button" onClick={onClose} className="text-zinc-500 hover:text-white">
            Close
          </button>
        </div>
        <div className="grid max-h-[60vh] grid-cols-3 gap-3 overflow-y-auto p-6 md:grid-cols-4">
          {assets.length === 0 ? (
            <p className="col-span-full text-center text-sm text-zinc-500">
              No media yet. Upload from /admin/media.
            </p>
          ) : (
            assets.map((asset) => (
              <button
                key={asset.id}
                type="button"
                onClick={() => {
                  onSelect(asset.publicUrl);
                  onClose();
                }}
                className="group aspect-square overflow-hidden border border-zinc-800 hover:border-[#C8A96E]"
              >
                {asset.mimeType.startsWith("image/") ? (
                  <Image
                    src={asset.publicUrl}
                    alt={asset.filename}
                    width={200}
                    height={200}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center text-xs text-zinc-500">
                    {asset.filename}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
