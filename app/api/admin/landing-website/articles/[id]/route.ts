import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Check if article exists
    const existing = await db.article.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // If slug is being changed, check if new slug already exists
    if (body.slug && body.slug !== existing.slug) {
      const slugExists = await db.article.findUnique({
        where: { slug: body.slug }
      });

      if (slugExists) {
        return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
      }
    }

    // Prepare update data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt || null;
    if (body.image !== undefined) updateData.image = body.image || null;
    if (body.category !== undefined) updateData.category = body.category || null;
    if (body.isPublished !== undefined) {
      updateData.isPublished = body.isPublished;
      // Set publishedAt when publishing for the first time
      if (body.isPublished && !existing.publishedAt) {
        updateData.publishedAt = new Date();
      }
      // Clear publishedAt when unpublishing
      if (!body.isPublished) {
        updateData.publishedAt = null;
      }
    }

    const article = await db.article.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(article);
  } catch (error) {
    console.error("Failed to update article:", error);
    return NextResponse.json({ error: "Failed to update article" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await db.article.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete article:", error);
    return NextResponse.json({ error: "Failed to delete article" }, { status: 500 });
  }
}
