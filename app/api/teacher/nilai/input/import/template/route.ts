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

// GET /api/teacher/nilai/input/import/template?rombelId=&subjectId=
// Returns an .xlsx template pre-filled with student names/NISN and rubric column headers
export async function GET(request: Request) {
  try {
    const staffId = await getStaffId();
    if (!staffId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const rombelId = searchParams.get("rombelId");
    const subjectId = searchParams.get("subjectId");

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

    // Load rombel + students
    const rombel = await prisma.rombel.findUnique({
      where: { id: BigInt(rombelId) },
      include: {
        class: { select: { name: true } },
        students: { where: { deleted_at: null }, orderBy: { fullName: "asc" } },
      },
    });
    if (!rombel) return NextResponse.json({ error: "Rombel tidak ditemukan" }, { status: 404 });

    const subject = await prisma.subject.findUnique({
      where: { id: BigInt(subjectId) },
      select: { name: true, kkm: true },
    });

    // Load rubrics
    const rubrics = await prisma.assessmentRubric.findMany({
      where: {
        subject_id: BigInt(subjectId),
        rombel_id: BigInt(rombelId),
        deleted_at: null,
      },
      include: { criteria: { where: { deleted_at: null }, orderBy: { order: "asc" } } },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });

    const rubricMaxScores = rubrics.map((r) => ({
      name: r.name,
      type: r.type,
      weight: r.weight,
      maxScore: r.criteria.reduce((s, c) => s + Number(c.max_score), 0),
    }));

    // ── Build workbook ────────────────────────────────────────────────────
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Sekolix";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Import Nilai");

    // ── Title ─────────────────────────────────────────────────────────────
    const totalCols = 3 + rubrics.length;
    sheet.mergeCells(1, 1, 1, totalCols);
    const titleCell = sheet.getCell("A1");
    titleCell.value = `Template Import Nilai — ${rombel.class.name} ${rombel.name} | ${subject?.name ?? ""}`;
    titleCell.font = { bold: true, size: 13 };
    titleCell.alignment = { horizontal: "center" };
    titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F3864" } };
    titleCell.font = { bold: true, size: 13, color: { argb: "FFFFFFFF" } };
    sheet.getRow(1).height = 28;

    // ── Info row ─────────────────────────────────────────────────────────
    sheet.mergeCells(2, 1, 2, totalCols);
    sheet.getCell("A2").value =
      `KKM: ${subject?.kkm ?? 75}   |   Isi nilai pada kolom rubrik (0 s/d maks). Jangan ubah kolom No, NISN, Nama Siswa.`;
    sheet.getCell("A2").font = { italic: true, size: 9, color: { argb: "FF555555" } };
    sheet.getCell("A2").alignment = { horizontal: "center" };
    sheet.getRow(2).height = 16;

    sheet.addRow([]); // row 3 = spacer

    // ── Header row ────────────────────────────────────────────────────────
    const headerRow = sheet.addRow(["No", "NISN", "Nama Siswa", ...rubricMaxScores.map((r) => r.name)]);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2563EB" } };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.border = {
        top: { style: "thin" }, bottom: { style: "thin" },
        left: { style: "thin" }, right: { style: "thin" },
      };
    });
    headerRow.getCell(3).alignment = { horizontal: "left", vertical: "middle" };
    headerRow.height = 24;

    // ── Sub-header: max score + type + weight ─────────────────────────────
    const subHeaderRow = sheet.addRow([
      "", "", "",
      ...rubricMaxScores.map((r) => `Maks: ${r.maxScore} | Bobot: ${r.weight} | ${r.type}`),
    ]);
    subHeaderRow.eachCell((cell) => {
      cell.font = { italic: true, size: 9, color: { argb: "FF374151" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEFF6FF" } };
      cell.alignment = { horizontal: "center" };
      cell.border = { bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
    });
    subHeaderRow.height = 16;

    // ── Student rows ─────────────────────────────────────────────────────
    rombel.students.forEach((student, idx) => {
      const dataRow = sheet.addRow([
        idx + 1,
        student.nisn ?? "",
        student.fullName,
        ...rubrics.map(() => ""),
      ]);
      dataRow.getCell(1).alignment = { horizontal: "center" };
      dataRow.getCell(2).alignment = { horizontal: "center" };
      dataRow.getCell(3).alignment = { horizontal: "left" };

      // Style grade cells: light background + border + number format
      for (let c = 4; c <= totalCols; c++) {
        const cell = dataRow.getCell(c);
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: idx % 2 === 0 ? "FFFFFFFF" : "FFF8FAFC" } };
        cell.border = {
          top: { style: "hair" }, bottom: { style: "hair" },
          left: { style: "thin" }, right: { style: "thin" },
        };
        cell.numFmt = "0.##";
        cell.alignment = { horizontal: "center" };
      }

      // Lock non-grade columns visually (grey)
      [1, 2, 3].forEach((c) => {
        dataRow.getCell(c).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
        dataRow.getCell(c).border = {
          top: { style: "hair" }, bottom: { style: "hair" },
          left: { style: "thin" }, right: { style: "thin" },
        };
      });
    });

    // ── Column widths ─────────────────────────────────────────────────────
    sheet.getColumn(1).width = 5;
    sheet.getColumn(2).width = 18;
    sheet.getColumn(3).width = 32;
    rubrics.forEach((_, i) => { sheet.getColumn(4 + i).width = 20; });

    // ── Freeze panes ─────────────────────────────────────────────────────
    sheet.views = [{ state: "frozen", xSplit: 3, ySplit: 5 }];

    const buffer = await workbook.xlsx.writeBuffer();
    const safeClass = `${rombel.class.name}-${rombel.name}`.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
    const safeSubject = (subject?.name ?? "mapel").replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
    const fileName = `template-import-nilai-${safeClass}-${safeSubject}.xlsx`;

    return new Response(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Error generating import template:", error);
    return NextResponse.json({ error: "Gagal membuat template" }, { status: 500 });
  }
}
