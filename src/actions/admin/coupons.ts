"use server";

import { prisma } from "@/lib/prisma";
import { verifyAdminSession, verifyCsrfOrigin } from "@/lib/auth";
import { logActivity } from "@/lib/activity-log";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Decimal } from "@prisma/client/runtime/client";

const CouponSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .toUpperCase()
    .trim()
    .regex(/^[A-Z0-9_-]+$/, "Code must contain only uppercase alphanumeric characters, underscores, or hyphens"),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().positive("Discount value must be positive"),
  active: z.boolean().default(true),
  maxUses: z.number().int().positive().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
});

export async function getCoupons() {
  await verifyAdminSession();
  return prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createCoupon(formData: FormData) {
  await verifyAdminSession();
  await verifyCsrfOrigin();

  const rawExpiresAt = formData.get("expiresAt");

  const validated = CouponSchema.safeParse({
    code: formData.get("code"),
    discountType: formData.get("discountType"),
    discountValue: Number(formData.get("discountValue")),
    active: formData.get("active") === "true",
    maxUses: formData.get("maxUses") ? Number(formData.get("maxUses")) : null,
    expiresAt: typeof rawExpiresAt === "string" && rawExpiresAt.trim() ? rawExpiresAt : null,
  });

  if (!validated.success) {
    throw new Error(validated.error.issues[0].message);
  }

  const { code, discountType, discountValue, active, maxUses, expiresAt } = validated.data;

  // Check if coupon exists
  const existing = await prisma.coupon.findUnique({ where: { code } });
  if (existing) {
    throw new Error("Coupon code already exists.");
  }

  const coupon = await prisma.coupon.create({
    data: {
      code,
      discountType,
      discountValue: new Decimal(discountValue),
      active,
      maxUses: maxUses ?? null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });

  await logActivity({
    action: "coupon.created",
    entityType: "Coupon",
    entityId: code,
  });

  revalidatePath("/admin/coupons");
  return { success: true, coupon };
}

export async function updateCoupon(code: string, formData: FormData) {
  await verifyAdminSession();
  await verifyCsrfOrigin();

  const rawExpiresAt = formData.get("expiresAt");

  const validated = CouponSchema.omit({ code: true }).safeParse({
    discountType: formData.get("discountType"),
    discountValue: Number(formData.get("discountValue")),
    active: formData.get("active") === "true",
    maxUses: formData.get("maxUses") ? Number(formData.get("maxUses")) : null,
    expiresAt: typeof rawExpiresAt === "string" && rawExpiresAt.trim() ? rawExpiresAt : null,
  });

  if (!validated.success) {
    throw new Error(validated.error.issues[0].message);
  }

  const { discountType, discountValue, active, maxUses, expiresAt } = validated.data;

  const existing = await prisma.coupon.findUnique({ where: { code } });
  if (!existing) {
    throw new Error("Coupon not found.");
  }

  const coupon = await prisma.coupon.update({
    where: { code },
    data: {
      discountType,
      discountValue: new Decimal(discountValue),
      active,
      maxUses: maxUses ?? null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });

  await logActivity({
    action: "coupon.updated",
    entityType: "Coupon",
    entityId: code,
  });

  revalidatePath("/admin/coupons");
  return { success: true, coupon };
}

export async function deleteCoupon(code: string) {
  await verifyAdminSession();
  await verifyCsrfOrigin();

  const existing = await prisma.coupon.findUnique({ where: { code } });
  if (!existing) {
    throw new Error("Coupon not found.");
  }

  // Set couponCode to null on all associated purchases to prevent Prisma foreign key errors
  await prisma.purchase.updateMany({
    where: { couponCode: code },
    data: { couponCode: null },
  });

  await prisma.coupon.delete({
    where: { code },
  });

  await logActivity({
    action: "coupon.deleted",
    entityType: "Coupon",
    entityId: code,
  });

  revalidatePath("/admin/coupons");
  return { success: true };
}
