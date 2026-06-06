"use client";

import { useState } from "react";
import TestimonialForm from "@/components/admin/TestimonialForm";
import SortableTestimonialList from "@/components/admin/SortableTestimonialList";

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
  testimonials: TestimonialType[];
}

export function TestimonialListContainer({ testimonials }: Props) {
  const [formMode, setFormMode] = useState<"none" | "create" | "edit">("none");
  const [editingTestimonial, setEditingTestimonial] =
    useState<TestimonialType | null>(null);

  const handleStartCreate = () => {
    setEditingTestimonial(null);
    setFormMode("create");
  };

  const handleStartEdit = (testimonial: TestimonialType) => {
    setEditingTestimonial(testimonial);
    setFormMode("edit");
  };

  const handleCloseForm = () => {
    setFormMode("none");
    setEditingTestimonial(null);
  };

  return (
    <div className="space-y-10">
      {/* Header & Main Button Row */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="mb-3 block text-[11px] font-medium tracking-[0.25em] text-zinc-500 uppercase">
            Management
          </span>
          <h1 className="font-display text-3xl font-light tracking-wide text-zinc-100">
            Client Testimonials
          </h1>
          <p className="mt-2 max-w-xl font-sans text-sm text-zinc-400">
            Configure, edit, and reorder testimonials displayed on the main
            marketing pages.
          </p>
        </div>

        {formMode === "none" && (
          <button
            onClick={handleStartCreate}
            className="bg-[#C8A96E] px-5 py-4 font-sans text-xs font-medium tracking-[0.2em] whitespace-nowrap text-black uppercase transition-colors duration-300 hover:bg-[#B6965C] sm:self-start"
          >
            + Create Testimonial
          </button>
        )}
      </div>

      {/* Form View (Create / Edit) */}
      {formMode !== "none" && (
        <div className="max-w-4xl">
          <TestimonialForm
            initialData={editingTestimonial}
            onCancel={handleCloseForm}
            onSuccess={handleCloseForm}
          />
        </div>
      )}

      {formMode === "none" && (
        <>
          {testimonials.length === 0 ? (
            <div className="border border-zinc-800 bg-[#0F0F0F] p-12 text-center text-sm text-zinc-500">
              No testimonials available. Create one to display on the landing
              page.
            </div>
          ) : (
            <SortableTestimonialList
              testimonials={testimonials}
              onEdit={handleStartEdit}
            />
          )}
        </>
      )}
    </div>
  );
}
export default TestimonialListContainer;
