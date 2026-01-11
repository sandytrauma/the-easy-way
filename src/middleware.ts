import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isPublicRoute = ["/login", "/register", "/"].includes(nextUrl.pathname);
  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");

  // 1. Allow all Auth API calls (Critical for Login to work)
  if (isApiAuthRoute) return NextResponse.next();

  // 2. Redirect logged-in users away from Login/Register
  if (isPublicRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // 3. Protect the Dashboard
  if (isDashboardRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  // Pattern to exclude static files and images
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};