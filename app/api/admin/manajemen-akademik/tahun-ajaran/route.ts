import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const createSchema = z.object({
  label: z.string().min(1),
  yearCode: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().optional(),
  registrationFee: z.number().int().optional()
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "0");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");
  const search = searchParams.get("search") || "";
  const isActive = searchParams.get("isActive");

  const where: {
    label?: { contains: string; mode: "insensitive" };
    isActive?: boolean;
    deleted_at: null;
  } = { deleted_at: null };

  if (search) where.label = { contains: search, mode: "insensitive" };
  if (isActive !== null) where.isActive = isActive === "true";

  const [data, totalCount] = await Promise.all([
    prisma.tahunAjaran.findMany({
      where,
      skip: page * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" }
    }),
    prisma.tahunAjaran.count({ where })
  ]);

  return NextResponse.json({ data, totalCount });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createSchema.parse(body);

    const tahunAjaran = await prisma.tahunAjaran.create({
      data: {
        ...validated,
        startDate: validated.startDate ? new Date(validated.startDate) : null,
        endDate: validated.endDate ? new Date(validated.endDate) : null
      }
    });

    return NextResponse.json(tahunAjaran, { status: 201 });
  } catch (error) {
    console.error("Error creating tahun ajaran:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Failed to create tahun ajaran" }, { status: 500 });
  }
}
