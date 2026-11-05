import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";
import { generateSummonLetterNumber, getStaffIdForUser } from "@/lib/bk/server";

const summonSchema = z.object({
  caseId: z.string().min(1),
  parentId: z.string().optional().nullable(),
  scheduledAt: z.coerce.date(),
  agenda: z.string().trim().min(5).max(3000),
  status: z.enum(["DRAFT", "SENT", "ATTENDED", "CANCELLED"]).default("DRAFT"),
  parentVisible: z.boolean().default(true),
});

export async function GET() {
  const access = await requireApiPermission("read", "bk");
  if (!access.ok) return access.response;

  const letters = await db.parentSummonLetter.findMany({
    include: {
      student: { select: { id: true, fullName: true, nisn: true } },
      parent: { select: { id: true, name: true, email: true, phone: true } },
      counselingCase: { select: { id: true, title: true, status: true } },
      creator: { select: { id: true, name: true } },
    },
    orderBy: { scheduled_at: "desc" },
    take: 200,
  });

  return NextResponse.json({ data: letters });
}

export async function POST(request: Request) {
  const access = await requireApiPermission("create", "bk");
  if (!access.ok) return access.response;

  const parsed = summonSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  }

  const counselingCase = await db.studentCounselingCase.findUnique({
    where: { id: parsed.data.caseId },
    include: { student: { include: { parentLinks: true } } },
  });
  if (!counselingCase) return NextResponse.json({ error: "Kasus BK tidak ditemukan" }, { status: 404 });

  const staffId = await getStaffIdForUser(access.context.user.id);
  const parentId = parsed.data.parentId ?? counselingCase.student.parentLinks[0]?.parent_id ?? null;
  const created = await db.parentSummonLetter.create({
    data: {
      case_id: counselingCase.id,
      student_id: counselingCase.student_id,
      parent_id: parentId,
      created_by: staffId,
      letter_number: generateSummonLetterNumber(),
      scheduled_at: parsed.data.scheduledAt,
      agenda: parsed.data.agenda,
      status: parsed.data.status,
      parent_visible: parsed.data.parentVisible,
    },
  });

  if (parentId && parsed.data.parentVisible) {
    await db.parentNotification.create({
      data: {
        parent_id: parentId,
        student_id: counselingCase.student_id,
        type: "BK",
        title: "Surat panggilan orang tua",
        message: `Surat panggilan ${created.letter_number} dijadwalkan pada ${created.scheduled_at.toLocaleDateString("id-ID")}.`,
        href: "/parent/perkembangan",
      },
    });
  }

  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "bk",
    action: "create_parent_summon",
    entityType: "ParentSummonLetter",
    entityId: created.id,
    metadata: { caseId: counselingCase.id, studentId: counselingCase.student_id, parentId },
    request,
  });
  await writeAuditTrail({
    actorUserId: access.context.user.id,
    entityType: "ParentSummonLetter",
    entityId: created.id,
    action: "create",
    after: created,
  });

  return NextResponse.json({ data: created }, { status: 201 });
}
