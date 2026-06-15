import { describe, expect, it, vi, beforeEach } from "vitest";
import { getTestMocks } from "@/lib/test/mocks/registry";

// Mock Prisma
vi.mock("@/lib/prisma", async () => {
  const { createMockPrisma } = await import("@/lib/test/mocks/prisma");
  const { getTestMocks } = await import("@/lib/test/mocks/registry");
  const { prisma, mocks } = createMockPrisma();
  getTestMocks().prisma = mocks;
  return { prisma };
});

// Mock Auth
vi.mock("@/lib/auth", () => ({
  verifyAdminSession: vi.fn().mockResolvedValue({ id: "admin_1" }),
  verifyCsrfOrigin: vi.fn().mockResolvedValue(true),
}));

// Mock Cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock Activity Log
vi.mock("@/lib/activity-log", () => ({
  logActivity: vi.fn().mockResolvedValue(undefined),
}));

import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "@/actions/admin/coupons";
import { resetMockPrisma } from "@/lib/test/mocks/prisma";
import { Decimal } from "@prisma/client/runtime/client";

describe("admin coupon actions", () => {
  beforeEach(() => {
    resetMockPrisma(getTestMocks().prisma!);
    vi.clearAllMocks();
  });

  describe("getCoupons", () => {
    it("returns coupons list sorted by createdAt desc", async () => {
      const mockCoupons = [
        { code: "CODE1", discountType: "PERCENTAGE", discountValue: new Decimal(10) },
        { code: "CODE2", discountType: "FIXED", discountValue: new Decimal(20) },
      ];
      getTestMocks().prisma!.coupon.findMany.mockResolvedValueOnce(mockCoupons);

      const result = await getCoupons();
      expect(result).toEqual(mockCoupons);
      expect(getTestMocks().prisma!.coupon.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: "desc" },
      });
    });
  });

  describe("createCoupon", () => {
    it("creates a new coupon when inputs are valid", async () => {
      const formData = new FormData();
      formData.append("code", "SAVE50");
      formData.append("discountType", "PERCENTAGE");
      formData.append("discountValue", "50");
      formData.append("active", "true");
      formData.append("maxUses", "100");
      formData.append("expiresAt", "2026-12-31T23:59:59.000Z");

      getTestMocks().prisma!.coupon.findUnique.mockResolvedValueOnce(null);
      getTestMocks().prisma!.coupon.create.mockResolvedValueOnce({ code: "SAVE50" });

      const result = await createCoupon(formData);
      expect(result.success).toBe(true);
      expect(getTestMocks().prisma!.coupon.create).toHaveBeenCalledWith({
        data: {
          code: "SAVE50",
          discountType: "PERCENTAGE",
          discountValue: expect.any(Object), // Decimal
          active: true,
          maxUses: 100,
          expiresAt: new Date("2026-12-31T23:59:59.000Z"),
        },
      });
    });

    it("throws error for invalid coupon code format", async () => {
      const formData = new FormData();
      formData.append("code", "save 50!"); // spaces/special char
      formData.append("discountType", "PERCENTAGE");
      formData.append("discountValue", "50");

      await expect(createCoupon(formData)).rejects.toThrow(
        "Code must contain only uppercase alphanumeric characters, underscores, or hyphens",
      );
    });

    it("throws error if coupon code already exists", async () => {
      const formData = new FormData();
      formData.append("code", "SAVE50");
      formData.append("discountType", "PERCENTAGE");
      formData.append("discountValue", "50");

      getTestMocks().prisma!.coupon.findUnique.mockResolvedValueOnce({ code: "SAVE50" });

      await expect(createCoupon(formData)).rejects.toThrow(
        "Coupon code already exists.",
      );
    });
  });

  describe("updateCoupon", () => {
    it("updates existing coupon properties", async () => {
      const formData = new FormData();
      formData.append("discountType", "FIXED");
      formData.append("discountValue", "15.50");
      formData.append("active", "false");
      formData.append("maxUses", "");
      formData.append("expiresAt", "");

      getTestMocks().prisma!.coupon.findUnique.mockResolvedValueOnce({ code: "SAVE50" });
      getTestMocks().prisma!.coupon.update.mockResolvedValueOnce({ code: "SAVE50" });

      const result = await updateCoupon("SAVE50", formData);
      expect(result.success).toBe(true);
      expect(getTestMocks().prisma!.coupon.update).toHaveBeenCalledWith({
        where: { code: "SAVE50" },
        data: {
          discountType: "FIXED",
          discountValue: expect.any(Object),
          active: false,
          maxUses: null,
          expiresAt: null,
        },
      });
    });

    it("throws error if coupon to update does not exist", async () => {
      const formData = new FormData();
      formData.append("discountType", "FIXED");
      formData.append("discountValue", "15");

      getTestMocks().prisma!.coupon.findUnique.mockResolvedValueOnce(null);

      await expect(updateCoupon("SAVE50", formData)).rejects.toThrow(
        "Coupon not found.",
      );
    });
  });

  describe("deleteCoupon", () => {
    it("deletes coupon and unlinks associated purchases", async () => {
      getTestMocks().prisma!.coupon.findUnique.mockResolvedValueOnce({ code: "SAVE50" });

      const result = await deleteCoupon("SAVE50");
      expect(result.success).toBe(true);
      expect(getTestMocks().prisma!.purchase.updateMany).toHaveBeenCalledWith({
        where: { couponCode: "SAVE50" },
        data: { couponCode: null },
      });
      expect(getTestMocks().prisma!.coupon.delete).toHaveBeenCalledWith({
        where: { code: "SAVE50" },
      });
    });

    it("throws error if coupon to delete does not exist", async () => {
      getTestMocks().prisma!.coupon.findUnique.mockResolvedValueOnce(null);

      await expect(deleteCoupon("SAVE50")).rejects.toThrow(
        "Coupon not found.",
      );
    });
  });
});
