import Link from "next/link";
import { getOverviewStats } from "@/actions/admin";

export const metadata = {
  title: "Dashboard Overview — Devix Operations",
};

export default async function AdminOverviewPage() {
  const stats = await getOverviewStats();

  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <span className="text-[11px] font-medium tracking-[0.25em] uppercase text-zinc-500 block mb-3">
          Console
        </span>
        <h1 className="font-display text-3xl font-light tracking-wide text-zinc-100">
          Operations Overview
        </h1>
        <p className="font-sans text-sm text-zinc-400 mt-2 max-w-xl">
          Real-time diagnostics and content management summaries for Devix.
        </p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        
        {/* Inbox Stats Card */}
        <div className="border border-zinc-800 bg-[#0F0F0F] p-8 flex flex-col justify-between transition-all duration-300 hover:border-zinc-700">
          <div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-[11px] font-medium tracking-wider uppercase text-zinc-500">
                Inbox Submissions
              </span>
              {stats.unreadSubmissions > 0 && (
                <span className="bg-[#C8A96E]/10 text-[#C8A96E] text-[10px] uppercase tracking-wider font-medium px-2 py-1">
                  {stats.unreadSubmissions} Unread
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl md:text-5xl font-display font-light text-zinc-100">
                {stats.totalSubmissions}
              </span>
              <span className="text-zinc-500 text-sm">total inquiries</span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-900">
            <Link
              href="/admin/inbox"
              className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#C8A96E] hover:text-[#B6965C] transition-colors"
            >
              Manage Inbox <span className="text-sm">→</span>
            </Link>
          </div>
        </div>

        {/* Testimonials Stats Card */}
        <div className="border border-zinc-800 bg-[#0F0F0F] p-8 flex flex-col justify-between transition-all duration-300 hover:border-zinc-700">
          <div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-[11px] font-medium tracking-wider uppercase text-zinc-500">
                Testimonials
              </span>
              <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-medium">
                {stats.visibleTestimonials} Visible
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl md:text-5xl font-display font-light text-zinc-100">
                {stats.totalTestimonials}
              </span>
              <span className="text-zinc-500 text-sm">total testimonials</span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-900">
            <Link
              href="/admin/testimonials"
              className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#C8A96E] hover:text-[#B6965C] transition-colors"
            >
              Manage Testimonials <span className="text-sm">→</span>
            </Link>
          </div>
        </div>

      </div>

      {/* Database Diagnostic Details */}
      <div className="border border-zinc-800 bg-[#0F0F0F] p-8">
        <span className="text-[11px] font-medium tracking-wider uppercase text-zinc-500 block mb-6">
          System Infrastructure
        </span>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-zinc-600 block mb-1">
              Database Core
            </span>
            <span className="text-xs font-medium text-zinc-300">
              PostgreSQL (Supabase)
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-zinc-600 block mb-1">
              ORM Engine
            </span>
            <span className="text-xs font-medium text-zinc-300">
              Prisma Client v7
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-zinc-600 block mb-1">
              Auth Mechanism
            </span>
            <span className="text-xs font-medium text-zinc-300">
              Supabase SSR cookies
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-zinc-600 block mb-1">
              Caching Layer
            </span>
            <span className="text-xs font-medium text-zinc-300">
              Cookie claims (1h maxAge)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
