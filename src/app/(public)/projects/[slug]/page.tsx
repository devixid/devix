import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, GitCommit, ArrowLeft } from "lucide-react";
import { getProjectBySlug } from "@/lib/queries/projects";
import { sanitizeRichHtml } from "@/utils/sanitize";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug);

  if (!project) {
    return {
      title: "Project Not Found | Devix",
      robots: { index: false },
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://devix.com";

  return {
    title: `${project.title} | Case Study by Devix`,
    description: project.description.substring(0, 155),
    openGraph: {
      images: [project.imageUrl],
      title: `${project.title} | Case Study`,
      description: project.description.substring(0, 155),
    },
    alternates: {
      canonical: `${baseUrl}/projects/${project.slug}`,
    },
  };
}

export const revalidate = 3600; // ISR 1 Hour

export default async function ProjectDetailPage({ params }: Props) {
  const project = await getProjectBySlug(params.slug);

  if (!project) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://devix.com";
  
  // Breadcrumb Schema
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${baseUrl}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Projects",
        item: `${baseUrl}/projects`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: project.title,
        item: `${baseUrl}/projects/${project.slug}`,
      },
    ],
  };

  return (
    <div className="grain-overlay bg-white min-h-screen text-black pb-32">
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[500px] w-full bg-zinc-100 overflow-hidden pt-20">
        <Image
          src={project.imageUrl}
          alt={project.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        {/* Navigation & Header overlay */}
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="mx-auto w-full max-w-6xl px-6 lg:px-10 pb-16">
            <Link 
              href="/projects" 
              className="inline-flex items-center gap-x-2 text-white/70 hover:text-white mb-6 text-sm font-medium transition-colors"
            >
              <ArrowLeft size={16} /> Back to Projects
            </Link>
            
            <div className="flex items-center gap-x-4 mb-4">
              <span className="text-accent text-xs font-bold tracking-[0.2em] uppercase bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md">
                {project.category}
              </span>
              {project.completedAt && (
                <span className="text-white/80 text-sm font-medium">
                  {new Date(project.completedAt).getFullYear()}
                </span>
              )}
            </div>
            
            <h1 className="font-display text-4xl md:text-6xl font-medium tracking-tight text-white max-w-4xl">
              {project.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Content Layout */}
      <div className="mx-auto max-w-6xl px-6 lg:px-10 mt-16 md:mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          
          {/* Main Content Area */}
          <div className="lg:col-span-8">
            <div className="prose prose-lg prose-zinc max-w-none">
              <h2 className="text-2xl md:text-3xl font-display font-medium tracking-tight mb-6">Overview</h2>
              <p className="text-lg leading-relaxed text-zinc-600 mb-8 whitespace-pre-line">
                {project.description}
              </p>

              {/* Rich Content if exists */}
              {project.content && (
                <div className="mt-12 border-t border-zinc-100 pt-12">
                  <div
                    className="prose prose-lg prose-zinc max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeRichHtml(project.content),
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-12">
              
              {/* Links */}
              {(project.liveUrl || project.githubUrl) && (
                <div>
                  <h3 className="text-xs font-semibold tracking-widest text-zinc-400 uppercase mb-4">Project Links</h3>
                  <div className="flex flex-col gap-y-3">
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between w-full rounded-xl border border-zinc-200 bg-white p-4 hover:border-zinc-300 hover:shadow-md transition-all duration-300"
                      >
                        <span className="font-medium text-sm">Visit Live Site</span>
                        <ExternalLink size={18} className="text-zinc-400 group-hover:text-black transition-colors" />
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between w-full rounded-xl border border-zinc-200 bg-zinc-50 p-4 hover:border-zinc-300 hover:shadow-md transition-all duration-300"
                      >
                        <span className="font-medium text-sm">Source Code</span>
                        <GitCommit size={18} className="text-zinc-400 group-hover:text-black transition-colors" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Tech Stack */}
              {project.techStacks.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold tracking-widest text-zinc-400 uppercase mb-4">Technologies</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.techStacks.map((tech) => (
                      <span
                        key={tech.id}
                        className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-600"
                      >
                        {tech.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Developers */}
              {project.developers.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold tracking-widest text-zinc-400 uppercase mb-4">Team</h3>
                  <div className="space-y-3">
                    {project.developers.map((dev) => (
                      <div key={dev.id} className="flex flex-col">
                        <span className="text-sm font-medium text-zinc-900">{dev.name}</span>
                        {dev.role && <span className="text-xs text-zinc-500">{dev.role}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
