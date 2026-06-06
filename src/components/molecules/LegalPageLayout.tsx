import Link from "next/link";

type LegalSection = {
  heading: string;
  body: string;
};

export function LegalPageLayout({
  title,
  lastUpdated,
  sections,
}: {
  title: string;
  lastUpdated: string;
  sections: readonly LegalSection[];
}) {
  return (
    <div className="grain-overlay min-h-screen bg-white pt-[120px] pb-24 text-black">
      <div className="mx-auto max-w-3xl px-6 lg:px-10">
        <p className="mb-4 text-[13px] font-medium tracking-[0.2em] text-zinc-400 uppercase">
          Legal
        </p>
        <h1 className="font-display text-4xl font-extralight tracking-tight md:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-sm text-zinc-500">
          Last updated: {lastUpdated}
        </p>

        <div className="mt-12 space-y-10">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-display mb-4 text-xl font-medium text-zinc-900">
                {section.heading}
              </h2>
              <div className="space-y-4 text-sm leading-relaxed whitespace-pre-line text-zinc-600">
                {section.body.split("\n\n").map((paragraph) => (
                  <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-16 border-t border-zinc-200 pt-8 text-sm text-zinc-500">
          <Link
            href="/"
            className="text-accent hover:text-accent-light"
          >
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
