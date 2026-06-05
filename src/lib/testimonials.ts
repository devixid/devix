import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export const getVisibleTestimonials = unstable_cache(
  async () => {
    return prisma.testimonial.findMany({
      where: { isVisible: true },
      orderBy: { order: "asc" },
    });
  },
  ["visible-testimonials"],
  { tags: ["testimonials"], revalidate: 3600 },
);
