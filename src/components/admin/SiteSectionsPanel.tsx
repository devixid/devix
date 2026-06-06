"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSiteSection } from "@/actions/admin/content";
import type { SiteSectionKey } from "@prisma/client";
import { DEFAULT_SITE_SECTIONS } from "@/lib/content-defaults";

const SECTION_LABELS: Record<SiteSectionKey, string> = {
  HERO: "Hero",
  ABOUT: "About",
  SERVICES_INTRO: "Services Intro",
  TEAM_INTRO: "Team Intro",
  PORTFOLIO_INTRO: "Portfolio Intro",
  TESTIMONIALS_INTRO: "Testimonials Intro",
  CTA: "CTA",
  CONTACT: "Contact",
  FOOTER: "Footer",
  SEO: "SEO / Metadata",
};

export function SiteSectionsPanel({
  sections,
}: {
  sections: { key: SiteSectionKey; content: unknown }[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeKey, setActiveKey] = useState<SiteSectionKey>("HERO");
  const sectionMap = Object.fromEntries(sections.map((s) => [s.key, s.content]));
  const currentContent =
    sectionMap[activeKey] ?? DEFAULT_SITE_SECTIONS[activeKey];
  const [jsonText, setJsonText] = useState(
    JSON.stringify(currentContent, null, 2),
  );

  const selectKey = (key: SiteSectionKey) => {
    setActiveKey(key);
    const content = sectionMap[key] ?? DEFAULT_SITE_SECTIONS[key];
    setJsonText(JSON.stringify(content, null, 2));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(SECTION_LABELS) as SiteSectionKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => selectKey(key)}
            className={`px-3 py-1.5 text-[10px] tracking-wider uppercase ${
              activeKey === key
                ? "bg-[#C8A96E]/10 text-[#C8A96E]"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {SECTION_LABELS[key]}
          </button>
        ))}
      </div>

      <textarea
        rows={18}
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
        className="w-full border border-zinc-800 bg-zinc-900/50 p-4 font-mono text-xs text-white"
      />

      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const parsed = JSON.parse(jsonText);
            await updateSiteSection(activeKey, parsed);
            router.refresh();
          })
        }
        className="bg-[#C8A96E] px-6 py-2 text-xs tracking-wider text-black uppercase"
      >
        {isPending ? "Saving..." : `Save ${SECTION_LABELS[activeKey]}`}
      </button>
      <p className="text-xs text-zinc-600">
        Edit section content as JSON. Schema is validated on save.
      </p>
    </div>
  );
}
