import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/browse(.*)",
  "/experience(.*)",
  "/guidelines",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhook(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
    "/",
  ],
};