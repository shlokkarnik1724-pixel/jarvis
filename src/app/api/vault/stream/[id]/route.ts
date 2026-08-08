import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DEMO_MODE, isSupabaseConfigured } from "@/lib/config";
import {
  DEMO_COOKIE,
  getDemoPhotoBytes,
  getDemoPhotos,
  isDemoSession,
} from "@/lib/demo/store";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { fail } from "@/lib/utils";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (DEMO_MODE || !isSupabaseConfigured()) {
      const cookieStore = await cookies();
      const token = cookieStore.get(DEMO_COOKIE)?.value;
      if (!isDemoSession(token)) {
        return NextResponse.json(fail("Unauthorized"), { status: 401 });
      }

      const photo = getDemoPhotos().find((p) => p.id === id);
      const bytes = getDemoPhotoBytes(id);
      if (!photo || !bytes) {
        return NextResponse.json(fail("Photo not found"), { status: 404 });
      }

      return new NextResponse(Buffer.from(bytes), {
        status: 200,
        headers: {
          "Content-Type": photo.mimeType,
          "Cache-Control": "no-store, no-cache, must-revalidate, private",
          "X-Content-Type-Options": "nosniff",
          "Content-Security-Policy": "default-src 'none'",
        },
      });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(fail("Unauthorized"), { status: 401 });
    }

    const { data: photo, error } = await supabase
      .from("photos")
      .select("id, circle_id, storage_path, mime_type")
      .eq("id", id)
      .maybeSingle();

    if (error || !photo) {
      return NextResponse.json(fail("Photo not found"), { status: 404 });
    }

    const { data: membership } = await supabase
      .from("circle_members")
      .select("user_id")
      .eq("circle_id", photo.circle_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!membership) {
      return NextResponse.json(fail("Forbidden"), { status: 403 });
    }

    const service = await createServiceClient();
    const { data: file, error: downloadError } = await service.storage
      .from("vault")
      .download(photo.storage_path);

    if (downloadError || !file) {
      return NextResponse.json(fail("Unable to stream media"), { status: 500 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": photo.mime_type || "application/octet-stream",
        "Cache-Control": "no-store, no-cache, must-revalidate, private",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'",
      },
    });
  } catch (error) {
    return NextResponse.json(
      fail(error instanceof Error ? error.message : "Stream failed"),
      { status: 500 }
    );
  }
}
