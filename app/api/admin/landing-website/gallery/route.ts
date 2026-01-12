import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const galleries = await db.gallery.findMany({
      include: {
        album: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { order: "asc" }
    });

    // Map response to include both albumId and album name
    const response = galleries.map(g => ({
      ...g,
      albumName: g.album?.name || null
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to fetch galleries:", error);
    return NextResponse.json({ error: "Failed to fetch galleries" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, image, album, order } = body;

    const desiredOrder = typeof order === "number" ? order : 1;

    const gallery = await db.$transaction(async tx => {
      // Shift existing items down to make room
      await tx.gallery.updateMany({
        where: {
          order: {
            gte: desiredOrder
          }
        },
        data: {
          order: { increment: 1 }
        }
      });

      // Create new item at desired position
      return tx.gallery.create({
        data: {
          title,
          image,
          albumId: album && album !== "none" ? album : null,
          order: desiredOrder
        },
        include: {
          album: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });
    });

    return NextResponse.json(gallery, { status: 201 });
  } catch (error) {
    console.error("Failed to create gallery item:", error);
    return NextResponse.json({ error: "Failed to create gallery item" }, { status: 500 });
  }
}
