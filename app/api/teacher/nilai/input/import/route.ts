/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";

async function getStaffId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { staff: true },
  });
  return user?.staff?.[0]?.id ?? null;
}

// POST /api/teacher/nilai/input/import
// Body: multipart/form-data — file (xlsx), rombelId, subjectId
// Returns: { preview: [...] } on ?preview=1, or { saved, errors } on actual import
export async function POST(request: Request) {
  try {
    const staffId = await getStaffId();
    if (!staffId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const isPreview = searchParams.get("preview") === "1";

    const form = await request.formData();
    const file = form.get("file") as File | null;
    const rombelId = form.get("rombelId") as string | null;
    const subjectId = form.get("subjectId") as string | null;

    if (!file) return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    if (!rombelId || !subjectId) {
      return NextResponse.json({ error: "rombelId dan subjectId wajib diisi" }, { status: 400 });
    }

    // Verify teacher access
    const teacherSubject = await prisma.teacherSubject.findFirst({
      where: {
        teacher_id: staffId,
        rombel_id: BigInt(rombelId),
        subject_id: BigInt(subjectId),
        deleted_at: null,
      },
    });
    if (!teacherSubject) {
      return NextResponse.json({ error: "Tidak memiliki akses ke kelas dan mapel ini" }, { status: 403 });
    }

    // Load rubrics for this rombel+subject
    const rubrics = await prisma.assessmentRubric.findMany({
      where: {
        subject_id: BigInt(subjectId),
        rombel_id: BigInt(rombelId),
        deleted_at: null,
      },
      include: {
        criteria: { where: { deleted_at: null }, orderBy: { order: "asc" } },
      },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });

    if (rubrics.length === 0) {
      return NextResponse.json({ error: "Belum ada rubrik penilaian untuk kelas dan mapel ini" }, { status: 400 });
    }

    // Load students
    const rombel = await prisma.rombel.findUnique({
      where: { id: BigInt(rombelId) },
      include: {
        class: { select: { name: true } },
        students: { where: { deleted_at: null }, orderBy: { fullName: "asc" } },
      },
    });
    if (!rombel) return NextResponse.json({ error: "Rombel tidak ditemukan" }, { status: 404 });

    // Build student lookup by NISN and by fullName (fallback)
    const studentByNisn = new Map(rombel.students.filter((s) => s.nisn).map((s) => [s.nisn!, s]));
    const studentByName = new Map(rombel.students.map((s) => [s.fullName.toLowerCase().trim(), s]));

    // Parse Excel
    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = new ExcelJS.Workbook();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await workbook.xlsx.load(buffer as any);
    const sheet = workbook.worksheets[0];
    if (!sheet) return NextResponse.json({ error: "Sheet tidak ditemukan di file Excel" }, { status: 400 });

    // Detect header row — look for "NISN" or "Nama" in first 5 rows
    let headerRowNum = 1;
    for (let r = 1; r <= Math.min(5, sheet.rowCount); r++) {
      const vals = sheet.getRow(r).values as (string | undefined)[];
      const flat = vals.map((v) => String(v ?? "").toUpperCase());
      if (flat.includes("NISN") || flat.includes("NAMA SISWA") || flat.includes("NAMA")) {
        headerRowNum = r;
        break;
      }
    }

    const headerRow = sheet.getRow(headerRowNum).values as (string | undefined)[];
    // Find column indices (1-based in ExcelJS)
    const colNisn = headerRow.findIndex((v) => String(v ?? "").toUpperCase() === "NISN");
    const colName = headerRow.findIndex(
      (v) => ["NAMA SISWA", "NAMA"].includes(String(v ?? "").toUpperCase())
    );

    if (colNisn < 0 && colName < 0) {
      return NextResponse.json({ error: "Kolom NISN atau Nama Siswa tidak ditemukan di header" }, { status: 400 });
    }

    // Map rubric columns: match header cell text to rubric name
    type RubricColEntry = { rubricId: bigint; rubricName: string; maxScore: number; criteria: { id: bigint; name: string; maxScore: number }[]; colIndex: number };
    const rubricCols: RubricColEntry[] = [];
    for (const rubric of rubrics) {
      const rubricMaxScore = rubric.criteria.reduce((s, c) => s + Number(c.max_score), 0);
      const colIdx = headerRow.findIndex(
        (v) => String(v ?? "").trim().toLowerCase() === rubric.name.trim().toLowerCase()
      );
      if (colIdx > 0) {
        rubricCols.push({
          rubricId: rubric.id,
          rubricName: rubric.name,
          maxScore: rubricMaxScore,
          criteria: rubric.criteria.map((c) => ({ id: c.id, name: c.name, maxScore: Number(c.max_score) })),
          colIndex: colIdx,
        });
      }
    }

    if (rubricCols.length === 0) {
      return NextResponse.json(
        { error: `Tidak ada kolom rubrik yang cocok. Pastikan header Excel menggunakan nama rubrik: ${rubrics.map((r) => r.name).join(", ")}` },
        { status: 400 }
      );
    }

    // Parse data rows
    const preview: Array<{
      row: number;
      studentId: string | null;
      studentName: string;
      nisn: string;
      found: boolean;
      scores: Record<string, number | null>;
      errors: string[];
    }> = [];

    for (let r = headerRowNum + 1; r <= sheet.rowCount; r++) {
      const row = sheet.getRow(r);
      const vals = row.values as (unknown)[];
      if (!vals || vals.every((v) => v === null || v === undefined || v === "")) continue;

      const nisnRaw = String(vals[colNisn] ?? "").trim();
      const nameRaw = String(vals[colName] ?? "").trim();
      if (!nisnRaw && !nameRaw) continue;

      // Find student
      let student = nisnRaw ? studentByNisn.get(nisnRaw) : undefined;
      if (!student && nameRaw) student = studentByName.get(nameRaw.toLowerCase());

      const rowErrors: string[] = [];
      const scores: Record<string, number | null> = {};

      for (const rubricCol of rubricCols) {
        const raw = vals[rubricCol.colIndex];
        if (raw === null || raw === undefined || raw === "") {
          scores[String(rubricCol.rubricId)] = null;
          continue;
        }
        const num = parseFloat(String(raw));
        if (isNaN(num)) {
          rowErrors.push(`Nilai rubrik "${rubricCol.rubricName}" tidak valid: ${raw}`);
          scores[String(rubricCol.rubricId)] = null;
        } else if (num < 0 || num > rubricCol.maxScore) {
          rowErrors.push(`Nilai rubrik "${rubricCol.rubricName}" harus antara 0–${rubricCol.maxScore}, ditemukan: ${num}`);
          scores[String(rubricCol.rubricId)] = null;
        } else {
          scores[String(rubricCol.rubricId)] = num;
        }
      }

      if (!student) rowErrors.push(`Siswa tidak ditemukan (NISN: ${nisnRaw || "-"}, Nama: ${nameRaw || "-"})`);

      preview.push({
        row: r,
        studentId: student?.id ?? null,
        studentName: nameRaw || (student?.fullName ?? ""),
        nisn: nisnRaw || (student?.nisn ?? ""),
        found: !!student,
        scores,
        errors: rowErrors,
      });
    }

    if (isPreview) {
      return NextResponse.json({
        preview,
        rubricCols: rubricCols.map((rc) => ({ rubricId: String(rc.rubricId), name: rc.rubricName, maxScore: rc.maxScore })),
        totalRows: preview.length,
        validRows: preview.filter((r) => r.found && r.errors.length === 0).length,
        errorRows: preview.filter((r) => !r.found || r.errors.length > 0).length,
      });
    }

    // ── Actual save ────────────────────────────────────────────────────────
    const db = prisma as any;
    let saved = 0;
    const saveErrors: string[] = [];

    for (const entry of preview) {
      if (!entry.studentId || entry.errors.length > 0) continue;

      for (const rubricCol of rubricCols) {
        const score = entry.scores[String(rubricCol.rubricId)];
        if (score === null || score === undefined) continue;

        try {
          // Find or create assessment for this rubric
          let assessment = await prisma.assessment.findFirst({
            where: {
              subject_id: BigInt(subjectId),
              deleted_at: null,
            },
          });
          if (!assessment) {
            assessment = await prisma.assessment.create({
              data: {
                title: rubricCol.rubricName,
                type: "TUGAS",
                subject_id: BigInt(subjectId),
                weight: 1,
                max_score: rubricCol.maxScore,
              },
            });
          }

          // Upsert grade with the total score directly
          const grade = await db.grade.upsert({
            where: {
              student_id_rubric_id: {
                student_id: entry.studentId,
                rubric_id: rubricCol.rubricId,
              },
            },
            create: {
              student_id: entry.studentId,
              assessment_id: assessment.id,
              rubric_id: rubricCol.rubricId,
              score,
            },
            update: {
              score,
              updated_at: new Date(),
            },
          });

          // Delete old rubric scores and distribute proportionally across criteria
          await db.rubricScore.deleteMany({ where: { grade_id: grade.id } });

          if (rubricCol.criteria.length > 0) {
            // Distribute score proportionally by criterion max_score weight
            const criteriaScores = rubricCol.criteria.map((c) => ({
              grade_id: grade.id,
              rubric_criterion_id: c.id,
              score: rubricCol.maxScore > 0 ? (c.maxScore / rubricCol.maxScore) * score : 0,
            }));
            await db.rubricScore.createMany({ data: criteriaScores });
          }

          saved++;
        } catch (err) {
          saveErrors.push(`Baris ${entry.row}, siswa ${entry.studentName}: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
    }

    return NextResponse.json({ saved, errors: saveErrors, total: preview.length });
  } catch (error) {
    console.error("Error importing grades:", error);
    return NextResponse.json({ error: "Gagal mengimpor nilai" }, { status: 500 });
  }
}
