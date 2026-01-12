import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || "0");
    const pageSize = Number(url.searchParams.get("pageSize") || "10");
    const search = url.searchParams.get("search") || "";

    const whereBase: Prisma.EventWhereInput = {};
    if (search) whereBase.title = { contains: search, mode: "insensitive" };

    const totalCount = await db.event.count({ where: whereBase });

    const items = await db.event.findMany({
      where: whereBase,
      orderBy: { startDate: "desc" },
      skip: page * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        startDate: true,
        endDate: true,
        location: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({ items, totalCount, page, pageSize });
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, slug, description, startDate, endDate, location, image, isPublished } = body;

    const existing = await db.event.findUnique({
      where: { slug }
    });

    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }

    const event = await db.event.create({
      data: {
        title,
        slug,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        location: location || null,
        image: image || null,
        isPublished
      }
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Failed to create event:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
