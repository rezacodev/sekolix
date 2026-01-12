import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RoomType, Prisma } from "@prisma/client";

// GET - List all rooms with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const is_active = searchParams.get("is_active") || "";

    const where: Prisma.RoomWhereInput = {
      deleted_at: null
    };

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } }
      ];
    }

    // Type filter
    if (type && type !== "all" && Object.values(RoomType).includes(type as RoomType)) {
      where.type = type as RoomType;
    }

    // Active status filter
    if (is_active && is_active !== "all") {
      where.is_active = is_active === "true";
    }

    const [data, totalCount] = await Promise.all([
      prisma.room.findMany({
        where,
        skip: page * pageSize,
        take: pageSize,
        orderBy: [
          { building: "asc" },
          { floor: "asc" },
          { name: "asc" }
        ]
      }),
      prisma.room.count({ where })
    ]);

    // Convert BigInt to Number for JSON serialization
    const serializedData = data.map(room => ({
      ...room,
      id: Number(room.id)
    }));

    return NextResponse.json({ data: serializedData, totalCount });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json(
      { error: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}

// POST - Create new room
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, name, type, floor, building, capacity, facilities, description, is_active } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "Nama ruang harus diisi" },
        { status: 400 }
      );
    }

    // Check if code already exists
    if (code) {
      const existing = await prisma.room.findUnique({
        where: { code }
      });
      if (existing) {
        return NextResponse.json(
          { error: "Kode ruang sudah digunakan" },
          { status: 400 }
        );
      }
    }

    const room = await prisma.room.create({
      data: {
        code,
        name,
        type,
        floor,
        building,
        capacity,
        facilities,
        description,
        is_active: is_active ?? true
      }
    });

    return NextResponse.json({ ...room, id: Number(room.id) }, { status: 201 });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}
