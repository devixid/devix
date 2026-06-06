import { getAdminServiceItems } from "@/actions/admin/content";
import { ContentSubNav } from "@/components/admin/ContentSubNav";
import { ServicesAdminPanel } from "@/components/admin/ServicesAdminPanel";

export const metadata = { title: "Services Content — Devix Operations" };

export default async function ServicesContentPage() {
  const items = await getAdminServiceItems();
  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-light text-zinc-100">Services</h1>
      <ContentSubNav />
      <ServicesAdminPanel items={items} />
    </div>
  );
}
