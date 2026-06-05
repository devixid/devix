import { NextResponse, type NextRequest } from "next/server";
import { jwtDecrypt } from "jose";

const secretKey =
  process.env.JWT_SECRET || "devix-super-secret-key-pbkdf2-hmac-iv-123456789";
const secret = new TextEncoder().encode(secretKey);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only run middleware on /admin paths
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Allow static admin error page to always be accessible
  if (pathname === "/admin/error") {
    return NextResponse.next();
  }

  const token = request.cookies.get("devix_admin_session")?.value;

  if (!token) {
    if (pathname !== "/admin/login" && pathname !== "/admin/register") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  try {
    // Verify the PBES2+AES-GCM JWE token
    await jwtDecrypt(token, secret);

    // User is logged in
    if (pathname === "/admin/login" || pathname === "/admin/register") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next();
  } catch (_) {
    // Invalid token
    if (pathname !== "/admin/login" && pathname !== "/admin/register") {
      const response = NextResponse.redirect(
        new URL("/admin/login", request.url),
      );
      response.cookies.delete("devix_admin_session");
      return response;
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
