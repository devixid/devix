import { NextResponse, type NextRequest } from "next/server";
import { getGlobalLimiter, getApiLimiter, getClientIp } from "@/lib/rate-limit";
import {
  verifySessionToken,
  readSessionTokenFromCookies,
  resolveSessionCookieName,
  isSecureRequestUrl,
  SESSION_COOKIE_DEV,
  SESSION_COOKIE_PROD,
} from "@/lib/session-token";

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
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (pathname === "/admin/error") {
    return NextResponse.next();
  }

  const isSecure = isSecureRequestUrl(request.nextUrl.protocol);
  const token = readSessionTokenFromCookies(request.cookies, isSecure);

  if (!token) {
    if (pathname !== "/admin/login") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  try {
    await verifySessionToken(token);

    if (pathname === "/admin/login") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next();
  } catch (_) {
    if (pathname !== "/admin/login") {
      const response = NextResponse.redirect(
        new URL("/admin/login", request.url),
      );
      response.cookies.delete(resolveSessionCookieName(isSecure));
      response.cookies.delete(SESSION_COOKIE_PROD);
      response.cookies.delete(SESSION_COOKIE_DEV);
      return response;
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
