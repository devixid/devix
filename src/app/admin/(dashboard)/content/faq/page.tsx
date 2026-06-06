import { getAdminFaqItems } from "@/actions/admin/content";
import { ContentSubNav } from "@/components/admin/ContentSubNav";
import { FaqAdminPanel } from "@/components/admin/FaqAdminPanel";

export const metadata = { title: "FAQ Content — Devix Operations" };

export default async function FaqContentPage() {
  const items = await getAdminFaqItems();
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-light text-zinc-100">FAQ</h1>
      </div>
      <ContentSubNav />
      <FaqAdminPanel items={items} />
    </div>
  );
}
