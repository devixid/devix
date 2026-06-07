import { prisma } from "../src/lib/prisma";
import {
  DEFAULT_FAQ_ITEMS,
  DEFAULT_SERVICE_ITEMS,
  DEFAULT_TEAM_MEMBERS,
  DEFAULT_SITE_SECTIONS,
} from "../src/lib/content-defaults";
import type { Prisma, SiteSectionKey } from "@prisma/client";

function mergeFooterNavLinks(
  existing?: { label: string; href: string }[],
  defaults?: { label: string; href: string }[],
): { label: string; href: string }[] {
  const base = existing && existing.length > 0 ? existing : (defaults ?? []);
  if (base.some((link) => link.href === "/estimator")) return base;

  const contactIndex = base.findIndex((link) => link.href === "#contact");
  const estimator = { label: "Estimator", href: "/estimator" };
  if (contactIndex >= 0) {
    return [
      ...base.slice(0, contactIndex),
      estimator,
      ...base.slice(contactIndex),
    ];
  }
  return [...base, estimator];
}

async function main() {
  await seedSiteContent();

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

  const projectCount = await prisma.project.count();
  if (projectCount > 0) {
    console.log("Projects already exist, skipping project seed.");
    return;
  }

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

  const productCount = await prisma.product.count();
  if (productCount === 0) {
    await prisma.product.createMany({
      data: [
        {
          name: "Devix Starter Kit",
          slug: "devix-starter-kit",
          description:
            "A production-ready Next.js 16 starter kit with Tailwind CSS v4, Supabase, Prisma, and Bun. Includes authentication, admin dashboard, and a clean component library.",
          price: 49,
          fileKey: "devix-starter-kit.zip",
          previewUrl: null,
          isVisible: true,
          order: 1,
        },
        {
          name: "Agency Landing Page",
          slug: "agency-landing-page",
          description:
            "A premium agency landing page template with editorial design, Framer Motion animations, and HeroUI components. Ready to customize and deploy.",
          price: 29,
          fileKey: "agency-landing-page.zip",
          previewUrl: null,
          isVisible: true,
          order: 2,
        },
      ],
      skipDuplicates: true,
    });
    console.log("Seed data for products created.");
  } else {
    console.log("Products already exist, skipping product seed.");
  }
}

async function seedSiteContent() {
  const faqCount = await prisma.faqItem.count();
  if (faqCount === 0) {
    await prisma.faqItem.createMany({
      data: DEFAULT_FAQ_ITEMS.map((item, index) => ({
        ...item,
        order: index,
      })),
    });
    console.log("FAQ items seeded.");
  }

  const serviceCount = await prisma.serviceItem.count();
  if (serviceCount === 0) {
    await prisma.serviceItem.createMany({
      data: DEFAULT_SERVICE_ITEMS.map((item, index) => ({
        ...item,
        order: index,
      })),
    });
    console.log("Service items seeded.");
  }

  const teamCount = await prisma.teamMember.count();
  if (teamCount === 0) {
    await prisma.teamMember.createMany({
      data: DEFAULT_TEAM_MEMBERS.map((item, index) => ({
        name: item.name,
        title: item.title,
        description: item.description,
        imageUrl: item.imageUrl,
        socialLinks: item.socialLinks,
        order: index,
      })),
    });
    console.log("Team members seeded.");
  }

  for (const [key, content] of Object.entries(DEFAULT_SITE_SECTIONS)) {
    const sectionKey = key as SiteSectionKey;
    if (sectionKey === "FOOTER") {
      const existing = await prisma.siteSection.findUnique({
        where: { key: sectionKey },
      });
      const existingContent = existing?.content as
        | { navLinks?: { label: string; href: string }[] }
        | undefined;
      const defaultFooter = content as {
        navLinks: { label: string; href: string }[];
      };
      const mergedNavLinks = mergeFooterNavLinks(
        existingContent?.navLinks,
        defaultFooter.navLinks,
      );
      const mergedContent = {
        ...(existingContent ?? defaultFooter),
        ...defaultFooter,
        navLinks: mergedNavLinks,
      };
      await prisma.siteSection.upsert({
        where: { key: sectionKey },
        create: {
          key: sectionKey,
          content: mergedContent as Prisma.InputJsonValue,
        },
        update: { content: mergedContent as Prisma.InputJsonValue },
      });
      continue;
    }

    await prisma.siteSection.upsert({
      where: { key: sectionKey },
      create: {
        key: sectionKey,
        content: content as Prisma.InputJsonValue,
      },
      update: {},
    });
  }
  console.log("Site sections seeded.");

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      siteName: "Devix",
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://devix.id",
      metaDescription: DEFAULT_SITE_SECTIONS.SEO.description,
    },
    update: {},
  });
  console.log("Site settings initialized.");
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
