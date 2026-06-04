import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.testimonial.createMany({
    data: [
      {
        clientName: "James Whitfield",
        clientRole: "Founder & CEO",
        company: "Archway Digital",
        content: "Devix delivered a stunning website in record time. The attention to detail and the quality of the code exceeded our expectations. We've seen a 40% increase in lead conversions since launch.",
        order: 1,
      },
      {
        clientName: "Sarah Chen",
        clientRole: "Marketing Director",
        company: "Luminary Labs",
        content: "Working with Devix was a seamless experience from start to finish. They understood our vision immediately and translated it into a design that truly represents our brand.",
        order: 2,
      },
      {
        clientName: "Marcus Andersson",
        clientRole: "Product Manager",
        company: "Northfield SaaS",
        content: "The level of craftsmanship Devix brings is rare. Our new platform feels premium and our users have noticed. Highly recommend for any serious web project.",
        order: 3,
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seed data created.");
}

main()
  .then(() => {
    return prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
