import { Metadata } from "next";
import { toProjectListItems } from "@/lib/mappers/projects";
import { getFilterOptions, getProjects } from "@/lib/queries/projects";
import CatalogClient from "@/components/organisms/CatalogClient";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Explore our portfolio of custom web development, e-commerce, and SaaS projects.",
  alternates: {
    canonical: "/projects",
  },
};

export const revalidate = 3600;

export default async function ProjectsPage() {
  const [projects, filterOptions] = await Promise.all([
    getProjects(),
    getFilterOptions(),
  ]);

  return (
    <div className="grain-overlay min-h-screen bg-white pt-[120px] pb-32">
      <CatalogClient
        title="Projects."
        eyebrow="Our Work"
        items={toProjectListItems(projects)}
        filterOptions={filterOptions}
        cardType="project"
      />
    </div>
  );
}
