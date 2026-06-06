export type HeroContent = {
  watermark: string;
  eyebrow: string;
  headline: string;
  subheading: string;
  ctaPrimary: string;
  ctaSecondary: string;
};

export type AboutContent = {
  eyebrow: string;
  headline: string;
  body: string;
  ctaLabel: string;
  stats: { value: string; label: string }[];
  techStack: string[];
};

export type SectionIntroContent = {
  eyebrow: string;
  headline: string;
  subheading?: string;
};

export type CtaContent = {
  badgeText: string;
  headline: string;
  subheading: string;
  ctaPrimary: string;
  ctaSecondary: string;
};

export type ContactContent = {
  eyebrow: string;
  headline: string;
  email: string;
  timezone: string;
};

export type FooterContent = {
  tagline: string;
  copyright: string;
  navLinks: { label: string; href: string }[];
};

export type SeoContent = {
  title: string;
  description: string;
  keywords: string[];
};

export type SiteSectionContentMap = {
  HERO: HeroContent;
  ABOUT: AboutContent;
  SERVICES_INTRO: SectionIntroContent;
  TEAM_INTRO: SectionIntroContent;
  PORTFOLIO_INTRO: SectionIntroContent;
  TESTIMONIALS_INTRO: SectionIntroContent;
  CTA: CtaContent;
  CONTACT: ContactContent;
  FOOTER: FooterContent;
  SEO: SeoContent;
};

export const DEFAULT_FAQ_ITEMS = [
  {
    question: "What services and products do you offer?",
    answer:
      "We offer comprehensive custom web development (company profiles, e-commerce platforms, landing pages) and custom mobile applications tailored to your business needs.",
  },
  {
    question: "How much experience do you have with IT projects?",
    answer:
      "Our team members have worked on various digital products for businesses across Indonesia, delivering highly optimized, secure, and production-ready applications.",
  },
  {
    question: "How long does a typical project take?",
    answer:
      "A standard website project takes between 2 to 4 weeks depending on the complexity of requirements and design iterations.",
  },
  {
    question: "Should I create a mobile or a web app?",
    answer:
      "It depends on your audience. Websites are perfect for discovery and broad reach, while mobile apps are ideal for retaining repeat customers and providing offline capabilities.",
  },
  {
    question: "What technologies do you use in development?",
    answer:
      "We primarily develop websites using Next.js, React, TailwindCSS, and Node.js, and integrate databases using Supabase and Prisma for maximum speed and security.",
  },
  {
    question: "What do I need to prepare before contacting you?",
    answer:
      "Just your business idea and goals! Having your brand guidelines, logo files, and content copy ready will help speed up the process, but we are happy to guide you from scratch.",
  },
];

export const DEFAULT_SERVICE_ITEMS = [
  {
    title: "Custom Web Development",
    description:
      "High-performance websites designed from scratch to deliver speed, security, and premium aesthetics for your business.",
  },
  {
    title: "E-Commerce Solutions",
    description:
      "Tailored online shops with seamless checkout flows, secure payment integrations, and easy product management systems.",
  },
  {
    title: "Landing Page Optimization",
    description:
      "High-converting single-page sites built specifically to drive leads, showcase product launches, and maximize marketing ROI.",
  },
];

