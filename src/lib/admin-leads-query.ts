import { parseDateRangeFilter } from "@/lib/admin-filters";
import type { EstimatorLeadStatus, Prisma } from "@prisma/client";

export type EstimatorLeadsFilterParams = {
  status?: EstimatorLeadStatus | "all" | string;
  query?: string;
  dateFrom?: string;
  dateTo?: string;
};

const VALID_STATUSES: EstimatorLeadStatus[] = [
  "NEW",
  "CONTACTED",
  "CONVERTED",
  "CLOSED",
];

export function buildEstimatorLeadsWhereClause(
  params: EstimatorLeadsFilterParams = {},
): Prisma.EstimatorLeadWhereInput {
  const { status, query, dateFrom, dateTo } = params;
  const whereClause: Prisma.EstimatorLeadWhereInput = {};

  if (
    status &&
    status !== "all" &&
    VALID_STATUSES.includes(status as EstimatorLeadStatus)
  ) {
    whereClause.status = status as EstimatorLeadStatus;
  }

  const createdAtRange = parseDateRangeFilter(dateFrom, dateTo);
  if (createdAtRange) {
    whereClause.createdAt = createdAtRange;
  }

  if (query) {
    whereClause.OR = [
      { projectType: { contains: query, mode: "insensitive" } },
      { scope: { contains: query, mode: "insensitive" } },
      { budgetDisplay: { contains: query, mode: "insensitive" } },
    ];
  }

  return whereClause;
}
