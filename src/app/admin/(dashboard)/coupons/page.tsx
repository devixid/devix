import { prisma } from "@/lib/prisma";
import { CouponManager } from "@/components/admin/CouponManager";

export const revalidate = 0;

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <CouponManager initialCoupons={coupons} />;
}
