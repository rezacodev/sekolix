import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

async function getStaffId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.staffId) return null;
  return session.user.staffId;
}

const kirimSchema = z.object({
  studentIds: z.array(z.string()).min(1),
  subject: z.string().optional(),
  content: z.string().min(1),
});

// POST /api/teacher/komunikasi/orang-tua/kirim — send message to parents of selected students
export async function POST(request: Request) {
  try {
    const staffId = await getStaffId();
    if (!staffId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const parsed = kirimSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation error", details: parsed.error.flatten() }, { status: 400 });
    }

    const { studentIds, subject, content } = parsed.data;

    // Verify teacher has access to these students
    const teacherSubjects = await prisma.teacherSubject.findMany({
      where: { teacher_id: staffId, deleted_at: null },
      include: {
        rombel: {
          select: {
            students: {
              where: { deleted_at: null, id: { in: studentIds } },
              select: { id: true, fullName: true, fatherName: true, motherName: true, guardianName: true },
            },
          },
        },
      },
    });

    const authorizedStudents = teacherSubjects
      .flatMap((ts) => ts.rombel?.students ?? [])
      .filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i);

    if (authorizedStudents.length === 0) {
      return NextResponse.json({ error: "No authorized students found" }, { status: 403 });
    }

    // Send a message per student (receiver_id = student id, receiver_type = PARENT)
    const messages = await Promise.all(
      authorizedStudents.map((student) =>
        prisma.message.create({
          data: {
            sender_id: staffId,
            sender_type: "TEACHER",
            receiver_id: student.id,
            receiver_type: "PARENT",
            subject: subject ?? null,
            content,
          },
        })
      )
    );

    return NextResponse.json(
      {
        sent: messages.length,
        students: authorizedStudents.map((s) => ({
          id: s.id,
          fullName: s.fullName,
          parent: s.fatherName ?? s.motherName ?? s.guardianName ?? null,
        })),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error sending message to parents:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
