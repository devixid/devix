import { getAdminSiteSections } from "@/actions/admin/content";
import { ContentSubNav } from "@/components/admin/ContentSubNav";
import { SiteSectionsPanel } from "@/components/admin/SiteSectionsPanel";

export const metadata = { title: "Page Sections — Devix Operations" };

export default async function SectionsContentPage() {
  const sections = await getAdminSiteSections();
  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-light text-zinc-100">
        Page Sections
      </h1>
      <ContentSubNav />
      <SiteSectionsPanel sections={sections} />
    </div>
  );
}