export const DEFAULT_TEAM_MEMBERS = [
  {
    name: "Noval Ramdhani",
    title: "Founder x Backend Developer",
    description:
      "Co-founded Devix and leads our backend system architecture, ensuring database systems and core APIs run securely, reliably, and optimally.",
    imageUrl: "/noval.png",
    socialLinks: {
      github: "https://github.com/novalramdhani",
      linkedin: "https://linkedin.com/in/novalramdhani",
    },
  },
  {
    name: "Andrian Fadhilla",
    title: "UI/UX x Frontend Developer",
    description:
      "Crafts beautiful, interactive user interfaces and ensures fluid user experiences using modern design systems and advanced React architectures.",
    imageUrl: "/andrian.png",
    socialLinks: {
      github: "https://github.com/andrianfadhilla",
      linkedin: "https://linkedin.com/in/andrianfadhilla",
    },
  },
  {
    name: "Dimas Saputra",
    title: "Mobile Developer",
    description:
      "Develops cross-platform, high-performance mobile applications that bring robust desktop experiences right into users' pockets.",
    imageUrl: "/dimas.png",
    socialLinks: {
      github: "https://github.com/infinitedim",
      linkedin: "https://linkedin.com/in/yourblooo",
    },
  },
  {
    name: "Alwi wahyu",
    title: "Backend Developer",
    description:
      "Specializes in server logic, API endpoint construction, and cloud integration, keeping database pipelines running smoothly 24/7.",
    imageUrl: "/alwi.png",
    socialLinks: {
      github: "https://github.com/alwiwahyu",
      linkedin: "https://linkedin.com/in/alwiwahyu",
    },
  },
];

export const DEFAULT_SITE_SECTIONS: SiteSectionContentMap = {
  HERO: {
    watermark: "DEVIX",
    eyebrow: "Web Agency · Est. 2022",
    headline: "Professional website creation services",
    subheading:
      "We craft high-performance digital experiences for ambitious brands across Indonesia and beyond.",
    ctaPrimary: "Estimate Project",
    ctaSecondary: "Get in touch",
  },
  ABOUT: {
    eyebrow: "About Us",
    headline: "Who we are.",
    body: "Devix is a Jakarta-based web agency founded in 2022. We combine design precision with engineering rigor to build websites and applications that perform in production — not just in mockups.",
    ctaLabel: "See our services",
    stats: [
      { value: "3+", label: "Years Experience" },
      { value: "4", label: "Expert Members" },
      { value: "100%", label: "Custom Solutions" },
    ],
    techStack: [
      "Next.js",
      "Tailwind CSS",
      "Framer Motion",
      "TypeScript",
      "Supabase",
      "Prisma",
      "React",
      "PostgreSQL",
    ],
  },
  SERVICES_INTRO: {
    eyebrow: "What We Do",
    headline:
      "We offer website creation tailored to your unique business needs.",
  },
  TEAM_INTRO: {
    eyebrow: "Our Team",
    headline: "The people behind Devix.",
    subheading:
      "A tight-knit team of four specialists — design, frontend, mobile, and backend — working as one unit on every project.",
  },
  PORTFOLIO_INTRO: {
    eyebrow: "Selected Work",
    headline: "Featured Portfolio",
  },
  TESTIMONIALS_INTRO: {
    eyebrow: "Testimonials",
    headline: "What our clients say.",
  },
  CTA: {
    badgeText: "Available for projects",
    headline: "Ready to elevate your digital presence?",
    subheading:
      "Let's discuss your project goals and build something exceptional together.",
    ctaPrimary: "Start a project",
    ctaSecondary: "View our work",
  },
  CONTACT: {
    eyebrow: "Get In Touch",
    headline: "Let's build something world-class together.",
    email: "hello@devix.id",
    timezone: "UTC+7 (GMT+7)",
  },
  FOOTER: {
    tagline: "Crafting premium digital experiences since 2022.",
    copyright: "© Devix. All rights reserved.",
    navLinks: [
      { label: "Home", href: "#home" },
      { label: "Services", href: "#services" },
      { label: "About", href: "#about" },
      { label: "Portfolio", href: "/projects" },
      { label: "Contact", href: "#contact" },
    ],
  },
  SEO: {
    title: "Devix — Professional Web Agency Indonesia",
    description:
      "Devix is a Jakarta-based web agency specializing in custom websites, e-commerce, and mobile applications for ambitious brands.",
    keywords: ["web agency", "web development", "Indonesia", "Next.js", "Devix"],
  },
};
