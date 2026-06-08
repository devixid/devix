import { describe, expect, it } from "vitest";
import {
  FaqItemSchema,
  ServiceItemSchema,
  TeamMemberSchema,
  validateSiteSectionContent,
} from "@/lib/schemas/site-content";

describe("validateSiteSectionContent", () => {
  it("validates HERO section content", () => {
    const hero = {
      watermark: "DEVIX",
      eyebrow: "Studio",
      headline: "Build better products",
      subheading: "We craft web experiences.",
      ctaPrimary: "Start a project",
      ctaSecondary: "View work",
    };
    expect(validateSiteSectionContent("HERO", hero)).toEqual(hero);
  });

  it("throws for invalid CONTACT email", () => {
    expect(() =>
      validateSiteSectionContent("CONTACT", {
        eyebrow: "Contact",
        headline: "Say hello",
        email: "not-an-email",
        timezone: "Asia/Jakarta",
      }),
    ).toThrow();
  });
});

describe("FaqItemSchema", () => {
  it("accepts valid FAQ entries", () => {
    const parsed = FaqItemSchema.parse({
      question: "How long does a project take?",
      answer: "Typical projects run 4–12 weeks depending on scope.",
    });
    expect(parsed.question).toContain("project");
  });
});

describe("ServiceItemSchema", () => {
  it("rejects overly short descriptions", () => {
    expect(() =>
      ServiceItemSchema.parse({
        title: "Design",
        description: "Short",
      }),
    ).toThrow();
  });
});

describe("TeamMemberSchema", () => {
  it("accepts relative image paths", () => {
    const parsed = TeamMemberSchema.parse({
      name: "Jane Doe",
      title: "Engineer",
      description: "Full-stack developer with a focus on performance.",
      imageUrl: "/team/jane.jpg",
    });
    expect(parsed.imageUrl).toBe("/team/jane.jpg");
  });
});
