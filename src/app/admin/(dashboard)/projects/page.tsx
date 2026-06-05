import { getAdminProjects } from "@/actions/admin/projects";
import AdminProjectList from "@/components/admin/AdminProjectList";
import Link from "next/link";
import { Plus } from "lucide-react";

export const revalidate = 0;

export default async function AdminProjectsPage() {
  const projects = await getAdminProjects();

  return (
    <div className="flex flex-col gap-y-8">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-zinc-100">
            Projects Portfolio
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Manage your project portfolio, tech stacks, and developers.
          </p>
        </div>
        <Link
          href="/admin/projects/create"
          className="flex items-center gap-x-2 rounded-lg bg-[#C8A96E] px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-[#D4B87A]"
        >
          <Plus size={16} />
          Add Project
        </Link>
      </div>

      <AdminProjectList initialProjects={projects} />
    </div>
  );
}
