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

    const existing = await db.gallery.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Gallery item not found" },
        { status: 404 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.image !== undefined) updateData.image = body.image;
    if (body.album !== undefined) updateData.albumId = body.album && body.album !== 'none' ? body.album : null;

    const newOrder = body.order as number | undefined;

    const gallery = await db.$transaction(async (tx) => {
      if (newOrder !== undefined && newOrder !== existing.order) {
        if (newOrder < existing.order) {
          // Moving up: push down items between newOrder and current-1
          await tx.gallery.updateMany({
            where: {
              order: {
                gte: newOrder,
                lt: existing.order,
              },
            },
            data: { order: { increment: 1 } },
          });
        } else {
          // Moving down: pull up items between current+1 and newOrder
          await tx.gallery.updateMany({
            where: {
              order: {
                gt: existing.order,
                lte: newOrder,
              },
            },
            data: { order: { decrement: 1 } },
          });
        }
        updateData.order = newOrder;
      }

      return tx.gallery.update({
        where: { id },
        data: updateData,
        include: {
          album: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });

    return NextResponse.json(gallery);
  } catch (error) {
    console.error("Failed to update gallery item:", error);
    return NextResponse.json(
      { error: "Failed to update gallery item" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get the gallery item to find its order
    const gallery = await db.gallery.findUnique({
      where: { id },
      select: { order: true },
    });

    if (!gallery) {
      return NextResponse.json(
        { error: "Gallery item not found" },
        { status: 404 }
      );
    }

    // Delete and reorder in a transaction
    await db.$transaction(async (tx) => {
      // Delete the item
      await tx.gallery.delete({
        where: { id },
      });

      // Pull up all items with higher order numbers
      await tx.gallery.updateMany({
        where: {
          order: {
            gt: gallery.order,
          },
        },
        data: { order: { decrement: 1 } },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete gallery item:", error);
    return NextResponse.json(
      { error: "Failed to delete gallery item" },
      { status: 500 }
    );
  }
}
