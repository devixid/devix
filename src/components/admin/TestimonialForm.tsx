"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTestimonial, updateTestimonial } from "@/actions/admin";

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
        setError("Avatar URL must be a valid absolute URL (e.g. https://example.com/avatar.jpg).");
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
        setError(err instanceof Error ? err.message : "Something went wrong. Please check your input.");
      }
    });
  };

  return (
    <div className="border border-zinc-800 bg-[#0F0F0F] p-8 space-y-6">
      
      {/* Form Title */}
      <div>
        <h2 className="font-display text-lg font-light tracking-wider text-zinc-100">
          {initialData ? "Edit Testimonial" : "Create Testimonial"}
        </h2>
        <p className="text-[11px] text-zinc-500 font-sans mt-0.5">
          {initialData ? `Modifying testimonial entry ID: ${initialData.id}` : "Add a new client testimonial entry"}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-950/20 border-l border-red-500 text-red-400 text-xs font-sans">
          {error}
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Client Name */}
          <div className="space-y-1.5">
            <label htmlFor="clientName" className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
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
              className="w-full bg-[#141414] border border-zinc-800 rounded-none px-4 py-2.5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-[#C8A96E] transition-colors"
            />
          </div>

          {/* Client Role */}
          <div className="space-y-1.5">
            <label htmlFor="clientRole" className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
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
              className="w-full bg-[#141414] border border-zinc-800 rounded-none px-4 py-2.5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-[#C8A96E] transition-colors"
            />
          </div>

          {/* Company */}
          <div className="space-y-1.5">
            <label htmlFor="company" className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
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
              className="w-full bg-[#141414] border border-zinc-800 rounded-none px-4 py-2.5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-[#C8A96E] transition-colors"
            />
          </div>

          {/* Avatar URL */}
          <div className="space-y-1.5">
            <label htmlFor="avatarUrl" className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
              Avatar URL (Optional)
            </label>
            <input
              id="avatarUrl"
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              disabled={isPending}
              placeholder="https://example.com/avatar.jpg"
              className="w-full bg-[#141414] border border-zinc-800 rounded-none px-4 py-2.5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-[#C8A96E] transition-colors"
            />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <label htmlFor="content" className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
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
            className="w-full bg-[#141414] border border-zinc-800 rounded-none px-4 py-3 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-[#C8A96E] transition-colors resize-none leading-relaxed"
          />
        </div>

        {/* Order & Visibility Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          {/* Order number */}
          <div className="flex items-center gap-3">
            <label htmlFor="order" className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
              Display Order:
            </label>
            <input
              id="order"
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              disabled={isPending}
              min={0}
              className="w-20 bg-[#141414] border border-zinc-800 rounded-none px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#C8A96E] transition-colors"
            />
          </div>

          {/* Visibility toggle checkbox */}
          <label htmlFor="isVisible" className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-[10px] uppercase tracking-wider text-zinc-400">
              Visible on website:
            </span>
            <input
              id="isVisible"
              type="checkbox"
              checked={isVisible}
              onChange={(e) => setIsVisible(e.target.checked)}
              disabled={isPending}
              className="sr-only peer"
            />
            <div className="relative w-8 h-4 bg-zinc-800 peer-focus:outline-none transition-colors duration-300 peer-checked:bg-[#C8A96E] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-black after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4" />
          </label>
        </div>

        {/* Submit Actions Row */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-900">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="border border-zinc-800 hover:border-zinc-700 bg-transparent text-zinc-400 hover:text-white px-5 py-3 text-xs uppercase tracking-wider font-sans font-medium transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isPending}
            className="bg-[#C8A96E] hover:bg-[#B6965C] disabled:bg-zinc-800 disabled:text-zinc-500 text-black px-5 py-3 text-xs uppercase tracking-wider font-sans font-medium transition-colors"
          >
            {isPending ? "Saving..." : "Save Testimonial"}
          </button>
        </div>

      </form>
    </div>
  );
}
export default TestimonialForm;
