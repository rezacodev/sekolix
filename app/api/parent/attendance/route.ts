import { NextResponse } from "next/server";
import { z } from "zod";
import { requireParentContext, requireParentStudent, parentUnauthorized } from "@/lib/parent/server";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/governance/server";

const leaveRequestSchema = z.object({
  studentId: z.string().min(1),
  type: z.enum(["SAKIT", "IZIN"]),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  reason: z.string().min(5).max(1000),
  attachmentUrl: z.string().url().optional().nullable(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");
  if (!studentId) return NextResponse.json({ error: "studentId wajib diisi" }, { status: 400 });

  const access = await requireParentStudent(studentId);
  if (!access.ok) return access.response;

  const [records, leaveRequests] = await Promise.all([
    db.attendance.findMany({
      where: { student_id: studentId, deleted_at: null },
      include: {
        teacherSubject: { include: { subject: true } },
      },
      orderBy: [{ date: "desc" }, { meeting_number: "desc" }],
      take: 100,
    }),
    db.parentLeaveRequest.findMany({
      where: { parent_id: access.context.profile.id, student_id: studentId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({
    records: records.map((record) => ({
      id: String(record.id),
      date: record.date.toISOString(),
      meetingNumber: record.meeting_number,
      status: record.status,
      notes: record.notes,
      subject: record.teacherSubject.subject.name,
    })),
    leaveRequests,
  });
}

export async function POST(request: Request) {
  const context = await requireParentContext();
  if (!context) return parentUnauthorized();

  const parsed = leaveRequestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", details: parsed.error.flatten() }, { status: 400 });
  }

  const access = await requireParentStudent(parsed.data.studentId);
  if (!access.ok) return access.response;

  const leave = await db.parentLeaveRequest.create({
    data: {
      parent_id: context.profile.id,
      student_id: parsed.data.studentId,
      type: parsed.data.type,
      start_date: parsed.data.startDate,
      end_date: parsed.data.endDate,
      reason: parsed.data.reason,
      attachment_url: parsed.data.attachmentUrl ?? null,
    },
  });

  await logActivity({
    actorUserId: context.user.id,
    actorName: context.user.name,
    module: "parent.attendance",
    action: "create-leave-request",
    entityType: "ParentLeaveRequest",
    entityId: leave.id,
    metadata: { studentId: parsed.data.studentId, type: parsed.data.type },
    request,
  });

  return NextResponse.json(leave, { status: 201 });
}
