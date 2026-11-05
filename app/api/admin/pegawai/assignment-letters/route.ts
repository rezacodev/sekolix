import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";
import { generateAssignmentLetterNumber, getStaffIdForUser } from "@/lib/staff-ops/server";

const assignmentSchema = z.object({
  staffId: z.string().min(1),
  letterNumber: z.string().trim().max(80).optional().nullable(),
  title: z.string().trim().min(2).max(180),
  assignmentType: z.string().trim().max(80).default("SURAT_TUGAS"),
  issuedAt: z.coerce.date(),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
  fileUrl: z.string().trim().url().optional().nullable(),
  moduleSource: z.string().trim().max(80).default("PEGAWAI"),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export async function GET() {
  const access = await requireApiPermission("read", "pegawai");
  if (!access.ok) return access.response;

  const letters = await db.staffAssignmentLetter.findMany({
    include: { staff: { select: { id: true, name: true, nip: true } }, creator: { select: { name: true } } },
    orderBy: { issued_at: "desc" },
    take: 300,
  });
  return NextResponse.json({ data: letters });
}

export async function POST(request: Request) {
  const access = await requireApiPermission("create", "pegawai");
  if (!access.ok) return access.response;

  const parsed = assignmentSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  }

  const [staff, creatorId] = await Promise.all([
    db.staff.findFirst({ where: { id: parsed.data.staffId, deleted_at: null } }),
    getStaffIdForUser(access.context.user.id),
  ]);
  if (!staff) return NextResponse.json({ error: "Pegawai tidak ditemukan" }, { status: 404 });

  const letterNumber = parsed.data.letterNumber?.toUpperCase() || generateAssignmentLetterNumber("ST");
  const letter = await db.staffAssignmentLetter.create({
    data: {
      staff_id: staff.id,
      letter_number: letterNumber,
      title: parsed.data.title,
      assignment_type: parsed.data.assignmentType,
      issued_at: parsed.data.issuedAt,
      start_date: parsed.data.startDate ?? null,
      end_date: parsed.data.endDate ?? null,
      file_url: parsed.data.fileUrl ?? null,
      module_source: parsed.data.moduleSource,
      created_by: creatorId,
      notes: parsed.data.notes ?? null,
    },
  });

  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "pegawai",
    action: "create_assignment_letter",
    entityType: "StaffAssignmentLetter",
    entityId: letter.id,
    metadata: { staffName: staff.name, letterNumber: letter.letter_number, moduleSource: letter.module_source },
    request,
  });
  await writeAuditTrail({
    actorUserId: access.context.user.id,
    entityType: "StaffAssignmentLetter",
    entityId: letter.id,
    action: "create",
    after: letter,
  });

  return NextResponse.json({ data: letter }, { status: 201 });
}

