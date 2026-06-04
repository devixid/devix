import {
  About,
  FaQ,
  Heading,
  Offering,
  OurTeams,
  PortfolioCard,
} from "@/components";
import Testimonials from "@/components/molecules/Testimonials";
import Contact from "@/components/molecules/Contact";
import CTA from "@/components/molecules/CTA";
import { Metadata } from "next";
import { HeroSection } from "./HeroSection";

export const metadata: Metadata = {
  title: "Devix — Web Agency",
  description: "We design and build high-performance custom websites for global brands.",
  keywords: ["devix", "web agency", "custom websites", "next.js", "web development"],
};

const portfolios = [
  {
    title: "Ceràmica — Handcrafted Pottery Shop",
    category: "E-Commerce",
    image: "/portfolio_ecommerce.png",
    link: "https://ceramic-example.devix.id",
    technologies: ["Next.js", "Tailwind CSS", "Prisma", "Stripe"],
  },
  {
    title: "Veridian Solutions — Sustainable Tech Hub",
    category: "Corporate Profile",
    image: "/portfolio_corporate.png",
    link: "https://veridian-example.devix.id",
    technologies: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    title: "Projector — Agile Team Collaboration SaaS",
    category: "Web Application",
    image: "/portfolio_saas.png",
    link: "https://projector-example.devix.id",
    technologies: ["Next.js", "Supabase", "TypeScript", "Tailwind CSS"],
  },
];

export default function Page() {
  return (
    <div className="grain-overlay">
      {/* Hero */}
      <HeroSection />

      {/* Services */}
      <Offering />

      {/* About */}
      <About />

      {/* Team */}
      <OurTeams />

      {/* Portfolio */}
      <section id="portfolio" className="py-20 md:py-32 scroll-mt-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          <div className="flex items-end justify-between mb-16">
            <div className="max-w-xl">
              <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-zinc-400 mb-4">
                Selected Work
              </p>
              <Heading.h2 className="font-extralight">
                Featured Portfolio.
              </Heading.h2>
            </div>
            <a
              href="#portfolio"
              className="hidden md:inline-flex text-[13px] font-medium uppercase tracking-[0.15em] text-accent hover:text-accent-light transition-colors"
            >
              View all projects →
            </a>
          </div>

          {/* Featured grid: 1st card big, 2 cards stacked */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Featured card (spans 2 cols on lg) */}
            <div className="lg:col-span-2 lg:row-span-2">
              <PortfolioCard
                title={portfolios[0].title}
                category={portfolios[0].category}
                image={portfolios[0].image}
                link={portfolios[0].link}
                technologies={portfolios[0].technologies}
                featured
              />
            </div>
            {/* Stacked cards */}
            {portfolios.slice(1).map((item, index) => (
              <PortfolioCard
                key={index}
                title={item.title}
                category={item.category}
                image={item.image}
                link={item.link}
                technologies={item.technologies}
              />
            ))}
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
