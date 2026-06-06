import { About, FaQ, Offering, OurTeams } from "@/components";
import { HeadingStatic } from "@/components/atoms/Heading/HeadingStatic";
import Testimonials from "@/components/molecules/Testimonials";
import Contact from "@/components/molecules/Contact";
import CTA from "@/components/molecules/CTA";
import { Metadata } from "next";
import { HeroSection } from "./HeroSection";
import Link from "next/link";
import ProjectCard from "@/components/molecules/projects/ProjectCard";
import { StoreProductCard } from "@/components/molecules/StoreProductCard";
import { prisma } from "@/lib/prisma";
import { toProjectListItems } from "@/lib/mappers/projects";
import { getFeaturedProjects } from "@/lib/queries/projects";
import {
  getFaqItems,
  getServiceItems,
  getTeamMembers,
  getSiteSection,
  getSiteSettingsPublic,
} from "@/lib/queries/site-content";
export async function generateMetadata(): Promise<Metadata> {
  const [seo, settings] = await Promise.all([
    getSiteSection("SEO"),
    getSiteSettingsPublic(),
  ]);

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: { canonical: "/" },
    openGraph: {
      title: seo.title,
      description: settings?.metaDescription || seo.description,
      url: settings?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL,
    },
  };
}

export const revalidate = 3600;

export default async function Page() {
  const [
    featuredProjects,
    faqItems,
    serviceItems,
    teamMembers,
    hero,
    about,
    servicesIntro,
    teamIntro,
    portfolioIntro,
    testimonialsIntro,
    contact,
    cta,
    seo,
    settings,
    products,
  ] = await Promise.all([
    getFeaturedProjects(),
    getFaqItems(),
    getServiceItems(),
    getTeamMembers(),
    getSiteSection("HERO"),
    getSiteSection("ABOUT"),
    getSiteSection("SERVICES_INTRO"),
    getSiteSection("TEAM_INTRO"),
    getSiteSection("PORTFOLIO_INTRO"),
    getSiteSection("TESTIMONIALS_INTRO"),
    getSiteSection("CONTACT"),
    getSiteSection("CTA"),
    getSiteSection("SEO"),
    getSiteSettingsPublic(),
    prisma.product.findMany({ where: { isVisible: true }, orderBy: { order: "asc" } }),
  ]);

  const faqs = faqItems.map((item) => ({
    question: "question" in item ? item.question : "",
    answer: "answer" in item ? item.answer : "",
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: settings?.siteName || "Devix",
    url: settings?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "https://devixid.vercel.app",
    logo: `${settings?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "https://devixid.vercel.app"}/logo.png`,
    description: seo.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Jakarta",
      addressCountry: "ID",
    },
  };

  return (
    <div className="grain-overlay">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <HeroSection content={hero} />
      <Offering services={serviceItems} intro={servicesIntro} />
      <About content={about} />
      <OurTeams members={teamMembers} intro={teamIntro} />

      <section id="portfolio" className="scroll-mt-24 py-20 md:py-32">
        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          <div className="mb-16 flex items-end justify-between">
            <div className="max-w-xl">
              <p className="mb-4 text-[13px] font-medium tracking-[0.2em] text-zinc-400 uppercase">
                {portfolioIntro.eyebrow}
              </p>
              <HeadingStatic level="h2" className="font-extralight">
                {portfolioIntro.headline}
              </HeadingStatic>
            </div>
            <Link
              href="/projects"
              className="text-accent hover:text-accent-light hidden text-[13px] font-medium tracking-[0.15em] uppercase transition-colors md:inline-flex"
            >
              View all projects →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {featuredProjects.length > 0 ? (
              toProjectListItems(featuredProjects)
                .slice(0, 3)
                .map((project, idx) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    index={idx}
                    priority={idx === 0}
                  />
                ))
            ) : (
              <div className="col-span-full py-10 text-center text-zinc-500">
                No featured projects yet.
              </div>
            )}
          </div>

          <div className="mt-12 flex justify-center md:hidden">
            <Link
              href="/projects"
              className="group text-accent hover:text-accent-light inline-flex items-center gap-x-2 text-sm font-medium transition-colors duration-300"
            >
              <span className="relative">
                View all projects
                <span className="bg-accent absolute bottom-0 left-0 h-[1px] w-full origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
              </span>
              <span className="text-lg">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section id="store" className="scroll-mt-24 bg-zinc-50/50 py-20 md:py-32">
        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          <div className="mb-16 flex items-end justify-between">
            <div className="max-w-xl">
              <p className="mb-4 text-[13px] font-medium tracking-[0.2em] text-zinc-400 uppercase">
                Digital Products
              </p>
              <HeadingStatic level="h2" className="font-extralight">
                Accelerate your development with our premium resources.
              </HeadingStatic>
            </div>
            <Link
              href="/store"
              className="text-accent hover:text-accent-light hidden text-[13px] font-medium tracking-[0.15em] uppercase transition-colors md:inline-flex"
            >
              View all products →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {products.length > 0 ? (
              products.slice(0, 3).map((product, idx) => (
                <StoreProductCard
                  key={product.id}
                  product={product}
                  index={idx}
                  priority={idx === 0}
                />
              ))
            ) : (
              <div className="col-span-full py-10 text-center text-zinc-500">
                No products available yet.
              </div>
            )}
          </div>

          <div className="mt-12 flex justify-center md:hidden">
            <Link
              href="/store"
              className="group text-accent hover:text-accent-light inline-flex items-center gap-x-2 text-sm font-medium transition-colors duration-300"
            >
              <span className="relative">
                View all products
                <span className="bg-accent absolute bottom-0 left-0 h-[1px] w-full origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
              </span>
              <span className="text-lg">→</span>
            </Link>
          </div>
        </div>
      </section>

      <Testimonials intro={testimonialsIntro} />
      <FaQ faqs={faqs} />
      <Contact content={contact} />
      <CTA content={cta} />
    </div>
  );
}
