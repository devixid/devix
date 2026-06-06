"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createFaqItem,
  updateFaqItem,
  deleteFaqItem,
} from "@/actions/admin/content";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  order: number;
  isVisible: boolean;
}

export function FaqAdminPanel({ items }: { items: FaqItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<FaqItem | null>(null);
  const [form, setForm] = useState({
    question: "",
    answer: "",
    isVisible: true,
  });

  const resetForm = () => {
    setEditing(null);
    setForm({ question: "", answer: "", isVisible: true });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      if (editing) {
        await updateFaqItem(editing.id, form);
      } else {
        await createFaqItem(form);
      }
      resetForm();
      router.refresh();
    });
  };

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 border border-zinc-800 bg-[#0F0F0F] p-6"
      >
        <h2 className="text-sm font-medium text-zinc-200">
          {editing ? "Edit FAQ" : "Add FAQ"}
        </h2>
        <input
          required
          value={form.question}
          onChange={(e) => setForm({ ...form, question: e.target.value })}
          placeholder="Question"
          className="w-full border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-sm text-white"
        />
        <textarea
          required
          rows={4}
          value={form.answer}
          onChange={(e) => setForm({ ...form, answer: e.target.value })}
          placeholder="Answer"
          className="w-full border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-sm text-white"
        />
        <label className="flex items-center gap-2 text-sm text-zinc-400">
          <input
            type="checkbox"
            checked={form.isVisible}
            onChange={(e) => setForm({ ...form, isVisible: e.target.checked })}
          />
          Visible on site
        </label>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="bg-[#C8A96E] px-6 py-2 text-xs tracking-wider text-black uppercase"
          >
            {isPending ? "Saving..." : editing ? "Update" : "Add"}
          </button>
          {editing && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-zinc-500 uppercase"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="divide-y divide-zinc-900 border border-zinc-800">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-start justify-between gap-4 p-6"
          >
            <div>
              <p className="text-sm font-medium text-zinc-200">
                {item.question}
              </p>
              <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
                {item.answer}
              </p>
              {!item.isVisible && (
                <span className="mt-2 inline-block text-[10px] text-zinc-600 uppercase">
                  Hidden
                </span>
              )}
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditing(item);
                  setForm({
                    question: item.question,
                    answer: item.answer,
                    isVisible: item.isVisible,
                  });
                }}
                className="text-xs text-[#C8A96E] uppercase"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() =>
                  startTransition(async () => {
                    await deleteFaqItem(item.id);
                    router.refresh();
                  })
                }
                className="text-xs text-red-400 uppercase"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
