import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, verifyJWT } from "@/lib/auth";

// Routes that require authentication
const PROTECTED_ROUTES = [
  "/dashboard",
  "/saved",
  "/submit",
  "/services/github-audit",
  "/services/portfolio-audit",
  "/services/resume-review",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is protected
  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // Verify JWT from cookie
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  const payload = await verifyJWT(token);

  if (!payload) {
    // Invalid or expired token — clear cookie and redirect
    const response = NextResponse.redirect(new URL("/sign-in", request.url));
    response.cookies.set(AUTH_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/saved/:path*", "/submit/:path*", "/services/:path*"],
};
