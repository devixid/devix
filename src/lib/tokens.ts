import { randomBytes } from "crypto";

/**
 * Generate an unguessable, URL-safe download token.
 * 32 bytes of CSPRNG entropy -> base64url. Replaces the previous cuid() default,
 * which is collision-resistant but not designed to be an unguessable secret.
 */
export function generateDownloadToken(): string {
  return randomBytes(32).toString("base64url");
}
