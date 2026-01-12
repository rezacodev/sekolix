import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const createSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional()
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "0");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");
  const search = searchParams.get("search") || "";

  const where: {
    name?: { contains: string; mode: "insensitive" };
    deleted_at: null;
  } = { deleted_at: null };
  if (search) where.name = { contains: search, mode: "insensitive" };

  const [data, totalCount] = await Promise.all([
    prisma.curriculum.findMany({
      where,
      skip: page * pageSize,
      take: pageSize,
      orderBy: { id: "desc" }
    }),
    prisma.curriculum.count({ where })
  ]);

  // Convert BigInt to number for JSON serialization
  const serializedData = data.map(item => ({
    ...item,
    id: Number(item.id)
  }));

  return NextResponse.json({ data: serializedData, totalCount });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createSchema.parse(body);
    const curriculum = await prisma.curriculum.create({ data: validated });

    // Convert BigInt to number for JSON serialization
    const serializedCurriculum = {
      ...curriculum,
      id: Number(curriculum.id)
    };

    return NextResponse.json(serializedCurriculum, { status: 201 });
  } catch (error) {
    console.error("Error creating curriculum:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Failed to create curriculum" }, { status: 500 });
  }
}
