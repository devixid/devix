"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutAdmin } from "@/actions/admin/auth";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: "Overview", href: "/admin", icon: "M4 6h16M4 12h16M4 18h7" },
  {
    label: "Inbox",
    href: "/admin/inbox",
    icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
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
];

export function AdminSidebar() {
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
                  {item.label}
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
