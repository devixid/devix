"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  updateExtendedSiteSettings,
  revalidatePublicCache,
} from "@/actions/admin/settings";
import type { SiteSettingsData } from "@/lib/site-settings";

export function ExtendedSettingsPanel({
  settings,
}: {
  settings: SiteSettingsData | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    siteName: settings?.siteName ?? "",
    siteUrl: settings?.siteUrl ?? "",
    metaDescription: settings?.metaDescription ?? "",
    twitter: settings?.socialLinks?.twitter ?? "",
    linkedin: settings?.socialLinks?.linkedin ?? "",
    instagram: settings?.socialLinks?.instagram ?? "",
    github: settings?.socialLinks?.github ?? "",
    maintenanceMode: settings?.maintenanceMode ?? false,
    maintenanceMessage: settings?.maintenanceMessage ?? "",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    startTransition(async () => {
      try {
        await updateExtendedSiteSettings({
          siteName: form.siteName || undefined,
          siteUrl: form.siteUrl || undefined,
          metaDescription: form.metaDescription || undefined,
          socialLinks: {
            twitter: form.twitter || undefined,
            linkedin: form.linkedin || undefined,
            instagram: form.instagram || undefined,
            github: form.github || undefined,
          },
          maintenanceMode: form.maintenanceMode,
          maintenanceMessage: form.maintenanceMessage || undefined,
        });
        setMessage("Settings saved.");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed.");
      }
    });
  };

  return (
    <div className="space-y-8">
      <section className="border border-zinc-800 bg-[#0F0F0F] p-8">
        <h2 className="mb-6 font-display text-xl font-light text-zinc-100">Site</h2>
        {message && (
          <div className="mb-4 border-l border-green-500 bg-green-950/30 p-3 text-sm text-green-400">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 border-l border-red-500 bg-red-950/30 p-3 text-sm text-red-400">
            {error}
          </div>
        )}
        <form onSubmit={handleSave} className="grid max-w-2xl gap-4">
          {(
            [
              ["siteName", "Site Name"],
              ["siteUrl", "Site URL"],
              ["metaDescription", "Meta Description"],
              ["twitter", "Twitter URL"],
              ["linkedin", "LinkedIn URL"],
              ["instagram", "Instagram URL"],
              ["github", "GitHub URL"],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label className="mb-1.5 block text-xs tracking-wider text-zinc-500 uppercase">
                {label}
              </label>
              <input
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-sm text-white"
              />
            </div>
          ))}
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={form.maintenanceMode}
              onChange={(e) =>
                setForm({ ...form, maintenanceMode: e.target.checked })
              }
            />
            Maintenance mode (public site only)
          </label>
          <textarea
            rows={2}
            value={form.maintenanceMessage}
            onChange={(e) =>
              setForm({ ...form, maintenanceMessage: e.target.value })
            }
            placeholder="Maintenance message"
            className="w-full border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-sm text-white"
          />
          <button
            type="submit"
            disabled={isPending}
            className="w-fit bg-[#C8A96E] px-6 py-2.5 text-xs tracking-wider text-black uppercase disabled:opacity-50"
          >
            Save site settings
          </button>
        </form>
      </section>

      <section className="border border-zinc-800 bg-[#0F0F0F] p-8">
        <h2 className="mb-4 font-display text-xl font-light text-zinc-100">Cache</h2>
        <p className="mb-4 text-sm text-zinc-500">
          Clear Redis cache and revalidate public pages after content changes.
        </p>
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await revalidatePublicCache();
              setMessage("Public cache revalidated.");
            })
          }
          className="border border-zinc-700 px-6 py-2.5 text-xs tracking-wider text-zinc-300 uppercase hover:border-[#C8A96E] hover:text-[#C8A96E]"
        >
          Revalidate public cache
        </button>
      </section>
    </div>
  );
}
