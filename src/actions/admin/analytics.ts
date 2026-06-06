"use server";

import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth";
import { cachedQuery } from "@/lib/redis";

export type AnalyticsDays = 7 | 30 | 90;

export async function getAnalyticsSummary(days: AnalyticsDays = 30) {
  await verifyAdminSession();

  return cachedQuery(
    `analytics:summary:${days}`,
    async () => {
      const since = new Date();
      since.setDate(since.getDate() - days);

      const [
        inquiriesByDay,
        leadsByDay,
        sourceBreakdown,
        leadStatusBreakdown,
        totalLeads,
        convertedLeads,
      ] = await Promise.all([
        prisma.$queryRaw<{ day: Date; count: bigint }[]>`
          SELECT DATE_TRUNC('day', "createdAt") as day, COUNT(*)::bigint as count
          FROM contact_submissions
          WHERE "createdAt" >= ${since}
          GROUP BY day ORDER BY day ASC
        `,
        prisma.$queryRaw<{ day: Date; count: bigint }[]>`
          SELECT DATE_TRUNC('day', "createdAt") as day, COUNT(*)::bigint as count
          FROM estimator_leads
          WHERE "createdAt" >= ${since}
          GROUP BY day ORDER BY day ASC
        `,
        prisma.contactSubmission.groupBy({
          by: ["source"],
          where: { createdAt: { gte: since } },
          _count: true,
        }),
        prisma.estimatorLead.groupBy({
          by: ["status"],
          where: { createdAt: { gte: since } },
          _count: true,
        }),
        prisma.estimatorLead.count({ where: { createdAt: { gte: since } } }),
        prisma.estimatorLead.count({
          where: {
            createdAt: { gte: since },
            status: "CONVERTED",
          },
        }),
      ]);

      return {
        days,
        inquiriesByDay: inquiriesByDay.map((r) => ({
          day: r.day.toISOString().slice(0, 10),
          count: Number(r.count),
        })),
        leadsByDay: leadsByDay.map((r) => ({
          day: r.day.toISOString().slice(0, 10),
          count: Number(r.count),
        })),
        sourceBreakdown: sourceBreakdown.map((r) => ({
          source: r.source,
          count: r._count,
        })),
        leadStatusBreakdown: leadStatusBreakdown.map((r) => ({
          status: r.status,
          count: r._count,
        })),
        conversionRate:
          totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0,
        totalLeads,
        convertedLeads,
      };
    },
    300,
  );
}
