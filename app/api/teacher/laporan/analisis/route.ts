import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getStaffId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.staffId) return null;
  return session.user.staffId;
}

// GET /api/teacher/laporan/analisis
// Returns: kehadiran vs nilai correlation, low-score rubrics, recommendations
export async function GET(request: Request) {
  try {
    const staffId = await getStaffId();
    if (!staffId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const rombelId = searchParams.get("rombelId");
    const subjectId = searchParams.get("subjectId");

    const teacherSubjects = await prisma.teacherSubject.findMany({
      where: {
        teacher_id: staffId,
        deleted_at: null,
        ...(rombelId ? { rombel_id: BigInt(rombelId) } : {}),
        ...(subjectId ? { subject_id: BigInt(subjectId) } : {}),
      },
      include: {
        subject: { select: { id: true, name: true } },
        rombel: {
          select: {
            id: true,
            name: true,
            class: { select: { name: true } },
            students: {
              where: { deleted_at: null },
              select: { id: true, fullName: true },
            },
          },
        },
      },
    });

    const tsIds = teacherSubjects.map((ts) => ts.id);
    const rombelIds = teacherSubjects.filter((ts) => ts.rombel_id).map((ts) => ts.rombel_id!);
    const subjectIds = teacherSubjects.map((ts) => ts.subject_id);

    // Attendance per student
    const attendances = await prisma.attendance.findMany({
      where: { teacher_subject_id: { in: tsIds }, deleted_at: null },
      select: { student_id: true, status: true, teacher_subject_id: true },
    });

    // Rubric grades
    const rubrics = await prisma.assessmentRubric.findMany({
      where: {
        subject_id: { in: subjectIds },
        rombel_id: { in: rombelIds },
        deleted_at: null,
      },
      include: {
        grades: {
          where: { deleted_at: null },
          select: { student_id: true, score: true },
        },
      },
    });

    // Per-student attendance rate + avg score (for correlation scatter)
    const allStudents = teacherSubjects
      .flatMap((ts) => ts.rombel?.students ?? [])
      .filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i);

    const attByStudent = new Map<string, { hadir: number; total: number }>();
    for (const a of attendances) {
      const prev = attByStudent.get(a.student_id) ?? { hadir: 0, total: 0 };
      prev.total++;
      if (a.status === "HADIR") prev.hadir++;
      attByStudent.set(a.student_id, prev);
    }

    const scoreByStudent = new Map<string, { total: number; weight: number }>();
    for (const rubric of rubrics) {
      for (const grade of rubric.grades) {
        const prev = scoreByStudent.get(grade.student_id) ?? { total: 0, weight: 0 };
        prev.total += Number(grade.score) * rubric.weight;
        prev.weight += rubric.weight;
        scoreByStudent.set(grade.student_id, prev);
      }
    }

    const correlationData = allStudents
      .map((student) => {
        const att = attByStudent.get(student.id);
        const sc = scoreByStudent.get(student.id);
        const attRate = att && att.total > 0 ? Math.round((att.hadir / att.total) * 100) : null;
        const avgScore = sc && sc.weight > 0 ? Math.round((sc.total / sc.weight) * 10) / 10 : null;
        return { id: student.id, fullName: student.fullName, attRate, avgScore };
      })
      .filter((d) => d.attRate !== null && d.avgScore !== null);

    // Low-score rubrics (avg < 70)
    const rubricStats = rubrics.map((rubric) => {
      const scores = rubric.grades.map((g) => Number(g.score));
      const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
      const ts = teacherSubjects.find((t) => String(t.subject_id) === String(rubric.subject_id));
      return {
        id: String(rubric.id),
        name: rubric.name,
        type: rubric.type,
        subjectName: ts?.subject.name ?? "",
        studentCount: scores.length,
        avgScore: avg !== null ? Math.round(avg * 10) / 10 : null,
        passCount: scores.filter((s) => s >= 70).length,
        isLowScore: avg !== null && avg < 70,
      };
    }).sort((a, b) => (a.avgScore ?? 100) - (b.avgScore ?? 100));

    // Attendance bucket analysis (for grouped bar)
    const attBuckets = {
      "90-100": { students: 0, avgScore: 0, scores: [] as number[] },
      "75-89": { students: 0, avgScore: 0, scores: [] as number[] },
      "60-74": { students: 0, avgScore: 0, scores: [] as number[] },
      "<60": { students: 0, avgScore: 0, scores: [] as number[] },
    };
    for (const d of correlationData) {
      const attRate = d.attRate!;
      const avgScore = d.avgScore!;
      let bucket: keyof typeof attBuckets;
      if (attRate >= 90) bucket = "90-100";
      else if (attRate >= 75) bucket = "75-89";
      else if (attRate >= 60) bucket = "60-74";
      else bucket = "<60";
      attBuckets[bucket].students++;
      attBuckets[bucket].scores.push(avgScore);
    }
    const attAnalysis = Object.entries(attBuckets).map(([range, data]) => ({
      range,
      students: data.students,
      avgScore: data.scores.length > 0
        ? Math.round((data.scores.reduce((a, b) => a + b, 0) / data.scores.length) * 10) / 10
        : null,
    }));

    // Simple recommendations
    const recommendations: string[] = [];
    const lowRubrics = rubricStats.filter((r) => r.isLowScore);
    if (lowRubrics.length > 0) {
      recommendations.push(`${lowRubrics.length} rubrik penilaian memiliki rata-rata di bawah KKM — perlu perhatian ekstra pada materi: ${lowRubrics.slice(0, 2).map((r) => r.name).join(", ")}`);
    }
    const lowAttBucket = attBuckets["<60"];
    if (lowAttBucket.students > 0) {
      recommendations.push(`${lowAttBucket.students} siswa memiliki tingkat kehadiran di bawah 60% — hubungi orang tua untuk tindak lanjut`);
    }
    const highAttHighScore = correlationData.filter((d) => d.attRate! >= 90 && d.avgScore! >= 80).length;
    if (highAttHighScore > 0) {
      recommendations.push(`${highAttHighScore} siswa dengan kehadiran tinggi dan nilai baik — pertahankan konsistensi`);
    }
    if (recommendations.length === 0) {
      recommendations.push("Data belum cukup untuk menghasilkan rekomendasi. Pastikan jurnal dan nilai sudah diisi.");
    }

    // Filters
    const filterRombels = teacherSubjects
      .filter((ts) => ts.rombel)
      .map((ts) => ({ id: String(ts.rombel_id), name: ts.rombel!.name, className: ts.rombel!.class.name }))
      .filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i);
    const filterSubjects = teacherSubjects
      .map((ts) => ({ id: String(ts.subject_id), name: ts.subject.name }))
      .filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i);

    return NextResponse.json({
      correlationData: correlationData.slice(0, 100),
      attAnalysis,
      rubricStats: rubricStats.slice(0, 20),
      lowScoreRubrics: lowRubrics.slice(0, 5),
      recommendations,
      summary: {
        totalStudents: allStudents.length,
        withData: correlationData.length,
        avgAttRate: correlationData.length > 0
          ? Math.round(correlationData.reduce((s, d) => s + (d.attRate ?? 0), 0) / correlationData.length)
          : null,
        avgScore: correlationData.length > 0
          ? Math.round(correlationData.reduce((s, d) => s + (d.avgScore ?? 0), 0) / correlationData.length * 10) / 10
          : null,
      },
      filters: { rombels: filterRombels, subjects: filterSubjects },
    });
  } catch (error) {
    console.error("Error fetching laporan analisis:", error);
    return NextResponse.json({ error: "Failed to fetch laporan analisis" }, { status: 500 });
  }
}
