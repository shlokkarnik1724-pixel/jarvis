import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { DEMO_MODE } from "@/lib/config";
import { getSessionContext, requireCircleId } from "@/lib/session";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { fail, ok } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const session = await getSessionContext();
    if (!session) {
      return NextResponse.json(fail("Unauthorized"), { status: 401 });
    }

    if (DEMO_MODE || session.demo) {
      return NextResponse.json(
        fail("Photo upload requires a real Supabase account (not demo mode)"),
        { status: 400 }
      );
    }

    const circleId = requireCircleId(session);
    const form = await request.formData();
    const file = form.get("file");
    const caption = String(form.get("caption") ?? "").trim();

    if (!(file instanceof File)) {
      return NextResponse.json(fail("file is required"), { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(fail("Only image uploads are allowed"), {
        status: 400,
      });
    }

    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json(fail("Max upload size is 8MB"), { status: 400 });
    }

    const ext = file.type.split("/")[1] || "jpg";
    const photoId = randomUUID();
    const storagePath = `${circleId}/${photoId}.${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    const service = await createServiceClient();
    const { error: uploadError } = await service.storage
      .from("vault")
      .upload(storagePath, bytes, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(fail(uploadError.message), { status: 500 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("photos")
      .insert({
        id: photoId,
        circle_id: circleId,
        uploader_id: session.user.id,
        storage_path: storagePath,
        mime_type: file.type,
        caption_enc: caption || null,
      })
      .select("id, circle_id, uploader_id, mime_type, created_at")
      .single();

    if (error || !data) {
      return NextResponse.json(fail(error?.message ?? "Failed to save photo"), {
        status: 500,
      });
    }

    return NextResponse.json(
      ok({
        id: data.id,
        circleId: data.circle_id,
        uploaderId: data.uploader_id,
        uploaderName: session.user.name,
        mimeType: data.mime_type,
        createdAt: data.created_at,
        captionHint: caption || null,
      })
    );
  } catch (error) {
    return NextResponse.json(
      fail(error instanceof Error ? error.message : "Upload failed"),
      { status: 500 }
    );
  }
}
