"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteFeedback,
  markFeedbackRead,
} from "@/actions/admin/feedback";

interface Props {
  id: string;
  isRead: boolean;
}

export function FeedbackDetailPanel({ id, isRead }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isRead) return;

    startTransition(async () => {
      await markFeedbackRead(id, true);
      router.refresh();
    });
  }, [id, isRead, router]);

  const handleToggleRead = () => {
    startTransition(async () => {
      await markFeedbackRead(id, !isRead);
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    startTransition(async () => {
      await deleteFeedback(id);
      router.push("/admin/feedback");
      router.refresh();
    });
  };

  return (
    <div className="flex flex-wrap gap-3 border-t border-zinc-900 pt-8">
      <button
        type="button"
        disabled={isPending}
        onClick={handleToggleRead}
        className="border border-zinc-700 px-4 py-2 font-sans text-xs tracking-[0.15em] text-zinc-300 uppercase transition-colors hover:border-zinc-500 hover:text-white disabled:opacity-50"
      >
        {isRead ? "Mark unread" : "Mark read"}
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={handleDelete}
        className="border border-red-900 px-4 py-2 font-sans text-xs tracking-[0.15em] text-red-400 uppercase transition-colors hover:border-red-700 hover:text-red-300 disabled:opacity-50"
      >
        {deleteConfirm ? "Confirm delete" : "Delete"}
      </button>
      {deleteConfirm && !isPending && (
        <button
          type="button"
          onClick={() => setDeleteConfirm(false)}
          className="px-2 py-2 text-xs text-zinc-500 hover:text-zinc-300"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
