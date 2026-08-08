import { NextRequest, NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/auth";
import { launchDemoWorkspace } from "@/lib/demo-launch";

function isHttps(request: NextRequest) {
  const proto = request.headers.get("x-forwarded-proto");
  return proto === "https" || request.nextUrl.protocol === "https:";
}

/** Prefer Cloudflare/proxy host so redirects don't send users to localhost. */
function publicOrigin(request: NextRequest): string {
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    request.nextUrl.host;
  const proto =
    request.headers.get("x-forwarded-proto") ||
    (request.nextUrl.protocol === "https:" ? "https" : "http");
  return `${proto}://${host}`;
}

/** Browser-friendly: seed demo + set cookie + hard redirect (no client JS). */
export async function GET(request: NextRequest) {
  try {
    const launched = await launchDemoWorkspace();
    const res = NextResponse.redirect(new URL("/brain", publicOrigin(request)));
    res.cookies.set(launched.cookie.name, launched.cookie.value, {
      httpOnly: launched.cookie.httpOnly,
      sameSite: launched.cookie.sameSite,
      secure: isHttps(request),
      path: launched.cookie.path,
      maxAge: launched.cookie.maxAge,
    });
    return res;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Demo launch failed";
    const url = new URL("/login", publicOrigin(request));
    url.searchParams.set("error", message);
    return NextResponse.redirect(url);
  }
}

export async function POST(request: NextRequest) {
  try {
    const launched = await launchDemoWorkspace();
    await setSessionCookie(launched.token, { secure: isHttps(request) });

    return NextResponse.json({
      ok: true,
      organization: launched.organization,
      credentials: launched.credentials,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Demo launch failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
