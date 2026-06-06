import Link from "next/link";
import { getOverviewStats } from "@/actions/admin";
import { AnalyticsSection } from "@/components/admin/AnalyticsSection";

export const metadata = {
  title: "Dashboard Overview — Devix Operations",
};

export default async function AdminOverviewPage() {
  const stats = await getOverviewStats();

  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <span className="mb-3 block text-[11px] font-medium tracking-[0.25em] text-zinc-500 uppercase">
          Console
        </span>
        <h1 className="font-display text-3xl font-light tracking-wide text-zinc-100">
          Operations Overview
        </h1>
        <p className="mt-2 max-w-xl font-sans text-sm text-zinc-400">
          Real-time diagnostics and content management summaries for Devix.
        </p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 lg:gap-8">
        {/* Inbox Stats Card */}
        <div className="flex flex-col justify-between border border-zinc-800 bg-[#0F0F0F] p-8 transition-all duration-300 hover:border-zinc-700">
          <div>
            <div className="mb-6 flex items-center justify-between">
              <span className="text-[11px] font-medium tracking-wider text-zinc-500 uppercase">
                Inbox Submissions
              </span>
              {stats.unreadSubmissions > 0 && (
                <span className="bg-[#C8A96E]/10 px-2 py-1 text-[10px] font-medium tracking-wider text-[#C8A96E] uppercase">
                  {stats.unreadSubmissions} Unread
                </span>
              )}
            </div>
            <div className="mb-2 flex items-baseline gap-2">
              <span className="font-display text-4xl font-light text-zinc-100 md:text-5xl">
                {stats.totalSubmissions}
              </span>
              <span className="text-sm text-zinc-500">total inquiries</span>
            </div>
          </div>

          <div className="mt-8 border-t border-zinc-900 pt-6">
            <Link
              href="/admin/inbox"
              className="inline-flex items-center gap-2 text-xs font-medium tracking-wider text-[#C8A96E] uppercase transition-colors hover:text-[#B6965C]"
            >
              Manage Inbox <span className="text-sm">→</span>
            </Link>
          </div>
        </div>

        {/* Testimonials Stats Card */}
        <div className="flex flex-col justify-between border border-zinc-800 bg-[#0F0F0F] p-8 transition-all duration-300 hover:border-zinc-700">
          <div>
            <div className="mb-6 flex items-center justify-between">
              <span className="text-[11px] font-medium tracking-wider text-zinc-500 uppercase">
                Testimonials
              </span>
              <span className="text-[10px] font-medium tracking-wider text-zinc-500 uppercase">
                {stats.visibleTestimonials} Visible
              </span>
            </div>
            <div className="mb-2 flex items-baseline gap-2">
              <span className="font-display text-4xl font-light text-zinc-100 md:text-5xl">
                {stats.totalTestimonials}
              </span>
              <span className="text-sm text-zinc-500">total testimonials</span>
            </div>
          </div>

          <div className="mt-8 border-t border-zinc-900 pt-6">
            <Link
              href="/admin/testimonials"
              className="inline-flex items-center gap-2 text-xs font-medium tracking-wider text-[#C8A96E] uppercase transition-colors hover:text-[#B6965C]"
            >
              Manage Testimonials <span className="text-sm">→</span>
            </Link>
          </div>
        </div>

        {/* Projects Stats Card */}
        <div className="flex flex-col justify-between border border-zinc-800 bg-[#0F0F0F] p-8 transition-all duration-300 hover:border-zinc-700">
          <div>
            <div className="mb-6 flex items-center justify-between">
              <span className="text-[11px] font-medium tracking-wider text-zinc-500 uppercase">
                Portfolio Projects
              </span>
              <span className="text-[10px] font-medium tracking-wider text-zinc-500 uppercase">
                {stats.featuredProjects} Featured
              </span>
            </div>
            <div className="mb-2 flex items-baseline gap-2">
              <span className="font-display text-4xl font-light text-zinc-100 md:text-5xl">
                {stats.totalProjects}
              </span>
              <span className="text-sm text-zinc-500">total projects</span>
            </div>
            <p className="text-xs text-zinc-500">
              {stats.visibleProjects} visible on public site
            </p>
          </div>

          <div className="mt-8 border-t border-zinc-900 pt-6">
            <Link
              href="/admin/projects"
              className="inline-flex items-center gap-2 text-xs font-medium tracking-wider text-[#C8A96E] uppercase transition-colors hover:text-[#B6965C]"
            >
              Manage Projects <span className="text-sm">→</span>
            </Link>
          </div>
        </div>

        {/* Estimator Leads Card */}
        <div className="flex flex-col justify-between border border-zinc-800 bg-[#0F0F0F] p-8 transition-all duration-300 hover:border-zinc-700">
          <div>
            <div className="mb-6 flex items-center justify-between">
              <span className="text-[11px] font-medium tracking-wider text-zinc-500 uppercase">
                Estimator Leads
              </span>
              {stats.newEstimatorLeads > 0 && (
                <span className="bg-[#C8A96E]/10 px-2 py-1 text-[10px] font-medium tracking-wider text-[#C8A96E] uppercase">
                  {stats.newEstimatorLeads} New
                </span>
              )}
            </div>
            <div className="mb-2 flex items-baseline gap-2">
              <span className="font-display text-4xl font-light text-zinc-100 md:text-5xl">
                {stats.totalEstimatorLeads}
              </span>
              <span className="text-sm text-zinc-500">total leads</span>
            </div>
          </div>
          <div className="mt-8 border-t border-zinc-900 pt-6">
            <Link
              href="/admin/leads"
              className="inline-flex items-center gap-2 text-xs font-medium tracking-wider text-[#C8A96E] uppercase transition-colors hover:text-[#B6965C]"
            >
              View Leads <span className="text-sm">→</span>
            </Link>
          </div>
        </div>
      </div>

      <AnalyticsSection />

      {/* Database Diagnostic Details */}
      <div className="border border-zinc-800 bg-[#0F0F0F] p-8">
        <span className="mb-6 block text-[11px] font-medium tracking-wider text-zinc-500 uppercase">
          System Infrastructure
        </span>
        <div className="grid grid-cols-2 gap-6 text-left md:grid-cols-4">
          <div>
            <span className="mb-1 block text-[10px] tracking-wider text-zinc-600 uppercase">
              Database Core
            </span>
            <span className="text-xs font-medium text-zinc-300">
              PostgreSQL (Supabase)
            </span>
          </div>
          <div>
            <span className="mb-1 block text-[10px] tracking-wider text-zinc-600 uppercase">
              ORM Engine
            </span>
            <span className="text-xs font-medium text-zinc-300">
              Prisma Client v7
            </span>
          </div>
          <div>
            <span className="mb-1 block text-[10px] tracking-wider text-zinc-600 uppercase">
              Auth Mechanism
            </span>
            <span className="text-xs font-medium text-zinc-300">
              JWE session cookie (8h)
            </span>
          </div>
          <div>
            <span className="mb-1 block text-[10px] tracking-wider text-zinc-600 uppercase">
              Caching Layer
            </span>
            <span className="text-xs font-medium text-zinc-300">
              Upstash Redis (5m TTL)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
