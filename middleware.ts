import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define all protected routes
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/tickets(.*)", // includes /tickets/purchase-success
]);

export default clerkMiddleware((auth, req) => {
  // Get the pathname from the request URL
  const { pathname } = new URL(req.url);

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (isProtectedRoute(req)) {
    auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip all internal paths (_next, api routes, static files)
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
