import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || "0");
    const pageSize = Number(url.searchParams.get("pageSize") || "10");
    const search = url.searchParams.get("search") || "";

    const whereBase: Prisma.PageWhereInput = {};
    if (search) whereBase.title = { contains: search, mode: "insensitive" };

    const totalCount = await db.page.count({ where: whereBase });

    const items = await db.page.findMany({
      where: whereBase,
      orderBy: { createdAt: "desc" },
      skip: page * pageSize,
      take: pageSize,
    });

    return NextResponse.json({ items, totalCount, page, pageSize });
  } catch (error) {
    console.error("Error fetching pages:", error);
    return NextResponse.json(
      { error: "Failed to fetch pages" },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    { error: "Membuat halaman baru tidak diizinkan. Hanya 5 halaman profil yang tersedia." },
    { status: 403 }
  );
}
