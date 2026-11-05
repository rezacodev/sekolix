import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiPermission } from "@/lib/api/guards";

export async function GET() {
  try {
    const access = await requireApiPermission("read", "akademik.jadwal");
    if (!access.ok) return access.response;

    const rooms = await prisma.room.findMany({
      where: {
        is_active: true,
        deleted_at: null
      },
      orderBy: [
        { code: 'asc' }
      ],
      select: {
        id: true,
        code: true,
        name: true,
        type: true,
        floor: true,
        building: true,
        capacity: true
      }
    });

    const serializedRooms = rooms.map(room => ({
      id: Number(room.id),
      code: room.code,
      name: room.name,
      type: room.type,
      floor: room.floor,
      building: room.building,
      capacity: room.capacity
    }));

    return NextResponse.json(serializedRooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json(
      { error: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}
