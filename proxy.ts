import { NextRequest, NextResponse } from "next/server";

/**
 * Next.js Middleware - Protect dashboard routes
 * Check for accessToken in cookies/headers
 * Redirect to login if token doesn't exist
 * 
 * Protected routes: /api/*, /(dashboard)/*
 * Public routes: /login, /register, /
 */

// Protected routes that require authentication
const protectedRoutes = [
  "/(dashboard)",
  "/api/products",
  "/api/banners",
  "/api/collections",
  "/api/blogs",
  "/api/orders",
  "/api/comments",
  "/api/sms",
];

// Public routes (no auth required)
const publicRoutes = ["/login", "/register", "/"];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if route is public
  const isPublicRoute = publicRoutes.some(
    (route) => route === pathname || pathname.startsWith(route)
  );

  // If public route, allow access
  if (isPublicRoute && pathname !== "/") {
    return NextResponse.next();
  }

  // Get token from cookies (most common)
  const token =
    request.cookies.get("accessToken")?.value ||
    request.cookies.get("Authorization")?.value?.replace("Bearer ", "");

  // If protected route and no token, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Allow request to continue
  return NextResponse.next();
}

// Configure which routes use middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
