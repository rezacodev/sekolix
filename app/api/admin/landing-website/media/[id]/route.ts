import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteFromCloudinary } from "@/lib/storage";

// DELETE - Delete media from Cloudinary and database
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Media ID is required" }, { status: 400 });
    }

    // Get media from database
    const media = await db.media.findUnique({
      where: { id }
    });

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // Try to delete from Cloudinary first, but don't fail if it errors
    try {
      const cloudinaryResult = await deleteFromCloudinary(media.publicId, media.type);
    } catch (cloudinaryError) {
      console.error("Cloudinary delete failed (continuing anyway):", cloudinaryError);
      // Continue to delete from database even if Cloudinary fails
    }

    // Delete from database
    await db.media.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Media deleted successfully" });
  } catch (error: unknown) {
    console.error("Error deleting media:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to delete media";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
