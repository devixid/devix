"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  inviteTeamMember,
  changeOwnPassword,
  updateNotificationEmail,
  deactivateTeamMember,
} from "@/actions/admin/settings";

interface TeamMember {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isActive: boolean;
  createdAt: Date;
}

interface SettingsPanelProps {
  members: TeamMember[];
  slotInfo: { count: number; max: number; canInvite: boolean };
  notificationEmailProp: string | null;
}

export default function SettingsPanel({
  members,
  slotInfo,
  notificationEmailProp,
}: SettingsPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showInvite, setShowInvite] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [notificationEmail, setNotificationEmail] = useState(
    notificationEmailProp || "",
  );
  const [notifError, setNotifError] = useState<string | null>(null);
  const [notifSuccess, setNotifSuccess] = useState(false);

  const handleInvite = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setInviteError(null);
    setInviteSuccess(false);

    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await inviteTeamMember(formData);
        setInviteSuccess(true);
        setShowInvite(false);
        (e.target as HTMLFormElement).reset();
        router.refresh();
      } catch (err) {
        setInviteError(
          err instanceof Error ? err.message : "Failed to invite member.",
        );
      }
    });
  };

  const handleChangePassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await changeOwnPassword(formData);
        setPasswordSuccess(true);
        (e.target as HTMLFormElement).reset();
      } catch (err) {
        setPasswordError(
          err instanceof Error ? err.message : "Failed to change password.",
        );
      }
    });
  };

  return (
    <div className="space-y-12">
      {/* Team Section */}
      <section className="border border-zinc-800 bg-[#0F0F0F] p-8">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-xl font-light text-zinc-100">
              Team Members
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {slotInfo.count} of {slotInfo.max} admin slots used
            </p>
          </div>
          {slotInfo.canInvite && (
            <button
              type="button"
              onClick={() => setShowInvite(!showInvite)}
              className="bg-[#C8A96E] px-5 py-2.5 text-xs font-medium tracking-wider text-black uppercase transition-colors hover:bg-[#B6965C]"
            >
              {showInvite ? "Cancel" : "Invite Member"}
            </button>
          )}
        </div>

        {inviteSuccess && (
          <div className="mb-4 border-l border-green-500 bg-green-950/30 p-3 text-sm text-green-400">
            Team member invited successfully.
          </div>
        )}

        {showInvite && (
          <form
            onSubmit={handleInvite}
            className="mb-8 space-y-4 border border-zinc-800 bg-zinc-900/30 p-6"
          >
            {inviteError && (
              <div className="border-l border-red-500 bg-red-950/30 p-3 text-sm text-red-400">
                {inviteError}
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="invite-email"
                  className="mb-1.5 block text-xs font-medium tracking-wider text-zinc-500 uppercase"
                >
                  Email
                </label>
                <input
                  id="invite-email"
                  name="email"
                  type="email"
                  required
                  className="w-full border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-sm text-white outline-none focus:border-[#C8A96E]"
                />
              </div>
              <div>
                <label
                  htmlFor="invite-password"
                  className="mb-1.5 block text-xs font-medium tracking-wider text-zinc-500 uppercase"
                >
                  Password
                </label>
                <input
                  id="invite-password"
                  name="password"
                  type="password"
                  required
                  minLength={12}
                  className="w-full border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-sm text-white outline-none focus:border-[#C8A96E]"
                />
              </div>
              <div>
                <label
                  htmlFor="invite-firstName"
                  className="mb-1.5 block text-xs font-medium tracking-wider text-zinc-500 uppercase"
                >
                  First Name
                </label>
                <input
                  id="invite-firstName"
                  name="firstName"
                  type="text"
                  className="w-full border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-sm text-white outline-none focus:border-[#C8A96E]"
                />
              </div>
              <div>
                <label
                  htmlFor="invite-lastName"
                  className="mb-1.5 block text-xs font-medium tracking-wider text-zinc-500 uppercase"
                >
                  Last Name
                </label>
                <input
                  id="invite-lastName"
                  name="lastName"
                  type="text"
                  className="w-full border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-sm text-white outline-none focus:border-[#C8A96E]"
                />
              </div>
            </div>
            <p className="text-xs text-zinc-500">
              Min 12 chars, uppercase, number, and special character required.
            </p>
            <button
              type="submit"
              disabled={isPending}
              className="bg-[#C8A96E] px-6 py-2.5 text-xs font-medium tracking-wider text-black uppercase hover:bg-[#B6965C] disabled:opacity-50"
            >
              {isPending ? "Inviting..." : "Send Invite"}
            </button>
          </form>
        )}

        <div className="divide-y divide-zinc-900">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
            >
              <div>
                <p className="text-sm font-medium text-zinc-200">
                  {[member.firstName, member.lastName]
                    .filter(Boolean)
                    .join(" ") || "—"}
                </p>
                <p className="font-mono text-xs text-zinc-500">
                  {member.email}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {!member.isActive && (
                  <span className="text-[10px] text-zinc-600 uppercase">
                    Inactive
                  </span>
                )}
                <span className="text-[10px] tracking-wider text-zinc-600 uppercase">
                  Joined{" "}
                  {new Date(member.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                {member.isActive && (
                  <button
                    type="button"
                    onClick={() =>
                      startTransition(async () => {
                        try {
                          await deactivateTeamMember(member.id);
                          router.refresh();
                        } catch (err) {
                          setInviteError(
                            err instanceof Error
                              ? err.message
                              : "Deactivate failed.",
                          );
                        }
                      })
                    }
                    className="text-[10px] text-red-400 uppercase hover:underline"
                  >
                    Deactivate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Account Section */}
      <section className="border border-zinc-800 bg-[#0F0F0F] p-8">
        <h2 className="font-display mb-6 text-xl font-light text-zinc-100">
          Change Password
        </h2>
        {passwordSuccess && (
          <div className="mb-4 border-l border-green-500 bg-green-950/30 p-3 text-sm text-green-400">
            Password updated successfully.
          </div>
        )}
        {passwordError && (
          <div className="mb-4 border-l border-red-500 bg-red-950/30 p-3 text-sm text-red-400">
            {passwordError}
          </div>
        )}
        <form
          onSubmit={handleChangePassword}
          className="max-w-md space-y-4"
        >
          <div>
            <label
              htmlFor="current-password"
              className="mb-1.5 block text-xs font-medium tracking-wider text-zinc-500 uppercase"
            >
              Current Password
            </label>
            <input
              id="current-password"
              name="currentPassword"
              type="password"
              required
              className="w-full border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-sm text-white outline-none focus:border-[#C8A96E]"
            />
          </div>
          <div>
            <label
              htmlFor="new-password"
              className="mb-1.5 block text-xs font-medium tracking-wider text-zinc-500 uppercase"
            >
              New Password
            </label>
            <input
              id="new-password"
              name="newPassword"
              type="password"
              required
              minLength={12}
              className="w-full border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-sm text-white outline-none focus:border-[#C8A96E]"
            />
          </div>
          <div>
            <label
              htmlFor="confirm-password"
              className="mb-1.5 block text-xs font-medium tracking-wider text-zinc-500 uppercase"
            >
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              required
              className="w-full border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-sm text-white outline-none focus:border-[#C8A96E]"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="bg-[#C8A96E] px-6 py-2.5 text-xs font-medium tracking-wider text-black uppercase hover:bg-[#B6965C] disabled:opacity-50"
          >
            {isPending ? "Updating..." : "Update Password"}
          </button>
        </form>
      </section>

      <section className="border border-zinc-800 bg-[#0F0F0F] p-8">
        <h2 className="font-display mb-2 text-xl font-light text-zinc-100">
          Notifications
        </h2>
        <p className="mb-6 text-sm text-zinc-500">
          Email address for new inquiry and estimator lead notifications via
          Resend.
        </p>
        {notifSuccess && (
          <div className="mb-4 border-l border-green-500 bg-green-950/30 p-3 text-sm text-green-400">
            Notification email updated.
          </div>
        )}
        {notifError && (
          <div className="mb-4 border-l border-red-500 bg-red-950/30 p-3 text-sm text-red-400">
            {notifError}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setNotifError(null);
            setNotifSuccess(false);
            startTransition(async () => {
              try {
                await updateNotificationEmail(notificationEmail);
                setNotifSuccess(true);
                router.refresh();
              } catch (err) {
                setNotifError(
                  err instanceof Error ? err.message : "Update failed.",
                );
              }
            });
          }}
          className="flex max-w-md flex-col gap-4 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <label
              htmlFor="notification-email"
              className="mb-1.5 block text-xs font-medium tracking-wider text-zinc-500 uppercase"
            >
              Notification Email
            </label>
            <input
              id="notification-email"
              type="email"
              value={notificationEmail}
              onChange={(e) => setNotificationEmail(e.target.value)}
              placeholder="hello@devix.id"
              className="w-full border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-sm text-white outline-none focus:border-[#C8A96E]"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="bg-[#C8A96E] px-6 py-2.5 text-xs font-medium tracking-wider text-black uppercase hover:bg-[#B6965C] disabled:opacity-50"
          >
            Save
          </button>
        </form>
      </section>
    </div>
  );
}
