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
    <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-zinc-900">
      
      {/* Mark Read/Unread */}
      <button
        onClick={handleToggleRead}
        disabled={isPending}
        className="border border-zinc-800 bg-[#0F0F0F] hover:bg-[#121212] disabled:opacity-50 text-zinc-300 hover:text-white px-5 py-3 text-xs uppercase tracking-wider font-sans font-medium transition-colors duration-300"
      >
        {isRead ? "Mark as Unread" : "Mark as Read"}
      </button>

      {/* Reply Email */}
      <a
        href={`mailto:${email}?subject=Re: Your inquiry to Devix`}
        className="bg-[#C8A96E] hover:bg-[#B6965C] text-black px-5 py-3 text-xs uppercase tracking-wider font-sans font-medium transition-colors duration-300 block"
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
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 text-xs uppercase tracking-wider font-sans font-medium transition-colors duration-300"
            >
              Confirm?
            </button>
            <button
              onClick={() => setDeleteConfirm(false)}
              disabled={isPending}
              className="border border-zinc-800 bg-[#0F0F0F] hover:bg-[#121212] text-zinc-400 px-4 py-3 text-xs uppercase tracking-wider font-sans font-medium transition-colors duration-300"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="border border-red-900/30 hover:border-red-900 bg-red-950/10 hover:bg-red-950/20 text-red-400 px-5 py-3 text-xs uppercase tracking-wider font-sans font-medium transition-colors duration-300"
          >
            Delete
          </button>
        )}
      </div>

    </div>
  );
}
export default InboxActionButtons;
