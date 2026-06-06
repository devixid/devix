import { cookies, headers } from "next/headers";
import {
  createSessionToken,
  verifySessionToken,
  resolveSessionCookieName,
  isSecureRequestFromHeaders,
  SESSION_COOKIE_DEV,
  SESSION_COOKIE_PROD,
} from "@/lib/session-token";

export async function encryptSession(payload: {
  userId: string;
  email: string;
}) {
  return createSessionToken(payload);
}

export async function decryptSession(token: string) {
  try {
    return await verifySessionToken(token);
  } catch (_) {
    return null;
  }
}

export async function setSessionCookie(userId: string, email: string) {
  const token = await createSessionToken({ userId, email });
  const headersList = await headers();
  const isSecure = isSecureRequestFromHeaders(headersList);
  const cookieName = resolveSessionCookieName(isSecure);

  (await cookies()).set(cookieName, token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_PROD);
  cookieStore.delete(SESSION_COOKIE_DEV);
}

export async function getSessionCookie() {
  const headersList = await headers();
  const isSecure = isSecureRequestFromHeaders(headersList);
  const cookieName = resolveSessionCookieName(isSecure);
  const token =
    (await cookies()).get(cookieName)?.value ??
    (await cookies()).get(SESSION_COOKIE_PROD)?.value ??
    (await cookies()).get(SESSION_COOKIE_DEV)?.value;

  if (!token) return null;
  return await decryptSession(token);
}

// Check CSRF Origin
export async function verifyCsrfOrigin() {
  const headersList = await headers();
  const origin = headersList.get("origin");
  if (!origin) return;

  const allowedOrigins = new Set<string>();
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    allowedOrigins.add(process.env.NEXT_PUBLIC_SITE_URL);
  }

  const host = headersList.get("host");
  if (host) {
    allowedOrigins.add(`http://${host}`);
    allowedOrigins.add(`https://${host}`);
  }

  if (!allowedOrigins.has(origin)) {
    throw new Error("Invalid request origin.");
  }
}

// Verify Admin Session and Whitelist Status
export async function verifyAdminSession() {
  const session = await getSessionCookie();

  if (!session || !session.email) {
    throw new Error("Unauthorized access. Session not found.");
  }

  const { prisma } = await import("@/lib/prisma");
  const { cachedQuery } = await import("@/lib/redis");

  const emailStr = session.email as string;
  const dbUser = await cachedQuery(
    `admin:whitelist:${emailStr}`,
    async () => {
      return prisma.user.findUnique({
        where: { email: emailStr },
        select: { email: true },
      });
    },
    600,
  );

  if (!dbUser) {
    throw new Error(
      "Unauthorized access. Admin whitelist verification failed.",
    );
  }

  return session;
}
