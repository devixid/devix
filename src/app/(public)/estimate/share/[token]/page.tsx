import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { PROJECT_TYPE_DELIVERABLES } from "@/lib/estimator-deliverables";
import type { ProjectType } from "@/types/estimator";
import { format } from "date-fns";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Proposal — Devix",
  robots: { index: false, follow: false },
};

export const revalidate = 0;

interface PageProps {
  params: Promise<{
    token: string;
  }>;
}

function getCategoryKeywords(projectType: string): string[] {
  const type = projectType.toLowerCase();
  if (type.includes("company") || type.includes("profile") || type.includes("marketing") || type.includes("landing")) {
    return ["web", "marketing", "landing", "site"];
  }
  if (type.includes("web") || type.includes("site") || type.includes("webapp")) {
    return ["web", "webapp", "platform"];
  }
  if (type.includes("mobile") || type.includes("app") || type.includes("ios") || type.includes("android")) {
    return ["mobile", "app", "ios", "android"];
  }
  if (type.includes("commerce") || type.includes("store") || type.includes("shop")) {
    return ["commerce", "store", "shop", "ecommerce"];
  }
  return [type];
}

export default async function ShareEstimatePage({ params }: PageProps) {
  const { token } = await params;

  const lead = await prisma.estimatorLead.findUnique({
    where: { shareToken: token },
    include: { contactSubmission: true },
  });

  if (!lead) {
    notFound();
  }

  // Find dynamic project recommendations
  const keywords = getCategoryKeywords(lead.projectType);
  const relatedProjects = await prisma.project.findMany({
    where: {
      OR: keywords.map((keyword) => ({
        category: { contains: keyword, mode: "insensitive" },
      })),
      isVisible: true,
    },
    take: 3,
    orderBy: { isFeatured: "desc" },
  });

  // Fallback to featured/any visible projects if less than 3
  let recommendedProjects = [...relatedProjects];
  if (recommendedProjects.length < 3) {
    const featured = await prisma.project.findMany({
      where: {
        id: { notIn: recommendedProjects.map((p) => p.id) },
        isVisible: true,
      },
      take: 3 - recommendedProjects.length,
      orderBy: { isFeatured: "desc" },
    });
    recommendedProjects = [...recommendedProjects, ...featured];
  }

  // Resolve deliverables
  const deliverablesContent = PROJECT_TYPE_DELIVERABLES[lead.projectType as ProjectType];
  const excludedIds = (lead.excludedDeliverables as string[]) || [];

  const includedDeliverables = deliverablesContent
    ? deliverablesContent.includes.filter((item) => !excludedIds.includes(item.id))
    : [];

  const excludedDeliverables = deliverablesContent
    ? deliverablesContent.includes.filter((item) => excludedIds.includes(item.id))
    : [];

  return (
    <div className="grain-overlay min-h-screen bg-white pt-[120px] pb-32">
      <div className="mx-auto max-w-6xl px-6">
        {/* Eyebrow and Page Header */}
        <div className="mb-12">
          <span className="text-xs font-semibold tracking-[0.2em] text-[#a0783c] uppercase block mb-3">
            Interactive Proposal
          </span>
          <h1 className="font-display text-4xl font-light tracking-tight text-zinc-900 sm:text-5xl">
            Project Proposal for {lead.contactSubmission?.name || "Client"}
          </h1>
          <p className="mt-3 text-sm text-zinc-500">
            Estimated budget and scope created on {format(new Date(lead.createdAt), "MMMM d, yyyy")}
          </p>
        </div>

        {/* 2-Column Proposal Details */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Main Column: Scope & Deliverables */}
          <div className="space-y-8 lg:col-span-2">
            {/* Project Specifications */}
            <div className="border border-zinc-200 bg-zinc-50/50 p-8 rounded-none">
              <h2 className="text-sm font-semibold tracking-wider text-zinc-800 uppercase mb-4">
                Project Specifications
              </h2>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <span className="block text-xs text-zinc-400">Project Type</span>
                  <span className="font-medium text-zinc-800 capitalize">
                    {lead.projectType.replace(/_/g, " ")}
                  </span>
                </div>
                {lead.designApproach && (
                  <div>
                    <span className="block text-xs text-zinc-400">Design Approach</span>
                    <span className="font-medium text-zinc-800 capitalize">
                      {lead.designApproach}
                    </span>
                  </div>
                )}
                <div>
                  <span className="block text-xs text-zinc-400">Scope Level</span>
                  <span className="font-medium text-zinc-800 capitalize">
                    {lead.scope}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-zinc-400">Complexity</span>
                  <span className="font-medium text-zinc-800 capitalize">
                    {lead.complexity}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-zinc-400">Timeline</span>
                  <span className="font-medium text-zinc-800 capitalize">
                    {lead.timeline}
                  </span>
                </div>
              </div>
            </div>

            {/* Scope Deliverables List */}
            <div className="border border-zinc-200 p-8 rounded-none bg-white">
              <h2 className="text-sm font-semibold tracking-wider text-zinc-800 uppercase mb-6">
                Included Deliverables ({includedDeliverables.length})
              </h2>
              {includedDeliverables.length === 0 ? (
                <p className="text-zinc-500 text-sm">No deliverables included.</p>
              ) : (
                <ul className="space-y-4 text-sm text-zinc-600">
                  {includedDeliverables.map((item) => (
                    <li key={item.id} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#a0783c]/10 text-[#a0783c]">
                        ✓
                      </span>
                      <span>{item.label}</span>
                    </li>
                  ))}
                </ul>
              )}

              {excludedDeliverables.length > 0 && (
                <>
                  <hr className="my-8 border-zinc-200" />
                  <h2 className="text-sm font-semibold tracking-wider text-zinc-400 uppercase mb-6">
                    Excluded Deliverables ({excludedDeliverables.length})
                  </h2>
                  <ul className="space-y-4 text-sm text-zinc-400">
                    {excludedDeliverables.map((item) => (
                      <li key={item.id} className="flex items-start gap-3 line-through decoration-zinc-300">
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
                          ✕
                        </span>
                        <span>{item.label}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>

          {/* Right Sidebar: Cost Summary & Actions */}
          <div className="space-y-6">
            <div className="border border-zinc-200 bg-zinc-950 p-8 rounded-none text-white">
              <span className="text-xs font-semibold tracking-wider text-zinc-400 uppercase block mb-2">
                Estimated Cost
              </span>
              <p className="text-4xl font-light text-[#C8A96E] font-mono">
                {lead.budgetDisplay}
              </p>
              <span className="text-[10px] text-zinc-500 uppercase mt-1 block">
                Currency: {lead.currency}
              </span>

              {lead.deliverableSavingsUsd && lead.deliverableSavingsUsd.toNumber() > 0 && (
                <div className="mt-4 border-t border-zinc-800 pt-4">
                  <span className="text-xs text-zinc-400 block">Customization Savings</span>
                  <span className="text-sm font-semibold text-emerald-400 font-mono">
                    -${Number(lead.deliverableSavingsUsd).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })} USD
                  </span>
                </div>
              )}

              <div className="mt-8 space-y-3">
                <a
                  href={`mailto:hello@devix.com?subject=Kickoff%20Proposal%20-%20Lead%20${lead.id}`}
                  className="w-full inline-flex justify-center items-center bg-[#C8A96E] hover:bg-[#bfa065] text-black font-semibold text-xs tracking-widest uppercase py-3.5 transition-colors"
                >
                  Accept & Kickoff
                </a>
                <Link
                  href="/#contact"
                  className="w-full inline-flex justify-center items-center border border-zinc-700 hover:border-white text-zinc-300 hover:text-white font-semibold text-xs tracking-widest uppercase py-3.5 transition-colors"
                >
                  Request Consultation
                </Link>
              </div>
            </div>

            <div className="border border-zinc-200 p-6 rounded-none bg-zinc-50/30 text-xs text-zinc-500 leading-relaxed">
              <h3 className="font-semibold text-zinc-700 mb-2 uppercase">Disclaimer</h3>
              This proposal estimate is based on early-stage choices and does not constitute a legally binding contract. Full specifications and scopes will be codified in the final Statement of Work (SOW).
            </div>
          </div>
        </div>

        {/* Portfolio Recommendations */}
        <div className="mt-20 border-t border-zinc-200 pt-16">
          <div className="mb-10">
            <h2 className="font-display text-2xl font-light text-zinc-950 sm:text-3xl">
              Our Relevant Work
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Explore case studies that align with the technology and scope of your project.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recommendedProjects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.slug}`}
                className="group flex flex-col space-y-3"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-zinc-100 border border-zinc-200">
                  <Image
                    src={project.imageUrl}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div>
                  <span className="text-[10px] tracking-widest text-[#a0783c] uppercase font-semibold">
                    {project.category}
                  </span>
                  <h3 className="font-display text-base font-light text-zinc-950 mt-1 group-hover:text-[#a0783c] transition-colors">
                    {project.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
