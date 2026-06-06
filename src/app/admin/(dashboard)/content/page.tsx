import Link from "next/link";
import { ContentSubNav } from "@/components/admin/ContentSubNav";

export const metadata = { title: "Site Content — Devix Operations" };

const sections = [
  { href: "/admin/content/faq", label: "FAQ", desc: "Manage frequently asked questions" },
  { href: "/admin/content/services", label: "Services", desc: "What We Do offerings" },
  { href: "/admin/content/team", label: "Team", desc: "Team member profiles" },
  { href: "/admin/content/sections", label: "Page Sections", desc: "Hero, About, CTA, SEO, and more" },
];

export default function ContentHubPage() {
  return (
    <div className="space-y-8">
      <div>
        <span className="mb-3 block text-[11px] font-medium tracking-[0.25em] text-zinc-500 uppercase">
          CMS
        </span>
        <h1 className="font-display text-3xl font-light tracking-wide text-zinc-100">
          Site Content
        </h1>
        <p className="mt-2 max-w-xl text-sm text-zinc-400">
          Edit marketing copy without deploying code.
        </p>
      </div>
      <ContentSubNav />
      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((s) => (
          <Link
            key={s.href}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            href={s.href as any}
            className="border border-zinc-800 bg-[#0F0F0F] p-6 transition-colors hover:border-zinc-700"
          >
            <h2 className="text-sm font-medium text-zinc-200">{s.label}</h2>
            <p className="mt-1 text-xs text-zinc-500">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
