import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isSupabaseConfigured } from "@/lib/config";
import { jwtVerify } from "jose";

const COOKIE_NAME = "tactix_session";

const protectedPrefixes = [
  "/dashboard",
  "/brain",
  "/map",
  "/tour",
  "/connectors",
  "/inbox",
  "/ingestion",
  "/graph",
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

async function verifyLocalSession(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const needsAuth = protectedPrefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  // Prefer Supabase auth when configured
  if (isSupabaseConfigured()) {
    const { supabaseResponse, user, supabase } = await updateSession(request);

    // Fall back to local demo JWT when Supabase session is absent
    if (needsAuth && !user) {
      const local = await verifyLocalSession(request);
      if (local?.organizationId) {
        return NextResponse.next();
      }
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    if (user && needsAuth && supabase) {
      const { data: membership } = await supabase
        .from("memberships")
        .select("organization_id, role")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      const hasOrg = Boolean(membership?.organization_id);

      if (pathname.startsWith("/onboarding") && hasOrg) {
        const url = request.nextUrl.clone();
        url.pathname = "/map";
        return NextResponse.redirect(url);
      }

      if (!pathname.startsWith("/onboarding") && !hasOrg && needsAuth) {
        const url = request.nextUrl.clone();
        url.pathname = "/onboarding";
        return NextResponse.redirect(url);
      }
    }

    return supabaseResponse;
  }

  // Local JWT fallback (demo / before Supabase keys are added)
  if (!needsAuth) return NextResponse.next();

  const payload = await verifyLocalSession(request);
  if (!payload) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const hasOrg = Boolean(payload.organizationId);

  if (pathname.startsWith("/onboarding") && hasOrg) {
    const url = request.nextUrl.clone();
    url.pathname = "/map";
    return NextResponse.redirect(url);
  }

  if (!pathname.startsWith("/onboarding") && !hasOrg) {
    const url = request.nextUrl.clone();
    url.pathname = "/onboarding";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/brain/:path*",
    "/map/:path*",
    "/tour/:path*",
    "/connectors/:path*",
    "/inbox/:path*",
    "/ingestion/:path*",
    "/graph/:path*",
    "/sources/:path*",
    "/extract/:path*",
    "/skills/:path*",
    "/simulator/:path*",
    "/settings/:path*",
    "/billing/:path*",
    "/onboarding/:path*",
    "/login",
    "/signup",
  ],
};
