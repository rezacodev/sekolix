import { NextResponse } from "next/server";
import { z } from "zod";
import { requireParentContext, requireParentStudent, parentUnauthorized } from "@/lib/parent/server";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/governance/server";

const messageSchema = z.object({
  studentId: z.string().min(1),
  teacherId: z.string().min(1).optional().nullable(),
  subject: z.string().min(3).max(150),
  content: z.string().min(10).max(2000),
});

export async function GET() {
  const context = await requireParentContext();
  if (!context) return parentUnauthorized();

  const messages = await db.parentTeacherMessage.findMany({
    where: { parent_id: context.profile.id },
    include: {
      student: { select: { fullName: true } },
      teacher: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({
    messages: messages.map((message) => ({
      id: message.id,
      studentId: message.student_id,
      studentName: message.student.fullName,
      teacherName: message.teacher?.name ?? "Wali kelas/guru terkait",
      subject: message.subject,
      content: message.content,
      response: message.response,
      status: message.status,
      createdAt: message.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: Request) {
  const context = await requireParentContext();
  if (!context) return parentUnauthorized();

  const parsed = messageSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", details: parsed.error.flatten() }, { status: 400 });
  }

  const access = await requireParentStudent(parsed.data.studentId);
  if (!access.ok) return access.response;

  const message = await db.parentTeacherMessage.create({
    data: {
      parent_id: context.profile.id,
      student_id: parsed.data.studentId,
      teacher_id: parsed.data.teacherId ?? null,
      subject: parsed.data.subject,
      content: parsed.data.content,
    },
  });

  await logActivity({
    actorUserId: context.user.id,
    actorName: context.user.name,
    module: "parent.messages",
    action: "create",
    entityType: "ParentTeacherMessage",
    entityId: message.id,
    metadata: { studentId: parsed.data.studentId, teacherId: parsed.data.teacherId ?? null },
    request,
  });

  return NextResponse.json(message, { status: 201 });
}
