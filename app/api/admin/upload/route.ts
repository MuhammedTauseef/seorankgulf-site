import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/admin/upload — upload a file to Supabase Storage.
 * Admin only. Accepts multipart form data with a "file" field.
 * Returns { url } — the public URL of the uploaded file.
 *
 * Used by the video admin form for direct video/poster uploads.
 */

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
];

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const MAX_VIDEO_BYTES = 200 * 1024 * 1024; // 200MB
const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  // Admin check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if ((profile as { role?: string } | null)?.role !== "admin") {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const kind = String(formData.get("kind") || "video"); // "video" | "poster"
  const isVideo = kind === "video";

  // Validate type
  const allowedTypes = isVideo ? ALLOWED_VIDEO_TYPES : ALLOWED_IMAGE_TYPES;
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      {
        error: isVideo
          ? "Only MP4, WebM, MOV, or AVI videos allowed."
          : "Only JPG, PNG, WebP, or GIF images allowed.",
      },
      { status: 400 }
    );
  }

  // Validate size
  const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > maxBytes) {
    return NextResponse.json(
      {
        error: `File too large. Max ${isVideo ? "200MB" : "10MB"}.`,
      },
      { status: 400 }
    );
  }

  // Generate safe filename
  const ext = file.name.split(".").pop()?.toLowerCase() || (isVideo ? "mp4" : "png");
  const safeName = file.name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50) || "upload";
  const filename = `${Date.now()}-${safeName}.${ext}`;

  // Upload to Supabase Storage
  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from("videos")
    .upload(filename, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("[upload] failed:", uploadError.message);
    return NextResponse.json(
      { error: "Upload failed. " + uploadError.message },
      { status: 500 }
    );
  }

  // Get public URL
  const { data: urlData } = supabase.storage.from("videos").getPublicUrl(filename);

  return NextResponse.json({ url: urlData.publicUrl, filename });
}
