import { Ratelimit } from "@upstash/ratelimit";
import { getRedisClient } from "./redis";

// Create a shared ephemeral cache for all limiters
const cache = new Map();

// Lazy initialization pattern for Ratelimit instances
// They are created only when first accessed, allowing build process
// to proceed even without Redis env variables

let _globalLimiter: Ratelimit | null = null;
export function getGlobalLimiter() {
  const redis = getRedisClient();
  if (!redis) return null;
  if (!_globalLimiter) {
    _globalLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "60 s"),
      prefix: "ratelimit:global",
      analytics: true,
      ephemeralCache: cache,
    });
  }
  return _globalLimiter;
}

let _authLimiter: Ratelimit | null = null;
export function getAuthLimiter() {
  const redis = getRedisClient();
  if (!redis) return null;
  if (!_authLimiter) {
    _authLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(5, "15 m"),
      prefix: "ratelimit:auth",
      ephemeralCache: cache,
    });
  }
  return _authLimiter;
}

let _registerLimiter: Ratelimit | null = null;
export function getRegisterLimiter() {
  const redis = getRedisClient();
  if (!redis) return null;
  if (!_registerLimiter) {
    _registerLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(3, "60 m"),
      prefix: "ratelimit:register",
      ephemeralCache: cache,
    });
  }
  return _registerLimiter;
}

let _contactLimiter: Ratelimit | null = null;
export function getContactLimiter() {
  const redis = getRedisClient();
  if (!redis) return null;
  if (!_contactLimiter) {
    _contactLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "10 m"),
      prefix: "ratelimit:contact",
      ephemeralCache: cache,
    });
  }
  return _contactLimiter;
}

let _apiLimiter: Ratelimit | null = null;
export function getApiLimiter() {
  const redis = getRedisClient();
  if (!redis) return null;
  if (!_apiLimiter) {
    _apiLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "60 s"),
      prefix: "ratelimit:api",
      ephemeralCache: cache,
    });
  }
  return _apiLimiter;
}

let _purchaseLimiter: Ratelimit | null = null;
export function getPurchaseLimiter() {
  const redis = getRedisClient();
  if (!redis) return null;
  if (!_purchaseLimiter) {
    _purchaseLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      prefix: "ratelimit:purchase",
      ephemeralCache: cache,
    });
  }
  return _purchaseLimiter;
}

// Per-email velocity guard against card-testing across rotating IPs.
let _purchaseEmailLimiter: Ratelimit | null = null;
export function getPurchaseEmailLimiter() {
  const redis = getRedisClient();
  if (!redis) return null;
  if (!_purchaseEmailLimiter) {
    _purchaseEmailLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      prefix: "ratelimit:purchase:email",
      ephemeralCache: cache,
    });
  }
  return _purchaseEmailLimiter;
}

// Blunt hammering on the download endpoint (token brute force / parallel fetch).
let _downloadLimiter: Ratelimit | null = null;
export function getDownloadLimiter() {
  const redis = getRedisClient();
  if (!redis) return null;
  if (!_downloadLimiter) {
    _downloadLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "10 m"),
      prefix: "ratelimit:download",
      ephemeralCache: cache,
    });
  }
  return _downloadLimiter;
}

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
