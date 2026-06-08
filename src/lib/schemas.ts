import { z } from "zod";
import { containsProfanity } from "@/lib/profanity";

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

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z
      .string()
      .min(12, "Password must be at least 12 characters.")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter.")
      .regex(/[0-9]/, "Must contain at least one number.")
      .regex(/[^A-Za-z0-9]/, "Must contain at least one special character."),
    confirmPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
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
  content: z
    .string()
    .max(50000)
    .optional()
    .nullable()
    .refine(
      (val) => !val || val.replace(/<[^>]*>/g, "").trim().length >= 10,
      "Case study content must be at least 10 characters when provided.",
    ),
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

export const ConsultationFeedbackSchema = z.object({
  contactSubmissionId: z.string().cuid("Invalid submission reference."),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z
    .string()
    .max(500)
    .optional()
    .nullable()
    .refine((v) => !v?.trim() || !containsProfanity(v), {
      message:
        "Komentar mengandung kata yang tidak pantas. Mohon gunakan bahasa yang sopan.",
    }),
});

export const PurchaseSchema = z.object({
  productId: z.string().cuid("Invalid product ID."),
  buyerName: z.string().min(2, "Name must be at least 2 characters.").max(100),
  buyerEmail: z.string().email("Please enter a valid email address.").max(255),
});

export const ProductSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(200),
  slug: z
    .string()
    .min(2)
    .max(200)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens.",
    ),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters.")
    .max(10000),
  price: z.coerce.number().positive("Price must be greater than zero."),
  currency: z
    .string()
    .length(3, "Currency must be a 3-letter ISO code.")
    .transform((c) => c.toLowerCase()),
  previewUrl: z
    .union([z.string().url("Preview must be a valid URL."), z.literal("")])
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null)),
  lemonSqueezyVariantId: z
    .union([z.string().min(1).max(50), z.literal("")])
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null)),
  isVisible: z.coerce.boolean().optional().default(true),
  order: z.coerce.number().int().min(0).optional().default(0),
});
