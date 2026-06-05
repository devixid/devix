import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

// Create a shared ephemeral cache for all limiters
const cache = new Map();

// Tier 1: Global Limiter (Proxy level)
// 60 requests per 60 seconds per IP using sliding window
export const globalLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "60 s"),
  prefix: "ratelimit:global",
  analytics: true,
  ephemeralCache: cache,
});

// Tier 2: Auth Limiters (Server Actions level)
// Login: 5 requests per 15 minutes per IP (Fixed window to prevent aggressive bursts)
export const authLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(5, "15 m"),
  prefix: "ratelimit:auth",
  ephemeralCache: cache,
});

// Register: 3 requests per 60 minutes per IP
export const registerLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(3, "60 m"),
  prefix: "ratelimit:register",
  ephemeralCache: cache,
});

// Tier 3: Contact Form Limiter
// 3 submissions per 10 minutes per IP
export const contactLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "10 m"),
  prefix: "ratelimit:contact",
  ephemeralCache: cache,
});

// Tier 4: API Limiter (e.g. for /api/health)
// 30 requests per 60 seconds per IP
export const apiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "60 s"),
  prefix: "ratelimit:api",
  ephemeralCache: cache,
});

import net from "net";

/**
 * Extracts the client IP address from a NextRequest or standard Headers object.
 */
export function getClientIp(headers: Headers): string {
  const fallback = "127.0.0.1";

  // Vercel specific trusted proxy header
  const vercelIp = headers.get("x-vercel-forwarded-for");
  if (vercelIp && net.isIP(vercelIp)) return vercelIp;

  // Fallback to standard forwarded-for, but be aware it can be spoofed outside of trusted proxy environments
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ip = forwardedFor.split(",")[0].trim();
    if (net.isIP(ip)) {
      return ip;
    }
  }

  const realIp = headers.get("x-real-ip");
  if (realIp && net.isIP(realIp)) {
    return realIp;
  }

  return fallback;
}
