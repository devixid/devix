import { z } from "zod";
import type { SiteSectionKey } from "@prisma/client";

const heroSchema = z.object({
  watermark: z.string().min(1),
  eyebrow: z.string().min(1),
  headline: z.string().min(1),
  subheading: z.string().min(1),
  ctaPrimary: z.string().min(1),
  ctaSecondary: z.string().min(1),
});

const aboutSchema = z.object({
  eyebrow: z.string().min(1),
  headline: z.string().min(1),
  body: z.string().min(1),
  ctaLabel: z.string().min(1),
  stats: z.array(z.object({ value: z.string(), label: z.string() })),
  techStack: z.array(z.string()),
});

const introSchema = z.object({
  eyebrow: z.string().min(1),
  headline: z.string().min(1),
  subheading: z.string().optional(),
});

const ctaSchema = z.object({
  badgeText: z.string().min(1),
  headline: z.string().min(1),
  subheading: z.string().min(1),
  ctaPrimary: z.string().min(1),
  ctaSecondary: z.string().min(1),
});

const contactSchema = z.object({
  eyebrow: z.string().min(1),
  headline: z.string().min(1),
  email: z.string().email(),
  timezone: z.string().min(1),
});

const footerSchema = z.object({
  tagline: z.string().min(1),
  copyright: z.string().min(1),
  navLinks: z.array(z.object({ label: z.string(), href: z.string() })),
});

const seoSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  keywords: z.array(z.string()),
});

const sectionSchemas: Record<
  SiteSectionKey,
  z.ZodType<Record<string, unknown>>
> = {
  HERO: heroSchema,
  ABOUT: aboutSchema,
  SERVICES_INTRO: introSchema,
  TEAM_INTRO: introSchema,
  PORTFOLIO_INTRO: introSchema,
  TESTIMONIALS_INTRO: introSchema,
  CTA: ctaSchema,
  CONTACT: contactSchema,
  FOOTER: footerSchema,
  SEO: seoSchema,
};

export function validateSiteSectionContent(
  key: SiteSectionKey,
  content: unknown,
) {
  const schema = sectionSchemas[key];
  const parsed = schema.safeParse(content);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid section content.",
    );
  }
  return parsed.data as Record<string, unknown>;
}

export const FaqItemSchema = z.object({
  question: z.string().min(3).max(500),
  answer: z.string().min(10).max(10000),
  order: z.number().int().min(0).optional(),
  isVisible: z.boolean().optional(),
});

export const ServiceItemSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().min(10).max(5000),
  order: z.number().int().min(0).optional(),
  isVisible: z.boolean().optional(),
});

export const TeamMemberSchema = z.object({
  name: z.string().min(2).max(200),
  title: z.string().min(2).max(200),
  description: z.string().min(10).max(5000),
  imageUrl: z.string().url().or(z.string().startsWith("/")),
  socialLinks: z
    .object({
      github: z.string().url().optional(),
      linkedin: z.string().url().optional(),
    })
    .optional(),
  order: z.number().int().min(0).optional(),
  isVisible: z.boolean().optional(),
});
