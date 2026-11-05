import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";

const memberSchema = z.object({
  extracurricularId: z.string().min(1),
  studentId: z.string().min(1),
  status: z.enum(["REGISTERED", "ACTIVE", "INACTIVE", "ALUMNI"]).default("ACTIVE"),
  joinedAt: z.coerce.date().optional(),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export async function GET() {
  const access = await requireApiPermission("read", "ekstrakurikuler");
  if (!access.ok) return access.response;
  const members = await db.extracurricularMember.findMany({ include: { extracurricular: true, student: true }, orderBy: { updatedAt: "desc" }, take: 500 });
  return NextResponse.json({ data: members });
}

export async function POST(request: Request) {
  const access = await requireApiPermission("create", "ekstrakurikuler");
  if (!access.ok) return access.response;
  const parsed = memberSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  const [club, student] = await Promise.all([db.extracurricular.findUnique({ where: { id: parsed.data.extracurricularId } }), db.pesertaDidik.findUnique({ where: { id: parsed.data.studentId } })]);
  if (!club) return NextResponse.json({ error: "Ekskul tidak ditemukan" }, { status: 404 });
  if (!student) return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });
  const member = await db.extracurricularMember.upsert({
    where: { extracurricular_id_student_id: { extracurricular_id: club.id, student_id: student.id } },
    update: { status: parsed.data.status, joined_at: parsed.data.joinedAt ?? new Date(), notes: parsed.data.notes ?? null },
    create: { extracurricular_id: club.id, student_id: student.id, status: parsed.data.status, joined_at: parsed.data.joinedAt ?? new Date(), notes: parsed.data.notes ?? null },
  });
  await logActivity({ actorUserId: access.context.user.id, actorName: access.context.user.name, module: "ekstrakurikuler", action: "upsert_member", entityType: "ExtracurricularMember", entityId: member.id, metadata: { club: club.name, student: student.fullName }, request });
  await writeAuditTrail({ actorUserId: access.context.user.id, entityType: "ExtracurricularMember", entityId: member.id, action: "upsert", after: member });
  return NextResponse.json({ data: member }, { status: 201 });
}

