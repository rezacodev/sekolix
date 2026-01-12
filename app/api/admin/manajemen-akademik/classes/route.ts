import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const createSchema = z.object({
  name: z.string().min(1)
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "0");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");
  const search = searchParams.get("search") || "";

  // Get school identity to determine school level
  const schoolIdentity = await prisma.schoolIdentity.findFirst();
  if (!schoolIdentity?.schoolLevel) {
    return NextResponse.json({ data: [], totalCount: 0 });
  }

  // Define classes based on school level
  const classNames: Record<string, string[]> = {
    SD: ["1", "2", "3", "4", "5", "6"],
    MI: ["1", "2", "3", "4", "5", "6"],
    SMP: ["7", "8", "9"],
    MTS: ["7", "8", "9"],
    SMA: ["10", "11", "12"],
    MA: ["10", "11", "12"],
    SMK: ["10", "11", "12"]
  };

  const availableClasses = classNames[schoolIdentity.schoolLevel] || [];

  const where: {
    name?: { in: string[] };
    deleted_at: null;
  } = { deleted_at: null, name: { in: availableClasses } };

  if (search) {
    where.name = {
      in: availableClasses.filter(name => name.includes(search))
    };
  }

  const [data, totalCount] = await Promise.all([
    prisma.class.findMany({
      where,
      skip: page * pageSize,
      take: pageSize,
      orderBy: { name: "asc" }
    }),
    prisma.class.count({ where })
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
    const classData = await prisma.class.create({
      data: validated
    });

    // Convert BigInt to number for JSON serialization
    const serializedClass = {
      ...classData,
      id: Number(classData.id)
    };

    return NextResponse.json(serializedClass, { status: 201 });
  } catch (error) {
    console.error("Error creating class:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Failed to create class" }, { status: 500 });
  }
}
