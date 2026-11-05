import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";
import { generateMemberCode } from "@/lib/library/server";

const memberSchema = z.object({
  type: z.enum(["STUDENT", "STAFF"]),
  studentId: z.string().optional().nullable(),
  staffId: z.string().optional().nullable(),
  name: z.string().trim().min(2).max(160),
  email: z.string().trim().email().optional().nullable(),
  phone: z.string().trim().max(32).optional().nullable(),
});

async function syncMembers() {
  const [students, staff] = await Promise.all([
    db.pesertaDidik.findMany({ where: { deleted_at: null }, select: { id: true, fullName: true, email: true, phone: true, mobile: true } }),
    db.staff.findMany({ where: { deleted_at: null, isActive: true }, select: { id: true, name: true, email: true, phone: true } }),
  ]);

  let created = 0;
  for (const student of students) {
    const existing = await db.libraryMember.findFirst({ where: { student_id: student.id } });
    if (existing) continue;
    await db.libraryMember.create({
      data: {
        member_code: generateMemberCode("STUDENT"),
        type: "STUDENT",
        student_id: student.id,
        name: student.fullName,
        email: student.email,
        phone: student.mobile ?? student.phone,
      },
    });
    created += 1;
  }

  for (const item of staff) {
    const existing = await db.libraryMember.findFirst({ where: { staff_id: item.id } });
    if (existing) continue;
    await db.libraryMember.create({
      data: {
        member_code: generateMemberCode("STAFF"),
        type: "STAFF",
        staff_id: item.id,
        name: item.name,
        email: item.email,
        phone: item.phone,
      },
    });
    created += 1;
  }

  return created;
}

export async function GET() {
  const access = await requireApiPermission("read", "perpustakaan");
  if (!access.ok) return access.response;

  const members = await db.libraryMember.findMany({
    include: {
      student: { select: { id: true, fullName: true, nisn: true } },
      staff: { select: { id: true, name: true, position: true } },
      loans: { where: { status: { in: ["ACTIVE", "OVERDUE"] } } },
    },
    orderBy: [{ status: "asc" }, { name: "asc" }],
    take: 500,
  });
  return NextResponse.json({ data: members });
}

export async function POST(request: Request) {
  const access = await requireApiPermission("create", "perpustakaan");
  if (!access.ok) return access.response;

  const body = await request.json();
  if (body?.sync === true) {
    const created = await syncMembers();
    await logActivity({
      actorUserId: access.context.user.id,
      actorName: access.context.user.name,
      module: "perpustakaan",
      action: "sync_members",
      entityType: "LibraryMember",
      metadata: { created },
      request,
    });
    return NextResponse.json({ data: { created } }, { status: 201 });
  }

  const parsed = memberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  }

  const member = await db.libraryMember.create({
    data: {
      member_code: generateMemberCode(parsed.data.type),
      type: parsed.data.type,
      student_id: parsed.data.studentId ?? null,
      staff_id: parsed.data.staffId ?? null,
      name: parsed.data.name,
      email: parsed.data.email ?? null,
      phone: parsed.data.phone ?? null,
    },
  });

  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "perpustakaan",
    action: "create_member",
    entityType: "LibraryMember",
    entityId: member.id,
    metadata: { type: member.type, memberCode: member.member_code },
    request,
  });
  await writeAuditTrail({
    actorUserId: access.context.user.id,
    entityType: "LibraryMember",
    entityId: member.id,
    action: "create",
    after: member,
  });

  return NextResponse.json({ data: member }, { status: 201 });
}
