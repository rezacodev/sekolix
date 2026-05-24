import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface LessonTimeItem {
  session: number;
  startTime: string;
  endTime: string;
  isBreak: boolean;
  breakLabel: string | null;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lessonTimes = await prisma.lessonTime.findMany({
      where: {
        is_active: true,
        deleted_at: null
      },
      orderBy: [
        { day: 'asc' },
        { session: 'asc' }
      ]
    });

    // Group by day
    const groupedByDay = lessonTimes.reduce((acc, lt) => {
      if (!acc[lt.day]) {
        acc[lt.day] = [];
      }
      acc[lt.day].push({
        session: lt.session,
        startTime: lt.start_time,
        endTime: lt.end_time,
        isBreak: lt.is_break,
        breakLabel: lt.break_label
      });
      return acc;
    }, {} as Record<string, LessonTimeItem[]>);

    return NextResponse.json(groupedByDay);
  } catch (error) {
    console.error("Error fetching lesson times:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
