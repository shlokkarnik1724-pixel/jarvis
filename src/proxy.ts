import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/config";
import { updateSession } from "@/lib/supabase/middleware";
import { DEMO_COOKIE, isDemoSession } from "@/lib/demo/store";

const protectedPrefixes = [
  "/dashboard",
  "/events",
  "/vault",
  "/leaderboard",
  "/settings",
  "/fun",
  "/games",
  "/onboarding",
];

function needsAuth(pathname: string): boolean {
  return protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isSupabaseConfigured()) {
    const { supabaseResponse, user } = await updateSession(request);

    if (needsAuth(pathname) && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    if (user && (pathname === "/login" || pathname === "/")) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  }

  const demoToken = request.cookies.get(DEMO_COOKIE)?.value;
  const demoOk = isDemoSession(demoToken);

  if (needsAuth(pathname) && !demoOk) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    const res = NextResponse.redirect(url);
    if (demoToken && !demoOk) {
      res.cookies.delete(DEMO_COOKIE);
    }
    return res;
  }

  if (demoOk && (pathname === "/login" || pathname === "/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/onboarding",
    "/dashboard/:path*",
    "/events/:path*",
    "/vault/:path*",
    "/leaderboard/:path*",
    "/settings/:path*",
    "/fun/:path*",
    "/games/:path*",
  ],
};
