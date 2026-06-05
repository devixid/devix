"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  toggleTestimonialVisibility,
  deleteTestimonial,
} from "@/actions/admin";

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
        await toggleTestimonialVisibility(
          testimonial.id,
          !testimonial.isVisible,
        );
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
    <div
      className={`flex flex-col justify-between space-y-6 border bg-[#0F0F0F] p-6 transition-all duration-300 ${
        testimonial.isVisible ? "border-zinc-800" : "border-zinc-900 opacity-60"
      }`}
    >
      {/* Top Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          {/* Avatar / Initials Fallback */}
          {testimonial.avatarUrl ? (
            <img
              src={testimonial.avatarUrl}
              alt={testimonial.clientName}
              className="h-10 w-10 border border-zinc-800 object-cover"
              onError={(e) => {
                // If invalid URL or image load fails, convert to placeholder fallback
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center border border-zinc-800 bg-zinc-900 font-sans text-[11px] font-medium text-zinc-400">
              {getInitials(testimonial.clientName)}
            </div>
          )}

          <div>
            <h3 className="font-sans text-sm leading-tight font-medium text-zinc-100">
              {testimonial.clientName}
            </h3>
            <p className="mt-0.5 font-sans text-[11px] text-zinc-500">
              {testimonial.clientRole} at{" "}
              <span className="text-zinc-400">{testimonial.company}</span>
            </p>
          </div>
        </div>

        {/* Content */}
        <p className="line-clamp-4 font-sans text-xs leading-relaxed text-zinc-400">
          “{testimonial.content}”
        </p>
      </div>

      {/* Action / Meta Row */}
      <div className="space-y-4 border-t border-zinc-900 pt-4">
        <div className="flex items-center justify-between">
          {/* Order Badge */}
          <span className="font-mono text-[10px] tracking-wider text-zinc-500 uppercase">
            Order: <span className="text-zinc-300">#{testimonial.order}</span>
          </span>

          {/* Visibility Toggle Switch */}
          <label className="flex cursor-pointer items-center gap-2 select-none">
            <span className="text-[10px] tracking-wider text-zinc-500 uppercase">
              {testimonial.isVisible ? "Visible" : "Hidden"}
            </span>
            <input
              type="checkbox"
              checked={testimonial.isVisible}
              onChange={handleToggleVisibility}
              disabled={isPending}
              className="peer sr-only"
            />
            <div className="relative h-4 w-8 rounded-none bg-zinc-800 transition-colors duration-300 peer-checked:bg-[#C8A96E] peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-3 after:w-3 after:bg-black after:transition-all after:content-[''] peer-checked:after:translate-x-4" />
          </label>
        </div>

        {/* Card Edit/Delete Actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={() => onEdit(testimonial)}
            disabled={isPending}
            className="font-sans text-[10px] font-medium tracking-wider text-zinc-400 uppercase transition-colors hover:text-white"
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
                  className="font-sans text-[10px] font-bold tracking-wider text-red-500 uppercase transition-colors hover:text-red-400"
                >
                  Confirm?
                </button>
                <span className="text-zinc-700">/</span>
                <button
                  onClick={() => setDeleteConfirm(false)}
                  disabled={isPending}
                  className="font-sans text-[10px] tracking-wider text-zinc-500 uppercase transition-colors hover:text-zinc-300"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="font-sans text-[10px] font-medium tracking-wider text-red-950/70 uppercase transition-colors hover:text-red-400"
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
