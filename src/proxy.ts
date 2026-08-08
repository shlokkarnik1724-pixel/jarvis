import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { DEMO_COOKIE } from "@/lib/demo/store";

const protectedPrefixes = [
  "/dashboard",
  "/events",
  "/vault",
  "/leaderboard",
  "/settings",
  "/fun",
  "/games",
];

function needsAuth(pathname: string): boolean {
  return protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const supabaseConfigured =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("YOUR_PROJECT");

  if (supabaseConfigured) {
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
  if (needsAuth(pathname) && !demoToken) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (demoToken && (pathname === "/login" || pathname === "/")) {
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
    "/dashboard/:path*",
    "/events/:path*",
    "/vault/:path*",
    "/leaderboard/:path*",
    "/settings/:path*",
    "/fun/:path*",
    "/games/:path*",
  ],
};
