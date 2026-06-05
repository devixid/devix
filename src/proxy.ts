import { NextResponse, type NextRequest } from "next/server";
import { jwtDecrypt } from "jose";
import { getGlobalLimiter, getApiLimiter, getClientIp } from "@/lib/rate-limit";

const secretKey = process.env.JWT_SECRET;
if (!secretKey) throw new Error("JWT_SECRET environment variable is not set.");
const secret = new TextEncoder().encode(secretKey);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIp(request.headers);

  // 1. API Rate Limiting (Tier 4)
  if (pathname.startsWith("/api/")) {
    const apiLimiter = getApiLimiter();
    if (apiLimiter) {
      const { success, limit, reset, remaining } = await apiLimiter.limit(ip);
      if (!success) {
        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
              "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
            },
          },
        );
      }
    }
  } else {
    // 2. Global Rate Limiting (Tier 1) for all non-API paths
    // Note: In production, you might want to exclude static assets if proxy runs on them
    const globalLimiter = getGlobalLimiter();
    if (globalLimiter) {
      const { success, limit, reset, remaining } = await globalLimiter.limit(ip);
      if (!success) {
        return new NextResponse("Too Many Requests", {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
          },
        });
      }
    }
  }

  // 3. Admin Authentication Logic
  // Only run auth middleware on /admin paths
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Allow static admin error page to always be accessible
  if (pathname === "/admin/error") {
    return NextResponse.next();
  }

  const token = request.cookies.get("__Host-devix_session")?.value;

  if (!token) {
    if (pathname !== "/admin/login") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  try {
    // Verify the PBES2+AES-GCM JWE token
    await jwtDecrypt(token, secret);

    // User is logged in
    if (pathname === "/admin/login") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next();
  } catch (_) {
    // Invalid token
    if (pathname !== "/admin/login") {
      const response = NextResponse.redirect(
        new URL("/admin/login", request.url),
      );
      response.cookies.delete("__Host-devix_session");
      return response;
    }
    return NextResponse.next();
  }
}

export const config = {
  // Apply middleware to all routes except static assets
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
