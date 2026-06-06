import { createHash } from "node:crypto";
import { EncryptJWT, jwtDecrypt } from "jose";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set.");
  }
  return secret;
}

/** Derive a 256-bit AES key from JWT_SECRET for dir+A256GCM JWE. */
export function getSessionEncryptionKey(): Uint8Array {
  return new Uint8Array(createHash("sha256").update(getJwtSecret()).digest());
}

export const SESSION_COOKIE_PROD = "__Host-devix_session";
export const SESSION_COOKIE_DEV = "devix_session";

/** __Host- cookies require HTTPS; use a plain name on local HTTP. */
export function resolveSessionCookieName(isSecureContext: boolean): string {
  return isSecureContext ? SESSION_COOKIE_PROD : SESSION_COOKIE_DEV;
}

export function isSecureRequestFromHeaders(headers: Headers): boolean {
  return headers.get("x-forwarded-proto") === "https";
}

export function isSecureRequestUrl(protocol: string): boolean {
  return protocol === "https:";
}

export async function createSessionToken(payload: {
  userId: string;
  email: string;
}): Promise<string> {
  return new EncryptJWT(payload)
    .setProtectedHeader({
      // jose v6 does not support PBES2-HS256+A256KW; dir+A256GCM is the
      // standard symmetric JWE profile for a pre-shared 256-bit key.
      alg: "dir",
      enc: "A256GCM",
    })
    .setIssuedAt()
    .setExpirationTime("8h")
    .encrypt(getSessionEncryptionKey());
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtDecrypt(token, getSessionEncryptionKey());
  return payload;
}

export function readSessionTokenFromCookies(
  cookies: { get: (name: string) => { value: string } | undefined },
  isSecureContext: boolean,
): string | undefined {
  const primary = resolveSessionCookieName(isSecureContext);
  return (
    cookies.get(primary)?.value ??
    cookies.get(SESSION_COOKIE_PROD)?.value ??
    cookies.get(SESSION_COOKIE_DEV)?.value
  );
}
