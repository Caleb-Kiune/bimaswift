import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// 1. Removed "/" so the homepage is public.
// 2. Added "(.*)" to dashboard to protect any future sub-pages (like /dashboard/settings).
// 3. Specifically targeted "/api/quotes" so "/api/rates/active" remains public for the calculator!
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/api/quotes/commercial/save(.*)" 
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};