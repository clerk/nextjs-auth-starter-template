import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/api/(.*)",
  "/events(.*)",
  "/chauffeurs(.*)",
  "/cars(.*)",
  "/rides(.*)",
  "/clients(.*)",
  "/users(.*)",
  "/partners(.*)",
  "/settings(.*)"
]);


export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)", "/",
    "/api/(.*)",
  ],
};
