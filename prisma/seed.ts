import { prisma } from "../src/lib/prisma";

async function main() {
  await prisma.testimonial.createMany({
    data: [
      {
        clientName: "James Whitfield",
        clientRole: "Founder & CEO",
        company: "Archway Digital",
        content:
          "Devix delivered a stunning website in record time. The attention to detail and the quality of the code exceeded our expectations. We've seen a 40% increase in lead conversions since launch.",
        order: 1,
      },
      {
        clientName: "Sarah Chen",
        clientRole: "Marketing Director",
        company: "Luminary Labs",
        content:
          "Working with Devix was a seamless experience from start to finish. They understood our vision immediately and translated it into a design that truly represents our brand.",
        order: 2,
      },
      {
        clientName: "Marcus Andersson",
        clientRole: "Product Manager",
        company: "Northfield SaaS",
        content:
          "The level of craftsmanship Devix brings is rare. Our new platform feels premium and our users have noticed. Highly recommend for any serious web project.",
        order: 3,
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seed data for testimonials created.");

  // Create Projects
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const project1 = await prisma.project.create({
    data: {
      title: "Ceràmica — Handcrafted Pottery Shop",
      slug: "ceramica-pottery",
      description:
        "A premium e-commerce platform for handcrafted ceramics, featuring a seamless shopping experience, robust inventory management, and secure payment processing. The site focuses on high-quality visuals and smooth interactions to highlight the artisanal nature of the products.",
      category: "E-Commerce",
      imageUrl: "/portfolio_ecommerce.png",
      liveUrl: "https://ceramic-example.devix.id",
      githubUrl: "https://github.com/devix/ceramica",
      isFeatured: true,
      techStacks: {
        create: [
          { name: "Next.js" },
          { name: "Tailwind CSS" },
          { name: "Prisma" },
          { name: "Stripe" },
        ],
      },
      developers: {
        create: [
          { name: "Noval Ramdhani", role: "Backend Developer" },
          { name: "Andrian Fadhilla", role: "Frontend Developer" },
        ],
      },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const project2 = await prisma.project.create({
    data: {
      title: "Veridian Solutions — Sustainable Tech Hub",
      slug: "veridian-solutions",
      description:
        "A corporate profile website for a sustainable technology hub. The platform highlights their mission, showcases ongoing initiatives, and provides a resource center for partners and investors. Designed with a clean, modern aesthetic utilizing dynamic animations.",
      category: "Corporate Profile",
      imageUrl: "/portfolio_corporate.png",
      liveUrl: "https://veridian-example.devix.id",
      isFeatured: true,
      techStacks: {
        create: [
          { name: "React" },
          { name: "Tailwind CSS" },
          { name: "Framer Motion" },
        ],
      },
      developers: {
        create: [{ name: "Andrian Fadhilla", role: "UI/UX & Frontend" }],
      },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const project3 = await prisma.project.create({
    data: {
      title: "Projector — Agile Team Collaboration SaaS",
      slug: "projector-saas",
      description:
        "A comprehensive SaaS application designed for agile teams to manage projects, track tasks, and collaborate in real-time. Features include customizable kanban boards, real-time chat, and detailed analytics dashboards.",
      category: "Web Application",
      imageUrl: "/portfolio_saas.png",
      liveUrl: "https://projector-example.devix.id",
      githubUrl: "https://github.com/devix/projector",
      isFeatured: true,
      techStacks: {
        create: [
          { name: "Next.js" },
          { name: "Supabase" },
          { name: "TypeScript" },
          { name: "Tailwind CSS" },
        ],
      },
      developers: {
        create: [
          { name: "Noval Ramdhani", role: "Backend Developer" },
          { name: "Alwi wahyu", role: "Backend Developer" },
          { name: "Andrian Fadhilla", role: "Frontend Developer" },
        ],
      },
    },
  });

  console.log("Seed data for projects created.");
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
