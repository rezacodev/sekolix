import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";
import { getStaffIdForUser } from "@/lib/extracurricular/server";

const achievementSchema = z.object({
  extracurricularId: z.string().min(1),
  studentId: z.string().optional().nullable(),
  title: z.string().trim().min(2).max(180),
  level: z.string().trim().max(80).optional().nullable(),
  organizer: z.string().trim().max(160).optional().nullable(),
  achievedAt: z.coerce.date().optional().nullable(),
  rank: z.string().trim().max(80).optional().nullable(),
  description: z.string().trim().max(2000).optional().nullable(),
  certificateUrl: z.string().trim().url().optional().nullable(),
  portfolioVisible: z.coerce.boolean().default(true),
});

export async function GET() {
  const access = await requireApiPermission("read", "ekstrakurikuler");
  if (!access.ok) return access.response;
  const achievements = await db.extracurricularAchievement.findMany({ include: { extracurricular: true, student: true, verifier: { select: { name: true } } }, orderBy: { achieved_at: "desc" }, take: 300 });
  return NextResponse.json({ data: achievements });
}

export async function POST(request: Request) {
  const access = await requireApiPermission("create", "ekstrakurikuler");
  if (!access.ok) return access.response;
  const parsed = achievementSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  const [club, student, verifierId] = await Promise.all([db.extracurricular.findUnique({ where: { id: parsed.data.extracurricularId } }), parsed.data.studentId ? db.pesertaDidik.findUnique({ where: { id: parsed.data.studentId } }) : null, getStaffIdForUser(access.context.user.id)]);
  if (!club) return NextResponse.json({ error: "Ekskul tidak ditemukan" }, { status: 404 });
  if (parsed.data.studentId && !student) return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });
  const achievement = await db.extracurricularAchievement.create({
    data: { extracurricular_id: club.id, student_id: parsed.data.studentId ?? null, title: parsed.data.title, level: parsed.data.level ?? null, organizer: parsed.data.organizer ?? null, achieved_at: parsed.data.achievedAt ?? null, rank: parsed.data.rank ?? null, description: parsed.data.description ?? null, certificate_url: parsed.data.certificateUrl ?? null, portfolio_visible: parsed.data.portfolioVisible, verified_by: verifierId },
  });
  await logActivity({ actorUserId: access.context.user.id, actorName: access.context.user.name, module: "ekstrakurikuler", action: "create_achievement", entityType: "ExtracurricularAchievement", entityId: achievement.id, metadata: { club: club.name, title: achievement.title, student: student?.fullName ?? null }, request });
  await writeAuditTrail({ actorUserId: access.context.user.id, entityType: "ExtracurricularAchievement", entityId: achievement.id, action: "create", after: achievement });
  return NextResponse.json({ data: achievement }, { status: 201 });
}

