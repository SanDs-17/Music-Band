import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;

  // Protect dashboard routes
  const isDashboardRoute =
    pathname.startsWith("/client") ||
    pathname.startsWith("/artist") ||
    pathname.startsWith("/venue") ||
    pathname.startsWith("/admin");

  if (isDashboardRoute && !token) {
    // Redirect to login page if unauthorized
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Map path matcher configs to run middleware only on relevant paths
export const config = {
  matcher: [
    "/client/:path*",
    "/artist/:path*",
    "/venue/:path*",
    "/admin/:path*",
  ],
};
