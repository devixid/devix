"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutAdmin } from "@/actions/admin/auth";

interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

export interface AdminNavBadges {
  unreadSubmissions: number;
  newEstimatorLeads: number;
}

function buildNavItems(badges?: AdminNavBadges): NavItem[] {
  return [
  { label: "Overview", href: "/admin", icon: "M4 6h16M4 12h16M4 18h7" },
  {
    label: "Inbox",
    href: "/admin/inbox",
    icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    badge: badges?.unreadSubmissions,
  },
  {
    label: "Leads",
    href: "/admin/leads",
    icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
    badge: badges?.newEstimatorLeads,
  },
  {
    label: "Projects",
    href: "/admin/projects",
    icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
  },
  {
    label: "Testimonials",
    href: "/admin/testimonials",
    icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  },
  {
    label: "Content",
    href: "/admin/content",
    icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  },
  {
    label: "Media",
    href: "/admin/media",
    icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
  {
    label: "Activity",
    href: "/admin/activity",
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  },
];
}

interface AdminSidebarProps {
  badges?: AdminNavBadges;
}

export function AdminSidebar({ badges }: AdminSidebarProps) {
  const navItems = buildNavItems(badges);
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await logoutAdmin();

      // Clear verify cookie client-side just in case it's still present from old system
      document.cookie =
        "x-admin-verified=; path=/admin; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-zinc-800 bg-[#0F0F0F] px-6 py-4 md:hidden">
        <Link
          href="/admin"
          className="font-display text-lg font-light tracking-wider text-zinc-100"
        >
          DEVIX <span className="text-[#C8A96E]">OPS</span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-zinc-400 hover:text-white focus:outline-none"
          aria-label="Toggle Menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 cursor-pointer bg-black/60 md:hidden"
          onClick={() => setIsOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape" || e.key === "Enter") setIsOpen(false);
          }}
          role="button"
          tabIndex={0}
          aria-label="Close Menu"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-[57px] bottom-0 left-0 z-40 flex w-64 flex-col justify-between border-r border-zinc-800 bg-[#0F0F0F] transition-transform duration-300 md:top-0 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col">
          {/* Logo Section */}
          <div className="hidden h-20 items-center border-b border-zinc-800 px-8 md:flex">
            <Link
              href="/admin"
              className="font-display text-xl font-light tracking-wider text-zinc-100"
            >
              DEVIX <span className="text-[#C8A96E]">OPS</span>
            </Link>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1 p-4">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  href={item.href as any}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3 font-sans text-xs tracking-[0.15em] uppercase transition-all duration-300 ${
                    isActive
                      ? "border-l-2 border-[#C8A96E] bg-[#141414] text-[#C8A96E]"
                      : "border-l-2 border-transparent text-zinc-400 hover:bg-[#121212] hover:text-zinc-200"
                  }`}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d={item.icon}
                    />
                  </svg>
                  <span className="flex-1">{item.label}</span>
                  {item.badge != null && item.badge > 0 && (
                    <span className="min-w-[1.25rem] rounded-full bg-[#C8A96E]/20 px-1.5 py-0.5 text-center text-[10px] font-medium text-[#C8A96E]">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="border-t border-zinc-800 p-4">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-4 px-4 py-3 font-sans text-xs tracking-[0.15em] text-zinc-400 uppercase transition-all duration-300 hover:bg-red-950/10 hover:text-red-400"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
