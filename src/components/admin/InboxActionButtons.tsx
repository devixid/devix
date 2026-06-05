"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { markSubmissionAsRead, deleteSubmission } from "@/actions/admin";

interface Props {
  id: string;
  isRead: boolean;
  email: string;
  name: string;
}

export function InboxActionButtons({ id, isRead, email, name: _name }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Auto-reset delete confirmation after 3 seconds
  useEffect(() => {
    if (deleteConfirm) {
      const timer = setTimeout(() => {
        setDeleteConfirm(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [deleteConfirm]);

  const handleToggleRead = () => {
    startTransition(async () => {
      try {
        await markSubmissionAsRead(id, !isRead);
        router.refresh();
      } catch (err) {
        console.error("Failed to toggle read state:", err);
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
        await deleteSubmission(id);
        router.push("/admin/inbox");
        router.refresh();
      } catch (err) {
        console.error("Failed to delete submission:", err);
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-zinc-900 pt-6">
      {/* Mark Read/Unread */}
      <button
        onClick={handleToggleRead}
        disabled={isPending}
        className="border border-zinc-800 bg-[#0F0F0F] px-5 py-3 font-sans text-xs font-medium tracking-wider text-zinc-300 uppercase transition-colors duration-300 hover:bg-[#121212] hover:text-white disabled:opacity-50"
      >
        {isRead ? "Mark as Unread" : "Mark as Read"}
      </button>

      {/* Reply Email */}
      <a
        href={`mailto:${email}?subject=Re: Your inquiry to Devix`}
        className="block bg-[#C8A96E] px-5 py-3 font-sans text-xs font-medium tracking-wider text-black uppercase transition-colors duration-300 hover:bg-[#B6965C]"
      >
        Reply via Email
      </a>

      {/* Delete with inline confirmation */}
      <div className="flex items-center gap-2">
        {deleteConfirm ? (
          <>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-600 px-4 py-3 font-sans text-xs font-medium tracking-wider text-white uppercase transition-colors duration-300 hover:bg-red-700"
            >
              Confirm?
            </button>
            <button
              onClick={() => setDeleteConfirm(false)}
              disabled={isPending}
              className="border border-zinc-800 bg-[#0F0F0F] px-4 py-3 font-sans text-xs font-medium tracking-wider text-zinc-400 uppercase transition-colors duration-300 hover:bg-[#121212]"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="border border-red-900/30 bg-red-950/10 px-5 py-3 font-sans text-xs font-medium tracking-wider text-red-400 uppercase transition-colors duration-300 hover:border-red-900 hover:bg-red-950/20"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
export default InboxActionButtons;
