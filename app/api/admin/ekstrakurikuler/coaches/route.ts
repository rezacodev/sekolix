import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";

const coachSchema = z.object({
  extracurricularId: z.string().min(1),
  staffId: z.string().min(1),
  role: z.string().trim().max(80).default("PEMBINA"),
  isPrimary: z.coerce.boolean().default(false),
});

export async function GET() {
  const access = await requireApiPermission("read", "ekstrakurikuler");
  if (!access.ok) return access.response;
  const coaches = await db.extracurricularCoach.findMany({ include: { extracurricular: true, staff: true }, orderBy: { createdAt: "desc" }, take: 300 });
  return NextResponse.json({ data: coaches });
}

export async function POST(request: Request) {
  const access = await requireApiPermission("create", "ekstrakurikuler");
  if (!access.ok) return access.response;
  const parsed = coachSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  const [club, staff] = await Promise.all([db.extracurricular.findUnique({ where: { id: parsed.data.extracurricularId } }), db.staff.findUnique({ where: { id: parsed.data.staffId } })]);
  if (!club) return NextResponse.json({ error: "Ekskul tidak ditemukan" }, { status: 404 });
  if (!staff) return NextResponse.json({ error: "Pembina tidak ditemukan" }, { status: 404 });
  const coach = await db.extracurricularCoach.upsert({
    where: { extracurricular_id_staff_id: { extracurricular_id: club.id, staff_id: staff.id } },
    update: { role: parsed.data.role, is_primary: parsed.data.isPrimary },
    create: { extracurricular_id: club.id, staff_id: staff.id, role: parsed.data.role, is_primary: parsed.data.isPrimary },
  });
  await logActivity({ actorUserId: access.context.user.id, actorName: access.context.user.name, module: "ekstrakurikuler", action: "upsert_coach", entityType: "ExtracurricularCoach", entityId: coach.id, metadata: { club: club.name, staff: staff.name }, request });
  await writeAuditTrail({ actorUserId: access.context.user.id, entityType: "ExtracurricularCoach", entityId: coach.id, action: "upsert", after: coach });
  return NextResponse.json({ data: coach }, { status: 201 });
}

