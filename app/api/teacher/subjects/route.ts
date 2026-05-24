import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch subjects for logged-in teacher
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.staffRole !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const staffId = session.user.staffId!;

    // Get subjects that this teacher teaches
    const teacherSubjects = await prisma.teacherSubject.findMany({
      where: {
        teacher_id: staffId,
        deleted_at: null,
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            is_practice: true,
          },
        },
      },
      distinct: ["subject_id"],
    });

    // Extract unique subjects
    const subjects = teacherSubjects.map((ts) => ({
      id: Number(ts.subject.id),
      name: ts.subject.name,
      code: ts.subject.code,
      isPractice: ts.subject.is_practice,
    }));

    return NextResponse.json({ subjects });
  } catch (error) {
    console.error("Error fetching teacher subjects:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
