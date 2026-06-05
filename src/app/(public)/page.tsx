import { About, FaQ, Heading, Offering, OurTeams } from "@/components";
import Testimonials from "@/components/molecules/Testimonials";
import Contact from "@/components/molecules/Contact";
import CTA from "@/components/molecules/CTA";
import { Metadata } from "next";
import { HeroSection } from "./HeroSection";
import Link from "next/link";
import ProjectCard from "@/components/molecules/projects/ProjectCard";
import { getFeaturedProjects } from "@/lib/queries/projects";

export const metadata: Metadata = {
  title: "Devix — Premium Software Development Agency",
  description:
    "We design and build high-performance custom websites and software solutions for global brands.",
  keywords: [
    "devix",
    "web agency",
    "software development agency",
    "custom websites",
    "next.js",
    "web development",
  ],
  alternates: {
    canonical: "/",
  },
};

export const revalidate = 60;

export default async function Page() {
  const featuredProjects = await getFeaturedProjects();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Devix",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://devixid.vercel.app",
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://devixid.vercel.app"}/logo.png`,
    description:
      "Premium Software Development Agency specializing in Next.js and React.",
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

      {/* Hero */}
      <HeroSection />

      {/* Services */}
      <Offering />

      {/* About */}
      <About />

      {/* Team */}
      <OurTeams />

      {/* Portfolio */}
      <section
        id="portfolio"
        className="scroll-mt-24 py-20 md:py-32"
      >
        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          <div className="mb-16 flex items-end justify-between">
            <div className="max-w-xl">
              <p className="mb-4 text-[13px] font-medium tracking-[0.2em] text-zinc-400 uppercase">
                Selected Work
              </p>
              <Heading.h2 className="font-extralight">
                Featured Portfolio.
              </Heading.h2>
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
              featuredProjects.slice(0, 3).map((project, idx) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={idx}
                />
              ))
            ) : (
              <div className="col-span-full py-10 text-center text-zinc-500">
                No featured projects yet.
              </div>
            )}
          </div>

          {/* Mobile View All Projects Button */}
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

      {/* Testimonials */}
      <Testimonials />

      {/* FAQ */}
      <FaQ />

      {/* Contact */}
      <Contact />

      {/* CTA */}
      <CTA />
    </div>
  );
}
