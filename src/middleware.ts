import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "tactix_session";

const protectedPrefixes = [
  "/dashboard",
  "/sources",
  "/extract",
  "/skills",
  "/simulator",
  "/settings",
  "/billing",
  "/onboarding",
];

function getSecret() {
  return new TextEncoder().encode(
    process.env.AUTH_SECRET || "tactix-dev-secret-change-me"
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const needsAuth = protectedPrefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (!needsAuth) return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  try {
    const { payload } = await jwtVerify(token, getSecret());
    const hasOrg = Boolean(payload.organizationId);

    if (pathname.startsWith("/onboarding") && hasOrg) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    if (!pathname.startsWith("/onboarding") && !hasOrg) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/sources/:path*",
    "/extract/:path*",
    "/skills/:path*",
    "/simulator/:path*",
    "/settings/:path*",
    "/billing/:path*",
    "/onboarding/:path*",
  ],
};
