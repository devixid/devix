import { EncryptJWT, jwtDecrypt } from "jose";
import { cookies } from "next/headers";

// JWT_SECRET should be defined in .env
// Using a default fallback for development purposes only.
const secretKey =
  process.env.JWT_SECRET || "devix-super-secret-key-pbkdf2-hmac-iv-123456789";
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
    .setExpirationTime("24h")
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

  (await cookies()).set("devix_admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

export async function clearSessionCookie() {
  (await cookies()).delete("devix_admin_session");
}

export async function getSessionCookie() {
  const token = (await cookies()).get("devix_admin_session")?.value;
  if (!token) return null;
  return await decryptSession(token);
}
