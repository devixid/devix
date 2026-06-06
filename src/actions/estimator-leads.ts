"use server";

import { prisma } from "@/lib/prisma";
import { verifyAdminSession, verifyCsrfOrigin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { buildEstimatorLeadsWhereClause } from "@/lib/admin-leads-query";
import type { EstimatorLeadStatus } from "@prisma/client";
import type { CurrencyCode, EstimatorState } from "@/types/estimator";
import { calculateEstimateUsd, supportsTemplateDesign } from "@/types/estimator";
import {
  calculateDeliverableSavings,
  resolveExcludedDeliverables,
  validateExcludedDeliverables,
} from "@/lib/estimator-deliverables";
import { sendEstimatorLeadNotification } from "@/lib/email";

export type SaveEstimatorLeadResult =
  | { ok: true; id: string; created?: boolean }
  | { ok: false; error: string };

function validateEstimatorLeadInput(state: EstimatorState) {
  if (!state.type || !state.scope || !state.complexity || !state.timeline) {
    return {
      ok: false as const,
      error:
        "Your estimate looks incomplete. Go back and complete all steps.",
    };
  }

  if (supportsTemplateDesign(state.type) && !state.designApproach) {
    return {
      ok: false as const,
      error:
        "Your estimate looks incomplete. Go back and complete all steps.",
    };
  }

  const validation = validateExcludedDeliverables(
    state.type,
    state.excludedDeliverableIds,
    state.designApproach,
  );
  if (!validation.valid) {
    return {
      ok: false as const,
      error: validation.error ?? "Invalid deliverable customization.",
    };
  }

  return { ok: true as const };
}

function buildLeadRecord(
  state: EstimatorState,
  currency: CurrencyCode,
  budgetDisplay: string,
) {
  const budgetUsd = calculateEstimateUsd(state);
  const deliverableSavingsUsd = calculateDeliverableSavings(state);
  const excludedDeliverables = resolveExcludedDeliverables(
    state.excludedDeliverableIds,
  );

  return {
    projectType: state.type!,
    designApproach: state.designApproach,
    platform: state.platform,
    scope: state.scope!,
    complexity: state.complexity!,
    timeline: state.timeline!,
    budgetUsd,
    budgetDisplay,
    excludedDeliverables,
    deliverableSavingsUsd:
      deliverableSavingsUsd > 0 ? deliverableSavingsUsd : null,
    currency,
  };
}

export async function upsertEstimatorLead(data: {
  leadId?: string | null;
  state: EstimatorState;
  currency: CurrencyCode;
  budgetDisplay: string;
}): Promise<SaveEstimatorLeadResult> {
  const { leadId, state, currency, budgetDisplay } = data;

  try {
    const validation = validateEstimatorLeadInput(state);
    if (!validation.ok) {
      return { ok: false, error: validation.error };
    }

    const record = buildLeadRecord(state, currency, budgetDisplay);

    if (leadId) {
      const existing = await prisma.estimatorLead.findUnique({
        where: { id: leadId },
        include: { contactSubmission: true },
      });

      if (
        existing &&
        existing.status === "NEW" &&
        !existing.contactSubmission
      ) {
        await prisma.estimatorLead.update({
          where: { id: leadId },
          data: record,
        });
        revalidatePath("/admin/leads");
        return { ok: true, id: leadId, created: false };
      }
    }

    const lead = await prisma.estimatorLead.create({
      data: {
        ...record,
        status: "NEW",
      },
    });

    try {
      await sendEstimatorLeadNotification({
        leadId: lead.id,
        projectType: record.projectType,
        designApproach: record.designApproach,
        platform: record.platform,
        scope: record.scope,
        complexity: record.complexity,
        timeline: record.timeline,
        budgetDisplay: record.budgetDisplay,
        currency: record.currency,
        excludedDeliverables: record.excludedDeliverables,
      });
    } catch (emailErr) {
      console.error("Estimator lead notification email failed:", emailErr);
    }

    revalidatePath("/admin/leads");
    return { ok: true, id: lead.id, created: true };
  } catch (err) {
    console.error("Failed to save estimator lead:", err);
    return {
      ok: false,
      error:
        "We couldn't save your estimate. Check your connection and try again.",
    };
  }
}

export async function saveEstimatorLead(data: {
  state: EstimatorState;
  currency: CurrencyCode;
  budgetDisplay: string;
}): Promise<SaveEstimatorLeadResult> {
  return upsertEstimatorLead(data);
}

export async function getEstimatorLeads(params: {
  status?: EstimatorLeadStatus | "all" | string;
  query?: string;
  dateFrom?: string;
  dateTo?: string;
} = {}) {
  await verifyAdminSession();

  return prisma.estimatorLead.findMany({
    where: buildEstimatorLeadsWhereClause(params),
    include: { contactSubmission: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getEstimatorLeadById(id: string) {
  await verifyAdminSession();
  return prisma.estimatorLead.findUnique({
    where: { id },
    include: { contactSubmission: true },
  });
}

export async function updateEstimatorLeadStatus(
  id: string,
  status: EstimatorLeadStatus,
) {
  await verifyAdminSession();
  await verifyCsrfOrigin();

  const updated = await prisma.estimatorLead.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${id}`);
  return updated;
}
