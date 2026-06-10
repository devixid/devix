import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth";
import { buildEstimatorLeadsWhereClause } from "@/lib/admin-leads-query";
import { toCsvContent } from "@/lib/csv";

const CSV_HEADERS = [
  "id",
  "status",
  "createdAt",
  "projectType",
  "designApproach",
  "platform",
  "scope",
  "complexity",
  "timeline",
  "budgetDisplay",
  "budgetUsd",
  "currency",
  "deliverableSavingsUsd",
  "excludedDeliverables",
  "contactName",
  "contactEmail",
  "convertedAt",
] as const;

export async function GET(request: NextRequest) {
  try {
    await verifyAdminSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const where = buildEstimatorLeadsWhereClause({
    status: searchParams.get("status") ?? undefined,
    query: searchParams.get("query") ?? undefined,
    dateFrom: searchParams.get("dateFrom") ?? undefined,
    dateTo: searchParams.get("dateTo") ?? undefined,
  });

  const leads = await prisma.estimatorLead.findMany({
    where,
    include: { contactSubmission: true },
    orderBy: { createdAt: "desc" },
  });

  const rows = leads.map((lead) => [
    lead.id,
    lead.status,
    lead.createdAt.toISOString(),
    lead.projectType,
    lead.designApproach ?? "",
    lead.platform ?? "",
    lead.scope,
    lead.complexity,
    lead.timeline,
    lead.budgetDisplay,
    lead.budgetUsd.toString(),
    lead.currency,
    lead.deliverableSavingsUsd?.toString() ?? "",
    lead.excludedDeliverables ? JSON.stringify(lead.excludedDeliverables) : "",
    lead.contactSubmission?.name ?? "",
    lead.contactSubmission?.email ?? "",
    lead.contactSubmission?.createdAt?.toISOString() ?? "",
  ]);

  const csv = toCsvContent([...CSV_HEADERS], rows);
  const dateStamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="devix-estimator-leads-${dateStamp}.csv"`,
    },
  });
}
