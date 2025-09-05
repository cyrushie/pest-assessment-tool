import { put } from "@vercel/blob";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Check file size (20MB limit)
    const maxSize = 20 * 1024 * 1024; // 20MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 20MB limit" },
        { status: 400 }
      );
    }

    // Check file type (images and videos only)
    const allowedTypes = ["image/", "video/"];
    const isAllowedType = allowedTypes.some((type) =>
      file.type.startsWith(type)
    );

    if (!isAllowedType) {
      return NextResponse.json(
        { error: "Only image and video files are allowed" },
        { status: 400 }
      );
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const filename = `pest-assessment-${timestamp}-${file.name}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
    });

    return NextResponse.json({
      url: blob.url,
      filename: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
