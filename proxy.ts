import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_VALUE,
  AUTH_ROLE_COOKIE_NAME,
  getDashboardPathForRole,
  getRoleFromPath,
  isUserRole,
} from "@/lib/auth";

const PROTECTED_PREFIXES = [
  "/admin",
  "/citizen",
  "/rescue-center",
  "/rescue-team",
  "/dashboard",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const authCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const roleCookie = request.cookies.get(AUTH_ROLE_COOKIE_NAME)?.value;

  const isAuthenticated =
    authCookie === AUTH_COOKIE_VALUE && isUserRole(roleCookie);

  if (pathname === "/login" || pathname === "/signup") {
    if (isAuthenticated && roleCookie) {
      return NextResponse.redirect(
        new URL(getDashboardPathForRole(roleCookie), request.url),
      );
    }
    return NextResponse.next();
  }

  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  if (!isAuthenticated || !roleCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/dashboard") {
    return NextResponse.redirect(
      new URL(getDashboardPathForRole(roleCookie), request.url),
    );
  }

  const routeRole = getRoleFromPath(pathname);
  if (routeRole && routeRole !== roleCookie) {
    return NextResponse.redirect(
      new URL(getDashboardPathForRole(roleCookie), request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/signup",
    "/dashboard/:path*",
    "/admin/:path*",
    "/citizen/:path*",
    "/rescue-center/:path*",
    "/rescue-team/:path*",
  ],
};
