import { EncryptJWT, jwtDecrypt } from "jose";
import { cookies, headers } from "next/headers";

const secretKey = process.env.JWT_SECRET;
if (!secretKey) throw new Error("JWT_SECRET environment variable is not set.");
const secret = new TextEncoder().encode(secretKey);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function encryptSession(payload: any) {
  return new EncryptJWT(payload)
    .setProtectedHeader({
      // PBES2-HS256+A256KW: Uses PBKDF2 with HMAC SHA-256 for key derivation
      alg: "PBES2-HS256+A256KW",
      // A256GCM: AES-256-GCM encryption which uses an Initialization Vector (IV) and produces an Auth Tag
      enc: "A256GCM",
    })
    .setIssuedAt()
    .setExpirationTime("8h")
    .encrypt(secret);
}

export async function decryptSession(token: string) {
  try {
    const { payload } = await jwtDecrypt(token, secret);
    return payload;
  } catch (_) {
    return null;
  }
}

export async function setSessionCookie(userId: string, email: string) {
  const token = await encryptSession({ userId, email });

  (await cookies()).set("__Host-devix_session", token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });
}

export async function clearSessionCookie() {
  (await cookies()).delete("__Host-devix_session");
}

export async function getSessionCookie() {
  const token = (await cookies()).get("__Host-devix_session")?.value;
  if (!token) return null;
  return await decryptSession(token);
}

// Check CSRF Origin
export async function verifyCsrfOrigin() {
  const headersList = await headers();
  const origin = headersList.get("origin");
  const allowedOrigin = process.env.NEXT_PUBLIC_SITE_URL;
  if (origin && origin !== allowedOrigin) {
    throw new Error("Invalid request origin.");
  }
}

// Verify Admin Session and Whitelist Status
export async function verifyAdminSession() {
  const session = await getSessionCookie();

  if (!session || !session.email) {
    throw new Error("Unauthorized access. Session not found.");
  }

  // Use dynamic import or lazy load for prisma & redis if needed,
  // or just import at the top of the file
  const { prisma } = await import("@/lib/prisma");
  const { cachedQuery } = await import("@/lib/redis");

  // Check if email is whitelisted using cached query
  const emailStr = session.email as string;
  const dbUser = await cachedQuery(
    `admin:whitelist:${emailStr}`,
    async () => {
      return prisma.user.findUnique({
        where: { email: emailStr },
        select: { email: true },
      });
    },
    600, // Cache whitelist for 10 mins
  );

  if (!dbUser) {
    throw new Error(
      "Unauthorized access. Admin whitelist verification failed.",
    );
  }

  return session;
}
