import Link from "next/link";
import { getFeaturedProjectsForOrder } from "@/actions/admin/projects";
import FeaturedOrderEditor from "@/components/admin/FeaturedOrderEditor";

export const metadata = {
  title: "Featured Order — Devix Operations",
};

export default async function FeaturedOrderPage() {
  const projects = await getFeaturedProjectsForOrder();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Link
          href="/admin/projects"
          className="mb-4 inline-flex items-center gap-2 text-xs tracking-[0.2em] text-zinc-500 uppercase hover:text-zinc-300"
        >
          ← Back to Projects
        </Link>
        <h1 className="font-display text-3xl font-light text-zinc-100">
          Featured Order
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Control the display order of featured projects on the homepage.
        </p>
      </div>

      <FeaturedOrderEditor initialProjects={projects} />
    </div>
  );
}
