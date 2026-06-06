"use server";

import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth";
import { parseDateRangeFilter } from "@/lib/admin-filters";
import type { Prisma } from "@prisma/client";

const PAGE_SIZE = 30;

export async function getActivityLogs(params: {
  page?: number;
  entityType?: string;
  dateFrom?: string;
  dateTo?: string;
} = {}) {
  await verifyAdminSession();

  const page = Math.max(1, params.page ?? 1);
  const where: Prisma.ActivityLogWhereInput = {};

  if (params.entityType && params.entityType !== "all") {
    where.entityType = params.entityType;
  }

  const createdAtRange = parseDateRangeFilter(params.dateFrom, params.dateTo);
  if (createdAtRange) {
    where.createdAt = createdAtRange;
  }

  const [items, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.activityLog.count({ where }),
  ]);

  return { items, total, page, pageSize: PAGE_SIZE };
}
