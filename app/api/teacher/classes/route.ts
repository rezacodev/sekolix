import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch classes for logged-in teacher
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.staffRole !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const staffId = session.user.staffId!;

    // Get classes that this teacher teaches
    const teacherSubjects = await prisma.teacherSubject.findMany({
      where: {
        teacher_id: staffId,
        deleted_at: null,
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      distinct: ["class_id"],
    });

    // Extract unique classes
    const classes = teacherSubjects.map((ts) => ({
      id: Number(ts.class.id),
      name: ts.class.name,
    }));

    return NextResponse.json({ classes });
  } catch (error) {
    console.error("Error fetching teacher classes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
