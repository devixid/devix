import { prisma } from "@/lib/prisma";
import { cachedQuery } from "@/lib/redis";

export async function getVisibleTestimonials() {
  return cachedQuery(
    "testimonials:visible",
    async () => {
      return prisma.testimonial.findMany({
        where: { isVisible: true },
        orderBy: { order: "asc" },
      });
    },
    600, // 10 minutes TTL
  );
}
