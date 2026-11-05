import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";
import { getStaffIdForUser } from "@/lib/bk/server";

const achievementSchema = z.object({
  studentId: z.string().min(1),
  title: z.string().trim().min(3).max(180),
  category: z.enum(["ACADEMIC", "NON_ACADEMIC", "EXTRACURRICULAR", "CHARACTER"]).default("ACADEMIC"),
  level: z.enum(["SCHOOL", "DISTRICT", "CITY", "PROVINCE", "NATIONAL", "INTERNATIONAL"]).default("SCHOOL"),
  organizer: z.string().trim().max(160).optional().nullable(),
  achievementDate: z.coerce.date(),
  description: z.string().trim().max(2000).optional().nullable(),
  certificateUrl: z.string().trim().url().optional().nullable(),
  parentVisible: z.boolean().default(true),
});

export async function GET(request: Request) {
  const access = await requireApiPermission("read", "bk");
  if (!access.ok) return access.response;

  const studentId = new URL(request.url).searchParams.get("studentId");
  const achievements = await db.studentAchievement.findMany({
    where: { ...(studentId ? { student_id: studentId } : {}) },
    include: {
      student: { select: { id: true, fullName: true, nisn: true } },
      verifier: { select: { id: true, name: true } },
    },
    orderBy: { achievement_date: "desc" },
    take: 200,
  });

  return NextResponse.json({ data: achievements });
}

export async function POST(request: Request) {
  const access = await requireApiPermission("create", "bk");
  if (!access.ok) return access.response;

  const parsed = achievementSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  }

  const staffId = await getStaffIdForUser(access.context.user.id);
  const created = await db.studentAchievement.create({
    data: {
      student_id: parsed.data.studentId,
      verified_by: staffId,
      title: parsed.data.title,
      category: parsed.data.category,
      level: parsed.data.level,
      organizer: parsed.data.organizer ?? null,
      achievement_date: parsed.data.achievementDate,
      description: parsed.data.description ?? null,
      certificate_url: parsed.data.certificateUrl ?? null,
      parent_visible: parsed.data.parentVisible,
    },
  });

  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "bk",
    action: "create_achievement",
    entityType: "StudentAchievement",
    entityId: created.id,
    metadata: { studentId: created.student_id, level: created.level },
    request,
  });
  await writeAuditTrail({
    actorUserId: access.context.user.id,
    entityType: "StudentAchievement",
    entityId: created.id,
    action: "create",
    after: created,
  });

  return NextResponse.json({ data: created }, { status: 201 });
}
