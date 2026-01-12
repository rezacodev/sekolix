import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DayOfWeek, Prisma } from "@prisma/client";

// GET - List all lesson times with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const search = searchParams.get("search") || "";
    const day = searchParams.get("day") || "";
    const is_break = searchParams.get("is_break") || "";
    const is_active = searchParams.get("is_active") || "";

    const where: Prisma.LessonTimeWhereInput = {
      deleted_at: null
    };

    // Search filter (for break_label)
    if (search) {
      where.break_label = { contains: search, mode: "insensitive" };
    }

    // Day filter
    if (day && day !== "all" && Object.values(DayOfWeek).includes(day as DayOfWeek)) {
      where.day = day as DayOfWeek;
    }

    // Break filter
    if (is_break && is_break !== "all") {
      where.is_break = is_break === "true";
    }

    // Active status filter
    if (is_active && is_active !== "all") {
      where.is_active = is_active === "true";
    }

    const [data, totalCount] = await Promise.all([
      prisma.lessonTime.findMany({
        where,
        skip: page * pageSize,
        take: pageSize,
        orderBy: [
          { day: "asc" },
          { session: "asc" }
        ]
      }),
      prisma.lessonTime.count({ where })
    ]);

    // Convert BigInt to Number for JSON serialization
    const serializedData = data.map(lesson => ({
      ...lesson,
      id: Number(lesson.id)
    }));

    return NextResponse.json({ data: serializedData, totalCount });
  } catch (error) {
    console.error("Error fetching lesson times:", error);
    return NextResponse.json(
      { error: "Failed to fetch lesson times" },
      { status: 500 }
    );
  }
}

// POST - Create new lesson time
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { day, session, start_time, end_time, is_break, break_label, is_active } = body;

    // Validate required fields
    if (!day || !start_time || !end_time) {
      return NextResponse.json(
        { error: "Hari, waktu mulai, dan waktu selesai harus diisi" },
        { status: 400 }
      );
    }

    if (!is_break && !session) {
      return NextResponse.json(
        { error: "Jam ke- harus diisi untuk jam pelajaran" },
        { status: 400 }
      );
    }

    // Check for duplicate day + session (for non-break lessons)
    if (!is_break) {
      const existing = await prisma.lessonTime.findFirst({
        where: {
          day,
          session,
          is_break: false,
          deleted_at: null
        }
      });
      if (existing) {
        return NextResponse.json(
          { error: `Jam ke-${session} pada hari ini sudah ada` },
          { status: 400 }
        );
      }
    }

    const lessonTime = await prisma.lessonTime.create({
      data: {
        day,
        session: session || 0,
        start_time,
        end_time,
        is_break: is_break ?? false,
        break_label,
        is_active: is_active ?? true
      }
    });

    return NextResponse.json({ ...lessonTime, id: Number(lessonTime.id) }, { status: 201 });
  } catch (error) {
    console.error("Error creating lesson time:", error);
    return NextResponse.json(
      { error: "Failed to create lesson time" },
      { status: 500 }
    );
  }
}
