import { getAdminTeamMembers } from "@/actions/admin/content";
import { ContentSubNav } from "@/components/admin/ContentSubNav";
import { TeamAdminPanel } from "@/components/admin/TeamAdminPanel";

export const metadata = { title: "Team Content — Devix Operations" };

export default async function TeamContentPage() {
  const members = await getAdminTeamMembers();
  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-light text-zinc-100">Team</h1>
      <ContentSubNav />
      <TeamAdminPanel
        members={members.map((m) => ({
          ...m,
          socialLinks: m.socialLinks as {
            github?: string;
            linkedin?: string;
          } | null,
        }))}
      />
    </div>
  );
}
