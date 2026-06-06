"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from "@/actions/admin/content";

interface TeamMember {
  id: string;
  name: string;
  title: string;
  description: string;
  imageUrl: string;
  socialLinks: { github?: string; linkedin?: string } | null;
  isVisible: boolean;
}

export function TeamAdminPanel({ members }: { members: TeamMember[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [form, setForm] = useState({
    name: "",
    title: "",
    description: "",
    imageUrl: "",
    github: "",
    linkedin: "",
    isVisible: true,
  });

  const resetForm = () => {
    setEditing(null);
    setForm({
      name: "",
      title: "",
      description: "",
      imageUrl: "",
      github: "",
      linkedin: "",
      isVisible: true,
    });
  };

  const toPayload = () => ({
    name: form.name,
    title: form.title,
    description: form.description,
    imageUrl: form.imageUrl,
    socialLinks: {
      github: form.github || undefined,
      linkedin: form.linkedin || undefined,
    },
    isVisible: form.isVisible,
  });

  return (
    <div className="space-y-8">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(async () => {
            const payload = toPayload();
            if (editing) await updateTeamMember(editing.id, payload);
            else await createTeamMember(payload);
            resetForm();
            router.refresh();
          });
        }}
        className="grid gap-4 border border-zinc-800 bg-[#0F0F0F] p-6 md:grid-cols-2"
      >
        <h2 className="text-sm font-medium text-zinc-200 md:col-span-2">
          {editing ? "Edit Member" : "Add Member"}
        </h2>
        {(["name", "title", "imageUrl", "github", "linkedin"] as const).map(
          (field) => (
            <input
              key={field}
              required={
                field === "name" || field === "title" || field === "imageUrl"
              }
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              placeholder={field}
              className="border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-sm text-white"
            />
          ),
        )}
        <textarea
          required
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Description"
          className="border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-sm text-white md:col-span-2"
        />
        <button
          type="submit"
          disabled={isPending}
          className="bg-[#C8A96E] px-6 py-2 text-xs tracking-wider text-black uppercase md:col-span-2 md:w-fit"
        >
          {editing ? "Update" : "Add"}
        </button>
      </form>

      <div className="divide-y divide-zinc-900 border border-zinc-800">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex justify-between gap-4 p-6"
          >
            <div>
              <p className="text-sm font-medium text-zinc-200">{member.name}</p>
              <p className="text-xs text-zinc-500">{member.title}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditing(member);
                  setForm({
                    name: member.name,
                    title: member.title,
                    description: member.description,
                    imageUrl: member.imageUrl,
                    github: member.socialLinks?.github ?? "",
                    linkedin: member.socialLinks?.linkedin ?? "",
                    isVisible: member.isVisible,
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
                    await deleteTeamMember(member.id);
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
