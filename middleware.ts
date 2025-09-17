import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define all protected routes
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/tickets(.*)", // includes /tickets/purchase-success
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth.protect();
  }
});

export const config = {
  matcher: [
    // Run Clerk middleware on all routes except static files, Next.js internals, and favicon
    "/((?!_next|.*\\..*|favicon.ico).*)",
  ],
};
