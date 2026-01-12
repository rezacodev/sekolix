import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Get single lesson time
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lessonTime = await prisma.lessonTime.findUnique({
      where: { id: BigInt(id) }
    });

    if (!lessonTime) {
      return NextResponse.json(
        { error: "Lesson time not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ...lessonTime, id: Number(lessonTime.id) });
  } catch (error) {
    console.error("Error fetching lesson time:", error);
    return NextResponse.json(
      { error: "Failed to fetch lesson time" },
      { status: 500 }
    );
  }
}

// PUT - Update lesson time
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
          deleted_at: null,
          id: { not: BigInt(id) }
        }
      });
      if (existing) {
        return NextResponse.json(
          { error: `Jam ke-${session} pada hari ini sudah ada` },
          { status: 400 }
        );
      }
    }

    const lessonTime = await prisma.lessonTime.update({
      where: { id: BigInt(id) },
      data: {
        day,
        session: session || 0,
        start_time,
        end_time,
        is_break,
        break_label,
        is_active
      }
    });

    return NextResponse.json({ ...lessonTime, id: Number(lessonTime.id) });
  } catch (error) {
    console.error("Error updating lesson time:", error);
    return NextResponse.json(
      { error: "Failed to update lesson time" },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete lesson time
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.lessonTime.update({
      where: { id: BigInt(id) },
      data: { deleted_at: new Date() }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting lesson time:", error);
    return NextResponse.json(
      { error: "Failed to delete lesson time" },
      { status: 500 }
    );
  }
}
