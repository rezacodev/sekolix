import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";

export async function GET() {
  const access = await requireApiPermission("read", "bk");
  if (!access.ok) return access.response;

  const [cases, records, achievements, referrals, summonLetters] = await Promise.all([
    db.studentCounselingCase.findMany({ select: { status: true, priority: true, category: true, parent_visible: true } }),
    db.disciplineRecord.findMany({
      include: { student: { select: { id: true, fullName: true, nisn: true } }, rule: true },
      orderBy: { incident_date: "desc" },
      take: 500,
    }),
    db.studentAchievement.findMany({
      include: { student: { select: { id: true, fullName: true, nisn: true } } },
      orderBy: { achievement_date: "desc" },
      take: 200,
    }),
    db.counselingReferral.findMany({ select: { status: true, source: true } }),
    db.parentSummonLetter.findMany({ select: { status: true, scheduled_at: true } }),
  ]);

  const disciplineByStudent = new Map<string, { id: string; fullName: string; nisn: string | null; points: number; records: number }>();
  for (const record of records) {
    const existing = disciplineByStudent.get(record.student_id) ?? {
      id: record.student.id,
      fullName: record.student.fullName,
      nisn: record.student.nisn,
      points: 0,
      records: 0,
    };
    existing.points += record.points;
    existing.records += 1;
    disciplineByStudent.set(record.student_id, existing);
  }

  return NextResponse.json({
    data: {
      metrics: {
        activeCases: cases.filter((item) => ["OPEN", "IN_PROGRESS"].includes(item.status)).length,
        resolvedCases: cases.filter((item) => item.status === "RESOLVED").length,
        criticalCases: cases.filter((item) => item.priority === "CRITICAL").length,
        disciplineRecords: records.length,
        achievements: achievements.length,
        pendingReferrals: referrals.filter((item) => item.status === "PENDING").length,
        scheduledSummons: summonLetters.filter((item) => item.status === "SENT").length,
      },
      casesByCategory: Object.entries(
        cases.reduce<Record<string, number>>((acc, item) => {
          acc[item.category] = (acc[item.category] ?? 0) + 1;
          return acc;
        }, {})
      ).map(([category, count]) => ({ category, count })),
      studentsNeedAttention: Array.from(disciplineByStudent.values())
        .sort((a, b) => b.points - a.points)
        .slice(0, 25),
      recentAchievements: achievements.slice(0, 25),
      referralsBySource: Object.entries(
        referrals.reduce<Record<string, number>>((acc, item) => {
          acc[item.source] = (acc[item.source] ?? 0) + 1;
          return acc;
        }, {})
      ).map(([source, count]) => ({ source, count })),
    },
  });
}
