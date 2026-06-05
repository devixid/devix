import { z } from "zod";

export const ContactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(100),
  email: z.string().email("Please enter a valid email address.").max(255),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters.")
    .max(5000),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(1, "Password is required."),
});

export const RegisterSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters.")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter.")
    .regex(/[0-9]/, "Must contain at least one number.")
    .regex(/[^A-Za-z0-9]/, "Must contain at least one special character."),
  firstName: z.string().max(50).optional().nullable(),
  lastName: z.string().max(50).optional().nullable(),
});

export const TestimonialSchema = z.object({
  clientName: z.string().min(2).max(100),
  clientRole: z.string().min(2).max(100),
  company: z.string().min(2).max(100),
  content: z.string().min(10).max(2000),
  avatarUrl: z.string().url("Must be a valid URL.").optional().nullable(),
  isVisible: z.boolean().optional().default(true),
  order: z.number().int().min(0).optional().default(0),
});

export const ProjectSchema = z.object({
  title: z.string().min(2).max(200),
  slug: z
    .string()
    .min(2)
    .max(200)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens.",
    ),
  description: z.string().min(10).max(5000),
  category: z.string().min(2).max(100),
  imageUrl: z.string().url("Must be a valid URL."),
  liveUrl: z.string().url().optional().nullable(),
  githubUrl: z.string().url().optional().nullable(),
  completedAt: z.coerce.date().optional().nullable(),
  isFeatured: z.boolean().optional().default(false),
  isVisible: z.boolean().optional().default(true),
  techStacks: z.array(z.string().min(1).max(50)).min(1),
  developers: z
    .array(
      z.object({
        name: z.string().min(1).max(100),
        role: z.string().max(100).optional().nullable(),
      }),
    )
    .min(1),
});
