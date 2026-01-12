import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Get single room
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const room = await prisma.room.findUnique({
      where: { id: BigInt(id) }
    });

    if (!room) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ...room, id: Number(room.id) });
  } catch (error) {
    console.error("Error fetching room:", error);
    return NextResponse.json(
      { error: "Failed to fetch room" },
      { status: 500 }
    );
  }
}

// PUT - Update room
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { code, name, type, floor, building, capacity, facilities, description, is_active } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "Nama ruang harus diisi" },
        { status: 400 }
      );
    }

    // Check if code already exists (for different room)
    if (code) {
      const existing = await prisma.room.findFirst({
        where: {
          code,
          id: { not: BigInt(id) }
        }
      });
      if (existing) {
        return NextResponse.json(
          { error: "Kode ruang sudah digunakan" },
          { status: 400 }
        );
      }
    }

    const room = await prisma.room.update({
      where: { id: BigInt(id) },
      data: {
        code,
        name,
        type,
        floor,
        building,
        capacity,
        facilities,
        description,
        is_active
      }
    });

    return NextResponse.json({ ...room, id: Number(room.id) });
  } catch (error) {
    console.error("Error updating room:", error);
    return NextResponse.json(
      { error: "Failed to update room" },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete room
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.room.update({
      where: { id: BigInt(id) },
      data: { deleted_at: new Date() }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting room:", error);
    return NextResponse.json(
      { error: "Failed to delete room" },
      { status: 500 }
    );
  }
}
