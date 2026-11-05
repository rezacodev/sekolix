import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";

export async function GET() {
  const access = await requireApiPermission("read", "ekstrakurikuler");
  if (!access.ok) return access.response;
  const [clubs, members, schedules, pendingRegistrations, achievements, publishedSchedules] = await Promise.all([
    db.extracurricular.count({ where: { is_active: true } }),
    db.extracurricularMember.count({ where: { status: "ACTIVE" } }),
    db.extracurricularSchedule.count({ where: { status: "SCHEDULED" } }),
    db.extracurricularRegistration.count({ where: { status: "PENDING" } }),
    db.extracurricularAchievement.count(),
    db.extracurricularSchedule.count({ where: { is_published: true } }),
  ]);
  return NextResponse.json({ data: { clubs, members, schedules, pendingRegistrations, achievements, publishedSchedules } });
}

