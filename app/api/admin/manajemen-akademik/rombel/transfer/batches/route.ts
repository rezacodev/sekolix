import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiPermission } from "@/lib/api/guards";
import { parseInteger } from "@/lib/api/validation";

export async function GET(request: NextRequest) {
  try {
    const access = await requireApiPermission("read", "akademik.rombel");
    if (!access.ok) return access.response;

    const { searchParams } = new URL(request.url);
    const parsedPage = parseInteger(searchParams.get("page"), {
      field: "page",
      defaultValue: 1,
      min: 1,
    });
    if (!parsedPage.ok) return parsedPage.response;

    const parsedLimit = parseInteger(searchParams.get("limit"), {
      field: "limit",
      defaultValue: 10,
      min: 1,
      max: 100,
    });
    if (!parsedLimit.ok) return parsedLimit.response;

    const page = parsedPage.value;
    const limit = parsedLimit.value;
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
