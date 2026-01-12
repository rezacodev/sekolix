import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const createSchema = z.object({
  name: z.string().min(1),
  code: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional().default(true)
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "0");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");
  const search = searchParams.get("search") || "";

  const where: {
    name?: { contains: string; mode: "insensitive" };
    isActive: boolean;
  } = { isActive: true };
  if (search) where.name = { contains: search, mode: "insensitive" };

  const [data, totalCount] = await Promise.all([
    prisma.program.findMany({
      where,
      skip: page * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" }
    }),
    prisma.program.count({ where })
  ]);

  return NextResponse.json({ data, totalCount });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createSchema.parse(body);
    const program = await prisma.program.create({
      data: validated
    });

    return NextResponse.json({ data: program });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
