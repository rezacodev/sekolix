import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { fromYear: { label: { contains: search } } },
            { toYear: { label: { contains: search } } }
          ]
        }
      : {};

    const [batches, total] = await Promise.all([
      prisma.transferBatch.findMany({
        where,
        include: {
          fromYear: { select: { label: true } },
          toYear: { select: { label: true } },
          _count: { select: { transfers: true } }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.transferBatch.count({ where })
    ]);

    return NextResponse.json({
      data: batches,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching transfer batches:", error);
    return NextResponse.json({ error: "Gagal memuat data transfer" }, { status: 500 });
  }
}
