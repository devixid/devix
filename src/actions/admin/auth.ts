"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { setSessionCookie, clearSessionCookie } from "@/lib/auth";
import { headers } from "next/headers";
import {
  getAuthLimiter,
  getRegisterLimiter,
  getClientIp,
} from "@/lib/rate-limit";
import { RegisterSchema, LoginSchema } from "@/lib/schemas";

export async function registerAdmin(formData: FormData) {
  const ip = getClientIp(await headers());
  const registerLimiter = getRegisterLimiter();
  if (registerLimiter) {
    const { success } = await registerLimiter.limit(ip);
    if (!success) {
      throw new Error(
        "Too many registration attempts. Please try again later.",
      );
    }
  }

  const parsed = RegisterSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const { email, password, firstName, lastName } = parsed.data;

  // Hard limit: Maximum 4 users
  const userCount = await prisma.user.count();
  if (userCount >= 4) {
    throw new Error(
      "Maximum user limit reached. Only 4 administrators are allowed in the system.",
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("Email is already registered.");
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Save user
  await prisma.user.create({
    data: {
      email,
      hashedPassword,
      firstName: firstName || null,
      lastName: lastName || null,
    },
  });

  return { success: true };
}

export async function loginAdmin(formData: FormData) {
  const ip = getClientIp(await headers());
  const authLimiter = getAuthLimiter();
  if (authLimiter) {
    const { success } = await authLimiter.limit(ip);
    if (!success) {
      throw new Error("Too many login attempts. Please try again later.");
    }
  }

  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.hashedPassword || !user.isActive) {
    throw new Error("Invalid email or password.");
  }

  // Verify the password
  const isValid = await bcrypt.compare(password, user.hashedPassword);
  if (!isValid) {
    throw new Error("Invalid email or password.");
  }

  // Set the custom encrypted session cookie
  await setSessionCookie(user.id, user.email);

  return { success: true };
}

export async function logoutAdmin() {
  await clearSessionCookie();
}
