"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin/content", label: "Overview" },
  { href: "/admin/content/faq", label: "FAQ" },
  { href: "/admin/content/services", label: "Services" },
  { href: "/admin/content/team", label: "Team" },
  { href: "/admin/content/sections", label: "Sections" },
];

export function ContentSubNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 border-b border-zinc-800 pb-4">
      {links.map((link) => {
        const isActive =
          link.href === "/admin/content"
            ? pathname === link.href
            : pathname?.startsWith(link.href);
        return (
          <Link
            key={link.href}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            href={link.href as any}
            className={`px-4 py-2 text-xs tracking-[0.15em] uppercase transition-colors ${
              isActive
                ? "bg-[#C8A96E]/10 text-[#C8A96E]"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
