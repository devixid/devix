import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response = NextResponse.next({
              request,
            });
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Route protection
  if (!user) {
    if (pathname !== "/admin/login") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return response;
  }

  // User is logged in
  if (pathname === "/admin/login") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Whitelist check
  const isVerified = request.cookies.get("x-admin-verified")?.value === "true";
  if (isVerified) {
    return response;
  }

  try {
    // Query users table using supabase client
    const { data: whitelistUser, error } = await supabase
      .from("users")
      .select("email")
      .eq("email", user.email)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!whitelistUser) {
      // Sign out and redirect to login
      await supabase.auth.signOut();
      
      const loginRedirect = NextResponse.redirect(
        new URL("/admin/login?error=unauthorized", request.url)
      );
      // Clear verify cookie
      loginRedirect.cookies.set("x-admin-verified", "", { maxAge: -1 });
      return loginRedirect;
    }

    // Verified! Set cookie
    response.cookies.set("x-admin-verified", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600, // 1 hour cache
      path: "/admin",
    });

    return response;
  } catch (err) {
    console.error("Database/Whitelist error in middleware:", err);
    // Gracefully redirect to admin error page to avoid redirect loop
    return NextResponse.redirect(new URL("/admin/error", request.url));
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
