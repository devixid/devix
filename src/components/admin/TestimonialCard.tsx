"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toggleTestimonialVisibility, deleteTestimonial } from "@/actions/admin";

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
  testimonial: TestimonialType;
  onEdit: (testimonial: TestimonialType) => void;
}

export function TestimonialCard({ testimonial, onEdit }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Auto-reset delete confirm
  useEffect(() => {
    if (deleteConfirm) {
      const timer = setTimeout(() => {
        setDeleteConfirm(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [deleteConfirm]);

  const handleToggleVisibility = () => {
    startTransition(async () => {
      try {
        await toggleTestimonialVisibility(testimonial.id, !testimonial.isVisible);
        router.refresh();
      } catch (err) {
        console.error("Failed to toggle visibility:", err);
      }
    });
  };

  const handleDelete = () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    startTransition(async () => {
      try {
        await deleteTestimonial(testimonial.id);
        router.refresh();
      } catch (err) {
        console.error("Failed to delete testimonial:", err);
      }
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`border transition-all duration-300 bg-[#0F0F0F] p-6 space-y-6 flex flex-col justify-between ${
      testimonial.isVisible ? "border-zinc-800" : "border-zinc-900 opacity-60"
    }`}>
      {/* Top Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          {/* Avatar / Initials Fallback */}
          {testimonial.avatarUrl ? (
            <img
              src={testimonial.avatarUrl}
              alt={testimonial.clientName}
              className="h-10 w-10 object-cover border border-zinc-800"
              onError={(e) => {
                // If invalid URL or image load fails, convert to placeholder fallback
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <div className="h-10 w-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[11px] font-sans font-medium text-zinc-400">
              {getInitials(testimonial.clientName)}
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-zinc-100 font-sans leading-tight">
              {testimonial.clientName}
            </h3>
            <p className="text-[11px] text-zinc-500 font-sans mt-0.5">
              {testimonial.clientRole} at <span className="text-zinc-400">{testimonial.company}</span>
            </p>
          </div>
        </div>

        {/* Content */}
        <p className="text-xs text-zinc-400 font-sans leading-relaxed line-clamp-4">
          “{testimonial.content}”
        </p>
      </div>

      {/* Action / Meta Row */}
      <div className="pt-4 border-t border-zinc-900 space-y-4">
        <div className="flex items-center justify-between">
          {/* Order Badge */}
          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono">
            Order: <span className="text-zinc-300">#{testimonial.order}</span>
          </span>

          {/* Visibility Toggle Switch */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">
              {testimonial.isVisible ? "Visible" : "Hidden"}
            </span>
            <input
              type="checkbox"
              checked={testimonial.isVisible}
              onChange={handleToggleVisibility}
              disabled={isPending}
              className="sr-only peer"
            />
            <div className="relative w-8 h-4 bg-zinc-800 peer-focus:outline-none rounded-none transition-colors duration-300 peer-checked:bg-[#C8A96E] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-black after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4" />
          </label>
        </div>

        {/* Card Edit/Delete Actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={() => onEdit(testimonial)}
            disabled={isPending}
            className="text-[10px] uppercase tracking-wider font-sans font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Edit
          </button>

          {/* Inline Confirm Delete */}
          <div className="flex items-center">
            {deleteConfirm ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDelete}
                  disabled={isPending}
                  className="text-[10px] uppercase tracking-wider font-sans font-bold text-red-500 hover:text-red-400 transition-colors"
                >
                  Confirm?
                </button>
                <span className="text-zinc-700">/</span>
                <button
                  onClick={() => setDeleteConfirm(false)}
                  disabled={isPending}
                  className="text-[10px] uppercase tracking-wider font-sans text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="text-[10px] uppercase tracking-wider font-sans font-medium text-red-950/70 hover:text-red-400 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default TestimonialCard;
