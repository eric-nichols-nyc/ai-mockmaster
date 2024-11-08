import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
// i want all api routes to be protected except for the webhooks
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)', 
  '/api/(.*)',
  '/interview(.*)'
]);

export default clerkMiddleware(
  (auth, req) => {
    // Skip protection for webhook routes
    if (req.url.includes('/api/webhooks')) return;
    
    if (isProtectedRoute(req)) auth().protect();
  },
  {
    signInUrl: "/sign-in",
    signUpUrl: "/sign-up",
  }
);

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};