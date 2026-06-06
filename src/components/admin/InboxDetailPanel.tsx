"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  markSubmissionAsRead,
  deleteSubmission,
  updateSubmissionStatus,
  updateInternalNotes,
} from "@/actions/admin";
import { DropdownSelect } from "@/components/molecules/DropdownSelect";
import type { InquiryStatus } from "@prisma/client";

interface Props {
  id: string;
  isRead: boolean;
  email: string;
  name: string;
  message: string;
  status: InquiryStatus;
  internalNotes: string | null;
  source: string;
}

const STATUS_OPTIONS: { value: InquiryStatus; label: string }[] = [
  { value: "NEW", label: "New" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "CLOSED", label: "Closed" },
];

export default function InboxDetailPanel({
  id,
  isRead,
  email,
  name,
  message,
  status,
  internalNotes,
  source,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [notes, setNotes] = useState(internalNotes || "");
  const [notesSaved, setNotesSaved] = useState(false);

  useEffect(() => {
    if (isRead) return;

    startTransition(async () => {
      await markSubmissionAsRead(id, true);
      router.refresh();
    });
  }, [id, isRead, router]);

  const handleToggleRead = () => {
    startTransition(async () => {
      await markSubmissionAsRead(id, !isRead);
      router.refresh();
    });
  };

  const handleStatusChange = (newStatus: InquiryStatus) => {
    startTransition(async () => {
      await updateSubmissionStatus(id, newStatus);
      router.refresh();
    });
  };

  const handleSaveNotes = () => {
    startTransition(async () => {
      await updateInternalNotes(id, notes);
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    startTransition(async () => {
      await deleteSubmission(id);
      router.push("/admin/inbox");
      router.refresh();
    });
  };

  const replyBody = encodeURIComponent(
    `Hi ${name},\n\nThank you for reaching out to Devix.\n\n---\nYour message:\n${message}`,
  );

  const copyEmail = () => {
    void navigator.clipboard.writeText(email);
  };

  return (
    <div className="space-y-6 border-t border-zinc-900 pt-6">
      <div className="flex flex-wrap items-center gap-3">
        <label
          htmlFor="inbox-status"
          className="text-[10px] tracking-wider text-zinc-500 uppercase"
        >
          Status
        </label>
        <DropdownSelect
          id="inbox-status"
          value={status}
          options={STATUS_OPTIONS}
          disabled={isPending}
          variant="dark"
          onChange={handleStatusChange}
        />
        {source === "estimator" && (
          <span className="bg-[#C8A96E]/10 px-2 py-1 text-[10px] font-medium tracking-wider text-[#C8A96E] uppercase">
            Estimator Lead
          </span>
        )}
      </div>

      <div>
        <label
          htmlFor="inbox-internal-notes"
          className="mb-2 block text-[10px] tracking-wider text-zinc-500 uppercase"
        >
          Internal Notes
        </label>
        <textarea
          id="inbox-internal-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Private notes for your team..."
          className="w-full border border-zinc-800 bg-zinc-900/30 px-4 py-3 text-sm text-zinc-300 outline-none focus:border-[#C8A96E]"
        />
        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={handleSaveNotes}
            disabled={isPending}
            className="border border-zinc-800 px-4 py-2 text-xs font-medium tracking-wider text-zinc-300 uppercase hover:bg-zinc-900 disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save Notes"}
          </button>
          {notesSaved && (
            <span className="text-xs text-green-500">Saved</span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleToggleRead}
          disabled={isPending}
          className="border border-zinc-800 bg-[#0F0F0F] px-5 py-3 text-xs font-medium tracking-wider text-zinc-300 uppercase hover:bg-[#121212] disabled:opacity-50"
        >
          {isRead ? "Mark as Unread" : "Mark as Read"}
        </button>

        <button
          type="button"
          onClick={copyEmail}
          className="border border-zinc-800 px-5 py-3 text-xs font-medium tracking-wider text-zinc-300 uppercase hover:bg-[#121212]"
        >
          Copy Email
        </button>

        <a
          href={`mailto:${email}?subject=${encodeURIComponent(`Re: Your inquiry to Devix`)}&body=${replyBody}`}
          className="bg-[#C8A96E] px-5 py-3 text-xs font-medium tracking-wider text-black uppercase hover:bg-[#B6965C]"
        >
          Reply via Email
        </a>

        {deleteConfirm ? (
          <>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-600 px-4 py-3 text-xs font-medium tracking-wider text-white uppercase hover:bg-red-700"
            >
              Confirm Delete?
            </button>
            <button
              type="button"
              onClick={() => setDeleteConfirm(false)}
              className="border border-zinc-800 px-4 py-3 text-xs text-zinc-400 uppercase"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="border border-red-900/30 bg-red-950/10 px-5 py-3 text-xs font-medium tracking-wider text-red-400 uppercase hover:border-red-900"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
