// middleware.js
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const res = NextResponse.next();

  const data = await auth.api.getSession({
    headers: request.headers,
  });

  const routes = [
    {
      condition: () =>
        pathname.startsWith("/dashboard") &&
        (!data?.user || data?.user.role !== "admin"),
      redirect: () =>
        new URL(data?.user ? "/dashboard" : "/sign-in", request.url),
    },
    {
      condition: () => pathname.startsWith("/profile"),
      redirect: () =>
        new URL(data?.user ? "/dashboard/properties" : "/sign-in", request.url),
    },
    {
      condition: () => pathname.startsWith("/sign-in") && data?.user,
      redirect: () => new URL("/dashboard/properties", request.url),
    },
    {
      condition: () => pathname.startsWith("/sign-up") && data?.user,
      redirect: () => new URL("/dashboard/properties", request.url),
    },
    {
      condition: () =>
        pathname.startsWith("/verify-email") && data?.user?.emailVerified,
      redirect: () => new URL("/dashboard/properties", request.url),
    },
  ];

  for (const route of routes) {
    if (route.condition()) {
      return NextResponse.redirect(route.redirect());
    }
  }

  return res;
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/sign-in",
    "/sign-up",
    "/api/auth/:path*",
    "/api/auth/callback",
  ],
  runtime: "nodejs",
};
