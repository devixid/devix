"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createServiceItem,
  updateServiceItem,
  deleteServiceItem,
} from "@/actions/admin/content";

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  isVisible: boolean;
}

export function ServicesAdminPanel({ items }: { items: ServiceItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<ServiceItem | null>(null);
  const [form, setForm] = useState({ title: "", description: "", isVisible: true });

  const resetForm = () => {
    setEditing(null);
    setForm({ title: "", description: "", isVisible: true });
  };

  return (
    <div className="space-y-8">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(async () => {
            if (editing) await updateServiceItem(editing.id, form);
            else await createServiceItem(form);
            resetForm();
            router.refresh();
          });
        }}
        className="space-y-4 border border-zinc-800 bg-[#0F0F0F] p-6"
      >
        <h2 className="text-sm font-medium text-zinc-200">
          {editing ? "Edit Service" : "Add Service"}
        </h2>
        <input
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Title"
          className="w-full border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-sm text-white"
        />
        <textarea
          required
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Description"
          className="w-full border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-sm text-white"
        />
        <button
          type="submit"
          disabled={isPending}
          className="bg-[#C8A96E] px-6 py-2 text-xs tracking-wider text-black uppercase"
        >
          {editing ? "Update" : "Add"}
        </button>
      </form>

      <div className="divide-y divide-zinc-900 border border-zinc-800">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between gap-4 p-6">
            <div>
              <p className="text-sm font-medium text-zinc-200">{item.title}</p>
              <p className="mt-1 text-xs text-zinc-500">{item.description}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditing(item);
                  setForm({
                    title: item.title,
                    description: item.description,
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
                    await deleteServiceItem(item.id);
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
