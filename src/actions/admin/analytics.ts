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

      // 6 months ago boundary for MoM stats
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
      sixMonthsAgo.setDate(1);
      sixMonthsAgo.setHours(0, 0, 0, 0);

      const [
        inquiriesByDay,
        leadsByDay,
        sourceBreakdown,
        leadStatusBreakdown,
        totalLeads,
        convertedLeads,
        totalRevenueResult,
        budgetStats,
        purchasesMoM,
        leadsMoM,
        projectTypeStats,
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
        // Revenue aggregation (ignores disputes/refunds/revocations)
        prisma.purchase.aggregate({
          _sum: {
            amountMinor: true,
          },
          where: {
            revokedAt: null,
          },
        }),
        // Average estimator project budget
        prisma.estimatorLead.aggregate({
          _avg: {
            budgetUsd: true,
          },
        }),
        // MoM Store Purchases (last 6 months)
        prisma.purchase.findMany({
          where: {
            createdAt: { gte: sixMonthsAgo },
            revokedAt: null,
          },
          select: {
            createdAt: true,
            amountMinor: true,
          },
        }),
        // MoM Estimator Leads (last 6 months)
        prisma.estimatorLead.findMany({
          where: {
            createdAt: { gte: sixMonthsAgo },
          },
          select: {
            createdAt: true,
          },
        }),
        // Project type segment stats
        prisma.estimatorLead.groupBy({
          by: ["projectType"],
          _count: true,
        }),
      ]);

      // Build MoM chart list for the last 6 months
      const monthlyData: Record<string, { month: string; revenue: number; leads: number }> = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const label = d.toLocaleString("default", { month: "short" });
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        monthlyData[key] = { month: label, revenue: 0, leads: 0 };
      }

      purchasesMoM.forEach((p) => {
        const key = p.createdAt.toISOString().slice(0, 7); // "YYYY-MM"
        if (monthlyData[key]) {
          monthlyData[key].revenue += Number(p.amountMinor || 0) / 100;
        }
      });

      leadsMoM.forEach((l) => {
        const key = l.createdAt.toISOString().slice(0, 7); // "YYYY-MM"
        if (monthlyData[key]) {
          monthlyData[key].leads += 1;
        }
      });

      const monthlyTrend = Object.values(monthlyData);

      const totalRevenueMinor = totalRevenueResult._sum.amountMinor
        ? Number(totalRevenueResult._sum.amountMinor)
        : 0;
      const totalRevenue = totalRevenueMinor / 100;

      const averageBudget = budgetStats._avg.budgetUsd
        ? Number(budgetStats._avg.budgetUsd)
        : 0;

      const projectTypeBreakdown = projectTypeStats.map((r) => ({
        type: r.projectType,
        count: r._count,
      }));

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
        totalRevenue,
        averageBudget,
        monthlyTrend,
        projectTypeBreakdown,
      };
    },
    300,
  );
}
