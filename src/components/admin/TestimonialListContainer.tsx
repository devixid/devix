"use client";

import { useState } from "react";
import TestimonialCard from "@/components/admin/TestimonialCard";
import TestimonialForm from "@/components/admin/TestimonialForm";

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
  const [editingTestimonial, setEditingTestimonial] = useState<TestimonialType | null>(null);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-medium tracking-[0.25em] uppercase text-zinc-500 block mb-3">
            Management
          </span>
          <h1 className="font-display text-3xl font-light tracking-wide text-zinc-100">
            Client Testimonials
          </h1>
          <p className="font-sans text-sm text-zinc-400 mt-2 max-w-xl">
            Configure, edit, and reorder testimonials displayed on the main marketing pages.
          </p>
        </div>

        {formMode === "none" && (
          <button
            onClick={handleStartCreate}
            className="sm:self-start bg-[#C8A96E] hover:bg-[#B6965C] text-black font-sans font-medium text-xs uppercase tracking-[0.2em] px-5 py-4 transition-colors duration-300 whitespace-nowrap"
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

      {/* Grid of Testimonials */}
      {formMode === "none" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.length === 0 ? (
            <div className="col-span-full border border-zinc-800 bg-[#0F0F0F] p-12 text-center text-zinc-500 font-sans text-sm">
              No testimonials available. Create one to display on the landing page.
            </div>
          ) : (
            testimonials.map((testimonial) => (
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                onEdit={handleStartEdit}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
export default TestimonialListContainer;
