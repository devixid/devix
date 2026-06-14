"use server";

import { Decimal } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession, verifyCsrfOrigin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { buildEstimatorLeadsWhereClause } from "@/lib/admin-leads-query";
import type { EstimatorLeadStatus } from "@prisma/client";
import type { CurrencyCode, EstimatorState } from "@/types/estimator";
import {
  calculateEstimateUsd,
  supportsTemplateDesign,
} from "@/types/estimator";
import {
  calculateDeliverableSavings,
  resolveExcludedDeliverables,
  validateExcludedDeliverables,
} from "@/lib/estimator-deliverables";
import { sendEstimatorLeadNotification, sendClientEstimateEmail } from "@/lib/email";
import { buildEstimatorSummaryLines } from "@/lib/estimator-summary";
import { z } from "zod";

export type SaveEstimatorLeadResult =
  | { ok: true; id: string; created?: boolean }
  | { ok: false; error: string };

function validateEstimatorLeadInput(state: EstimatorState) {
  if (!state.type || !state.scope || !state.complexity || !state.timeline) {
    return {
      ok: false as const,
      error: "Your estimate looks incomplete. Go back and complete all steps.",
    };
  }

  if (supportsTemplateDesign(state.type) && !state.designApproach) {
    return {
      ok: false as const,
      error: "Your estimate looks incomplete. Go back and complete all steps.",
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
    budgetUsd: new Decimal(budgetUsd),
    budgetDisplay,
    excludedDeliverables,
    deliverableSavingsUsd:
      deliverableSavingsUsd > 0
        ? new Decimal(deliverableSavingsUsd)
        : null,
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

export async function getEstimatorLeads(
  params: {
    status?: EstimatorLeadStatus | "all" | string;
    query?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {},
) {
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

export async function emailEstimateToClientAction(data: {
  leadId?: string | null;
  name: string;
  email: string;
  state: EstimatorState;
  budgetDisplay: string;
  currency: CurrencyCode;
  excludedLabels: string[];
  pdfBase64?: string;
}) {
  // 1. Validate name and email
  const parsed = z
    .object({
      name: z.string().min(2, "Name must be at least 2 characters."),
      email: z.string().email("Please enter a valid email address."),
    })
    .safeParse({ name: data.name, email: data.email });

  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0].message };
  }

  // 2. Validate estimator lead inputs
  const validation = validateEstimatorLeadInput(data.state);
  if (!validation.ok) {
    return { ok: false as const, error: validation.error };
  }

  try {
    const record = buildLeadRecord(data.state, data.currency, data.budgetDisplay);
    let finalLeadId = data.leadId || null;

    // 3. Save / Update lead in database and link to a ContactSubmission
    if (finalLeadId) {
      const existing = await prisma.estimatorLead.findUnique({
        where: { id: finalLeadId },
        include: { contactSubmission: true },
      });

      if (existing) {
        await prisma.estimatorLead.update({
          where: { id: finalLeadId },
          data: record,
        });

        if (!existing.contactSubmission) {
          await prisma.contactSubmission.create({
            data: {
              name: data.name.trim(),
              email: data.email.trim().toLowerCase(),
              message: "Estimated budget summary sent to client.",
              source: "estimator",
              estimatorLeadId: finalLeadId,
            },
          });
        } else {
          await prisma.contactSubmission.update({
            where: { id: existing.contactSubmission.id },
            data: {
              name: data.name.trim(),
              email: data.email.trim().toLowerCase(),
            },
          });
        }
      } else {
        const lead = await prisma.estimatorLead.create({
          data: { ...record, status: "NEW" },
        });
        finalLeadId = lead.id;
        await prisma.contactSubmission.create({
          data: {
            name: data.name.trim(),
            email: data.email.trim().toLowerCase(),
            message: "Estimated budget summary sent to client.",
            source: "estimator",
            estimatorLeadId: finalLeadId,
          },
        });
      }
    } else {
      const lead = await prisma.estimatorLead.create({
        data: { ...record, status: "NEW" },
      });
      finalLeadId = lead.id;
      await prisma.contactSubmission.create({
        data: {
          name: data.name.trim(),
          email: data.email.trim().toLowerCase(),
          message: "Estimated budget summary sent to client.",
          source: "estimator",
          estimatorLeadId: finalLeadId,
        },
      });
    }

    // 4. Generate client email payload and trigger send
    const summary = buildEstimatorSummaryLines({
      state: data.state,
      budgetDisplay: data.budgetDisplay,
      currency: data.currency,
      excludedLabels: data.excludedLabels,
    });

    await sendClientEstimateEmail({
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      summary,
      pdfBase64: data.pdfBase64,
    });

    revalidatePath("/admin/leads");
    revalidatePath("/admin/inbox");

    return { ok: true as const, leadId: finalLeadId };
  } catch (err) {
    console.error("Failed to email estimate to client:", err);
    return {
      ok: false as const,
      error: "We could not send your estimate. Please check your connection and try again.",
    };
  }
}
