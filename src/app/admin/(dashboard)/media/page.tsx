import { listMediaAssets } from "@/actions/admin/media";
import { MediaLibraryPanel } from "@/components/admin/MediaLibraryPanel";

export const metadata = { title: "Media Library — Devix Operations" };

export default async function MediaPage() {
  const { items, total } = await listMediaAssets();

  return (
    <div className="space-y-8">
      <div>
        <span className="mb-3 block text-[11px] font-medium tracking-[0.25em] text-zinc-500 uppercase">
          Assets
        </span>
        <h1 className="font-display text-3xl font-light tracking-wide text-zinc-100">
          Media Library
        </h1>
        <p className="mt-2 max-w-xl text-sm text-zinc-400">
          Upload and manage images used across the site.
        </p>
      </div>
      <MediaLibraryPanel
        initialAssets={items}
        total={total}
      />
    </div>
  );
}
