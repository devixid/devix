"use server";

import { prisma } from "@/lib/prisma";
import { verifyAdminSession, verifyCsrfOrigin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { invalidateContentCache } from "@/lib/queries/site-content";
import { logActivity } from "@/lib/activity-log";
import {
  FaqItemSchema,
  ServiceItemSchema,
  TeamMemberSchema,
  validateSiteSectionContent,
} from "@/lib/schemas/site-content";
import type { Prisma, SiteSectionKey } from "@prisma/client";

async function afterContentMutation(entityType: string, action: string, entityId?: string) {
  await invalidateContentCache();
  revalidatePath("/");
  revalidatePath("/admin/content");
  await logActivity({ action, entityType, entityId });
}

// FAQ
export async function getAdminFaqItems() {
  await verifyAdminSession();
  return prisma.faqItem.findMany({ orderBy: { order: "asc" } });
}

export async function createFaqItem(data: unknown) {
  await verifyAdminSession();
  await verifyCsrfOrigin();
  const parsed = FaqItemSchema.parse(data);
  const maxOrder = await prisma.faqItem.aggregate({ _max: { order: true } });
  const created = await prisma.faqItem.create({
    data: {
      question: parsed.question.trim(),
      answer: parsed.answer.trim(),
      order: parsed.order ?? (maxOrder._max.order ?? -1) + 1,
      isVisible: parsed.isVisible ?? true,
    },
  });
  await afterContentMutation("FaqItem", "faq.created", created.id);
  return created;
}

export async function updateFaqItem(id: string, data: unknown) {
  await verifyAdminSession();
  await verifyCsrfOrigin();
  const parsed = FaqItemSchema.parse(data);
  const updated = await prisma.faqItem.update({
    where: { id },
    data: {
      question: parsed.question.trim(),
      answer: parsed.answer.trim(),
      order: parsed.order,
      isVisible: parsed.isVisible,
    },
  });
  await afterContentMutation("FaqItem", "faq.updated", id);
  return updated;
}

export async function deleteFaqItem(id: string) {
  await verifyAdminSession();
  await verifyCsrfOrigin();
  await prisma.faqItem.delete({ where: { id } });
  await afterContentMutation("FaqItem", "faq.deleted", id);
}

export async function reorderFaqItems(orderedIds: string[]) {
  await verifyAdminSession();
  await verifyCsrfOrigin();
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.faqItem.update({ where: { id }, data: { order: index } }),
    ),
  );
  await afterContentMutation("FaqItem", "faq.reordered");
}

// Services
export async function getAdminServiceItems() {
  await verifyAdminSession();
  return prisma.serviceItem.findMany({ orderBy: { order: "asc" } });
}

export async function createServiceItem(data: unknown) {
  await verifyAdminSession();
  await verifyCsrfOrigin();
  const parsed = ServiceItemSchema.parse(data);
  const maxOrder = await prisma.serviceItem.aggregate({ _max: { order: true } });
  const created = await prisma.serviceItem.create({
    data: {
      title: parsed.title.trim(),
      description: parsed.description.trim(),
      order: parsed.order ?? (maxOrder._max.order ?? -1) + 1,
      isVisible: parsed.isVisible ?? true,
    },
  });
  await afterContentMutation("ServiceItem", "service.created", created.id);
  return created;
}

export async function updateServiceItem(id: string, data: unknown) {
  await verifyAdminSession();
  await verifyCsrfOrigin();
  const parsed = ServiceItemSchema.parse(data);
  const updated = await prisma.serviceItem.update({
    where: { id },
    data: {
      title: parsed.title.trim(),
      description: parsed.description.trim(),
      order: parsed.order,
      isVisible: parsed.isVisible,
    },
  });
  await afterContentMutation("ServiceItem", "service.updated", id);
  return updated;
}

export async function deleteServiceItem(id: string) {
  await verifyAdminSession();
  await verifyCsrfOrigin();
  await prisma.serviceItem.delete({ where: { id } });
  await afterContentMutation("ServiceItem", "service.deleted", id);
}

export async function reorderServiceItems(orderedIds: string[]) {
  await verifyAdminSession();
  await verifyCsrfOrigin();
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.serviceItem.update({ where: { id }, data: { order: index } }),
    ),
  );
  await afterContentMutation("ServiceItem", "service.reordered");
}

// Team
export async function getAdminTeamMembers() {
  await verifyAdminSession();
  return prisma.teamMember.findMany({ orderBy: { order: "asc" } });
}

export async function createTeamMember(data: unknown) {
  await verifyAdminSession();
  await verifyCsrfOrigin();
  const parsed = TeamMemberSchema.parse(data);
  const maxOrder = await prisma.teamMember.aggregate({ _max: { order: true } });
  const created = await prisma.teamMember.create({
    data: {
      name: parsed.name.trim(),
      title: parsed.title.trim(),
      description: parsed.description.trim(),
      imageUrl: parsed.imageUrl.trim(),
      socialLinks: parsed.socialLinks ?? {},
      order: parsed.order ?? (maxOrder._max.order ?? -1) + 1,
      isVisible: parsed.isVisible ?? true,
    },
  });
  await afterContentMutation("TeamMember", "team.created", created.id);
  return created;
}

export async function updateTeamMember(id: string, data: unknown) {
  await verifyAdminSession();
  await verifyCsrfOrigin();
  const parsed = TeamMemberSchema.parse(data);
  const updated = await prisma.teamMember.update({
    where: { id },
    data: {
      name: parsed.name.trim(),
      title: parsed.title.trim(),
      description: parsed.description.trim(),
      imageUrl: parsed.imageUrl.trim(),
      socialLinks: parsed.socialLinks ?? {},
      order: parsed.order,
      isVisible: parsed.isVisible,
    },
  });
  await afterContentMutation("TeamMember", "team.updated", id);
  return updated;
}

export async function deleteTeamMember(id: string) {
  await verifyAdminSession();
  await verifyCsrfOrigin();
  await prisma.teamMember.delete({ where: { id } });
  await afterContentMutation("TeamMember", "team.deleted", id);
}

export async function reorderTeamMembers(orderedIds: string[]) {
  await verifyAdminSession();
  await verifyCsrfOrigin();
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.teamMember.update({ where: { id }, data: { order: index } }),
    ),
  );
  await afterContentMutation("TeamMember", "team.reordered");
}

// Site sections
export async function getAdminSiteSections() {
  await verifyAdminSession();
  return prisma.siteSection.findMany({ orderBy: { key: "asc" } });
}

export async function updateSiteSection(key: SiteSectionKey, content: unknown) {
  await verifyAdminSession();
  await verifyCsrfOrigin();
  const validated = validateSiteSectionContent(key, content);
  const jsonContent = validated as Prisma.InputJsonValue;
  const updated = await prisma.siteSection.upsert({
    where: { key },
    create: { key, content: jsonContent },
    update: { content: jsonContent },
  });
  await afterContentMutation("SiteSection", `section.${key.toLowerCase()}.updated`, updated.id);
  return updated;
}
