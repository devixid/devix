"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createTestimonial, updateTestimonial } from "@/actions/admin";
import { uploadToSupabaseStorage } from "@/lib/supabase-storage";
import { UploadCloud } from "lucide-react";

interface TestimonialType {
  id: string;
  clientName: string;
  clientRole: string;
  company: string;
  content: string;
  avatarUrl: string | null;
  isVisible: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Props {
  initialData?: TestimonialType | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export function TestimonialForm({ initialData, onCancel, onSuccess }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [clientName, setClientName] = useState(initialData?.clientName || "");
  const [clientRole, setClientRole] = useState(initialData?.clientRole || "");
  const [company, setCompany] = useState(initialData?.company || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [avatarUrl, setAvatarUrl] = useState(initialData?.avatarUrl || "");
  const [order, setOrder] = useState(initialData?.order || 0);
  const [isVisible, setIsVisible] = useState(initialData?.isVisible ?? true);
  const [avatarPreview, setAvatarPreview] = useState(
    initialData?.avatarUrl || "",
  );
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    setError(null);
    try {
      const { publicUrl } = await uploadToSupabaseStorage(
        file,
        "testimonials",
        "avatars",
      );
      setAvatarUrl(publicUrl);
      setAvatarPreview(publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Avatar upload failed.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validations
    if (clientName.trim().length < 2) {
      setError("Client name must be at least 2 characters.");
      return;
    }
    if (clientRole.trim().length < 2) {
      setError("Client role must be at least 2 characters.");
      return;
    }
    if (company.trim().length < 2) {
      setError("Company name must be at least 2 characters.");
      return;
    }
    if (content.trim().length < 10) {
      setError("Content testimonial must be at least 10 characters.");
      return;
    }
    if (avatarUrl.trim().length > 0) {
      try {
        new URL(avatarUrl);
      } catch (_) {
        setError(
          "Avatar URL must be a valid absolute URL (e.g. https://example.com/avatar.jpg).",
        );
        return;
      }
    }

    startTransition(async () => {
      try {
        const payload = {
          clientName,
          clientRole,
          company,
          content,
          avatarUrl: avatarUrl.trim() || null,
          isVisible,
          order: Number(order),
        };

        if (initialData?.id) {
          await updateTestimonial(initialData.id, payload);
        } else {
          await createTestimonial(payload);
        }

        router.refresh();
        onSuccess();
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please check your input.",
        );
      }
    });
  };

  return (
    <div className="space-y-6 border border-zinc-800 bg-[#0F0F0F] p-8">
      {/* Form Title */}
      <div>
        <h2 className="font-display text-lg font-light tracking-wider text-zinc-100">
          {initialData ? "Edit Testimonial" : "Create Testimonial"}
        </h2>
        <p className="mt-0.5 font-sans text-[11px] text-zinc-500">
          {initialData
            ? `Modifying testimonial entry ID: ${initialData.id}`
            : "Add a new client testimonial entry"}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="border-l border-red-500 bg-red-950/20 p-4 font-sans text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Form Fields */}
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Client Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="clientName"
              className="text-[10px] font-medium tracking-wider text-zinc-400 uppercase"
            >
              Client Name *
            </label>
            <input
              id="clientName"
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              disabled={isPending}
              placeholder="E.g., Jane Doe"
              required
              className="w-full rounded-none border border-zinc-800 bg-[#141414] px-4 py-2.5 text-xs text-white placeholder-zinc-700 transition-colors focus:border-[#C8A96E] focus:outline-none"
            />
          </div>

          {/* Client Role */}
          <div className="space-y-1.5">
            <label
              htmlFor="clientRole"
              className="text-[10px] font-medium tracking-wider text-zinc-400 uppercase"
            >
              Client Role *
            </label>
            <input
              id="clientRole"
              type="text"
              value={clientRole}
              onChange={(e) => setClientRole(e.target.value)}
              disabled={isPending}
              placeholder="E.g., Chief Executive Officer"
              required
              className="w-full rounded-none border border-zinc-800 bg-[#141414] px-4 py-2.5 text-xs text-white placeholder-zinc-700 transition-colors focus:border-[#C8A96E] focus:outline-none"
            />
          </div>

          {/* Company */}
          <div className="space-y-1.5">
            <label
              htmlFor="company"
              className="text-[10px] font-medium tracking-wider text-zinc-400 uppercase"
            >
              Company *
            </label>
            <input
              id="company"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              disabled={isPending}
              placeholder="E.g., Acme Corp"
              required
              className="w-full rounded-none border border-zinc-800 bg-[#141414] px-4 py-2.5 text-xs text-white placeholder-zinc-700 transition-colors focus:border-[#C8A96E] focus:outline-none"
            />
          </div>

          {/* Avatar */}
          <div className="space-y-1.5 md:col-span-2">
            <span className="text-[10px] font-medium tracking-wider text-zinc-400 uppercase">
              Avatar (Optional)
            </span>
            <div className="flex items-center gap-4">
              {avatarPreview ? (
                <div className="relative h-14 w-14 overflow-hidden rounded-full border border-zinc-800">
                  <Image
                    src={avatarPreview}
                    alt="Avatar preview"
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-dashed border-zinc-700 bg-zinc-900/50">
                  <UploadCloud
                    size={20}
                    className="text-zinc-600"
                  />
                </div>
              )}
              <div className="flex-1 space-y-2">
                <label className="inline-flex cursor-pointer items-center gap-2 border border-zinc-800 px-4 py-2 text-xs text-zinc-400 hover:border-zinc-600 hover:text-white">
                  {uploadingAvatar ? "Uploading..." : "Upload image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isPending || uploadingAvatar}
                    onChange={handleAvatarUpload}
                  />
                </label>
                <input
                  id="avatarUrl"
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => {
                    setAvatarUrl(e.target.value);
                    setAvatarPreview(e.target.value);
                  }}
                  disabled={isPending}
                  placeholder="Or paste image URL"
                  className="w-full rounded-none border border-zinc-800 bg-[#141414] px-4 py-2 text-xs text-white placeholder-zinc-700 focus:border-[#C8A96E] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <label
            htmlFor="content"
            className="text-[10px] font-medium tracking-wider text-zinc-400 uppercase"
          >
            Testimonial Content *
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isPending}
            placeholder="Write the client testimonial content here..."
            required
            rows={4}
            className="w-full resize-none rounded-none border border-zinc-800 bg-[#141414] px-4 py-3 text-xs leading-relaxed text-white placeholder-zinc-700 transition-colors focus:border-[#C8A96E] focus:outline-none"
          />
        </div>

        {/* Order & Visibility Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          {/* Order number */}
          <div className="flex items-center gap-3">
            <label
              htmlFor="order"
              className="text-[10px] font-medium tracking-wider text-zinc-400 uppercase"
            >
              Display Order:
            </label>
            <input
              id="order"
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              disabled={isPending}
              min={0}
              className="w-20 rounded-none border border-zinc-800 bg-[#141414] px-3 py-1.5 text-xs text-white transition-colors focus:border-[#C8A96E] focus:outline-none"
            />
          </div>

          {/* Visibility toggle checkbox */}
          <label
            htmlFor="isVisible"
            className="flex cursor-pointer items-center gap-2 select-none"
          >
            <span className="text-[10px] tracking-wider text-zinc-400 uppercase">
              Visible on website:
            </span>
            <input
              id="isVisible"
              type="checkbox"
              checked={isVisible}
              onChange={(e) => setIsVisible(e.target.checked)}
              disabled={isPending}
              className="peer sr-only"
            />
            <div className="relative h-4 w-8 bg-zinc-800 transition-colors duration-300 peer-checked:bg-[#C8A96E] peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-3 after:w-3 after:bg-black after:transition-all after:content-[''] peer-checked:after:translate-x-4" />
          </label>
        </div>

        {/* Submit Actions Row */}
        <div className="flex items-center justify-end gap-3 border-t border-zinc-900 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="border border-zinc-800 bg-transparent px-5 py-3 font-sans text-xs font-medium tracking-wider text-zinc-400 uppercase transition-colors hover:border-zinc-700 hover:text-white"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isPending}
            className="bg-[#C8A96E] px-5 py-3 font-sans text-xs font-medium tracking-wider text-black uppercase transition-colors hover:bg-[#B6965C] disabled:bg-zinc-800 disabled:text-zinc-500"
          >
            {isPending ? "Saving..." : "Save Testimonial"}
          </button>
        </div>
      </form>
    </div>
  );
}
export default TestimonialForm;
