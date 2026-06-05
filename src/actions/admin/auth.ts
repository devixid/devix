"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { setSessionCookie, clearSessionCookie } from "@/lib/auth";
import { headers } from "next/headers";
import { authLimiter, registerLimiter, getClientIp } from "@/lib/rate-limit";

export async function registerAdmin(formData: FormData) {
  const ip = getClientIp(await headers());
  const { success } = await registerLimiter.limit(ip);
  if (!success) {
    throw new Error("Too many registration attempts. Please try again later.");
  }

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;

  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

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
  const { success } = await authLimiter.limit(ip);
  if (!success) {
    throw new Error("Too many login attempts. Please try again later.");
  }

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.hashedPassword) {
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
