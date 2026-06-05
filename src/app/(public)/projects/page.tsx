import { Metadata } from "next";
import { getFilterOptions, getProjects } from "@/actions/projects";
import ProjectsClient from "./ProjectsClient";

export const metadata: Metadata = {
  title: "Projects | Devix",
  description:
    "Explore our portfolio of custom web development, e-commerce, and SaaS projects.",
};

export const revalidate = 60; // Enable ISR for 60 seconds with Redis caching

export default async function ProjectsPage() {
  const [projects, filterOptions] = await Promise.all([
    getProjects(),
    getFilterOptions(),
  ]);

  return (
    <div className="grain-overlay min-h-screen bg-white pt-[120px] pb-32">
      <ProjectsClient
        initialProjects={projects}
        filterOptions={filterOptions}
      />
    </div>
  );
}
