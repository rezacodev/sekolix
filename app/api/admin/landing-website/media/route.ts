import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import cloudinary from "@/lib/storage";

// GET - Get all media
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // filter by type (image, video, raw)
    const search = searchParams.get("search"); // search by title or description

    const whereClause: {
      type?: string;
      OR?: Array<{
        title?: { contains: string; mode: "insensitive" };
        description?: { contains: string; mode: "insensitive" };
      }>;
    } = {};

    if (type) {
      whereClause.type = type;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } }
      ];
    }

    const media = await db.media.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
  }
}

// POST - Upload media to Cloudinary and save to database
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const folder = (formData.get("folder") as string) || "landing_media";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataURI = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(dataURI, {
      folder: folder,
      resource_type: "auto" // auto-detect resource type (image, video, raw)
    });

    // Save to database
    const media = await db.media.create({
      data: {
        title: title || file.name,
        description: description || null,
        url: uploadResponse.secure_url,
        publicId: uploadResponse.public_id,
        type: uploadResponse.resource_type,
        folder: folder,
        size: uploadResponse.bytes,
        width: uploadResponse.width || null,
        height: uploadResponse.height || null,
        format: uploadResponse.format
      }
    });

    return NextResponse.json(media, { status: 201 });
  } catch (error) {
    console.error("Error uploading media:", error);
    return NextResponse.json({ error: "Failed to upload media" }, { status: 500 });
  }
}

// PUT - Update media metadata
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, description } = body;

    if (!id) {
      return NextResponse.json({ error: "Media ID is required" }, { status: 400 });
    }

    const media = await db.media.update({
      where: { id },
      data: {
        title: title || undefined,
        description: description || undefined
      }
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error("Error updating media:", error);
    return NextResponse.json({ error: "Failed to update media" }, { status: 500 });
  }
}
