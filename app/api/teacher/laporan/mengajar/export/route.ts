import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";

async function getStaffId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.staffId) return null;
  return session.user.staffId;
}

// GET /api/teacher/laporan/mengajar/export
export async function GET(request: Request) {
  try {
    const staffId = await getStaffId();
    if (!staffId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const rombelId = searchParams.get("rombelId");
    const month = searchParams.get("month");

    const teacherSubjects = await prisma.teacherSubject.findMany({
      where: {
        teacher_id: staffId,
        deleted_at: null,
        ...(rombelId ? { rombel_id: BigInt(rombelId) } : {}),
      },
      include: { subject: true },
    });
    const tsIds = teacherSubjects.map((ts) => ts.id);
    const rombelIds = teacherSubjects.filter((ts) => ts.rombel_id).map((ts) => ts.rombel_id!);

    let dateFrom: Date | undefined;
    let dateTo: Date | undefined;
    if (month) {
      const [y, m] = month.split("-").map(Number);
      dateFrom = new Date(y, m - 1, 1);
      dateTo = new Date(y, m, 0, 23, 59, 59);
    }
    const dateFilter = dateFrom && dateTo ? { date: { gte: dateFrom, lte: dateTo } } : {};

    const journals = await prisma.teachingJournal.findMany({
      where: {
        recorded_by: staffId,
        deleted_at: null,
        teacher_subject_id: { in: tsIds },
        rombel_id: { in: rombelIds },
        ...dateFilter,
      },
      orderBy: [{ rombel_id: "asc" }, { date: "asc" }],
      include: {
        teacherSubject: { include: { subject: { select: { name: true } } } },
        rombel: { select: { name: true, class: { select: { name: true } } } },
      },
    });

    const attendances = await prisma.attendance.findMany({
      where: {
        teacher_subject_id: { in: tsIds },
        deleted_at: null,
        rombel_id: { in: rombelIds },
        ...dateFilter,
      },
      select: { date: true, status: true, teacher_subject_id: true, rombel_id: true },
    });

    const wb = new ExcelJS.Workbook();
    wb.creator = "Sekolix";
    wb.created = new Date();

    // Sheet 1: Jurnal Mengajar
    const wsJurnal = wb.addWorksheet("Jurnal Mengajar");
    wsJurnal.mergeCells("A1:H1");
    const t1 = wsJurnal.getCell("A1");
    t1.value = `Laporan Jurnal Mengajar${month ? " — " + month : ""}`;
    t1.font = { bold: true, size: 13 };
    t1.alignment = { horizontal: "center" };
    wsJurnal.addRow([]);

    const jHeader = wsJurnal.addRow(["No", "Tanggal", "Kelas", "Mapel", "Topik", "Metode", "Jam", "Catatan"]);
    jHeader.eachCell((c) => {
      c.font = { bold: true, color: { argb: "FFFFFFFF" } };
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2563EB" } };
      c.alignment = { horizontal: "center" };
    });
    wsJurnal.columns = [
      { width: 5 }, { width: 14 }, { width: 20 }, { width: 22 },
      { width: 36 }, { width: 22 }, { width: 12 }, { width: 30 },
    ];

    journals.forEach((j, i) => {
      const row = wsJurnal.addRow([
        i + 1,
        j.date.toISOString().slice(0, 10),
        `${j.rombel.name} (${j.rombel.class.name})`,
        j.teacherSubject.subject.name,
        j.topic,
        j.teaching_method ?? "-",
        j.time_start && j.time_end ? `${j.time_start}–${j.time_end}` : "-",
        j.notes ?? "-",
      ]);
      if (i % 2 === 1) {
        row.eachCell((c) => {
          c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF9FAFB" } };
        });
      }
    });

    // Sheet 2: Rekap Absensi
    const wsAbs = wb.addWorksheet("Rekap Absensi");
    wsAbs.mergeCells("A1:F1");
    const t2 = wsAbs.getCell("A1");
    t2.value = `Rekap Absensi Siswa${month ? " — " + month : ""}`;
    t2.font = { bold: true, size: 13 };
    t2.alignment = { horizontal: "center" };
    wsAbs.addRow([]);

    const aHeader = wsAbs.addRow(["Mapel/Kelas", "Total Pertemuan", "Total Siswa Hadir", "Sakit", "Izin", "Alpha"]);
    aHeader.eachCell((c) => {
      c.font = { bold: true, color: { argb: "FFFFFFFF" } };
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF16A34A" } };
      c.alignment = { horizontal: "center" };
    });
    wsAbs.columns = [{ width: 30 }, { width: 18 }, { width: 18 }, { width: 12 }, { width: 12 }, { width: 12 }];

    // Group attendances by teacher_subject + rombel
    const absMap = new Map<string, { label: string; hadir: number; sakit: number; izin: number; alpha: number; total: number }>();
    for (const a of attendances) {
      const ts = teacherSubjects.find((t) => t.id === a.teacher_subject_id);
      const label = ts ? `${ts.subject.name}` : String(a.teacher_subject_id);
      const key = String(a.teacher_subject_id) + "-" + String(a.rombel_id);
      const prev = absMap.get(key) ?? { label, hadir: 0, sakit: 0, izin: 0, alpha: 0, total: 0 };
      prev.total++;
      if (a.status === "HADIR") prev.hadir++;
      else if (a.status === "SAKIT") prev.sakit++;
      else if (a.status === "IZIN") prev.izin++;
      else if (a.status === "ALPHA") prev.alpha++;
      absMap.set(key, prev);
    }

    const meetings = new Map<string, Set<string>>();
    for (const a of attendances) {
      const key = String(a.teacher_subject_id) + "-" + String(a.rombel_id);
      const s = meetings.get(key) ?? new Set();
      s.add(a.date.toISOString().slice(0, 10));
      meetings.set(key, s);
    }

    for (const [key, g] of absMap) {
      const meet = meetings.get(key)?.size ?? 0;
      wsAbs.addRow([g.label, meet, g.hadir, g.sakit, g.izin, g.alpha]);
    }

    const buffer = await wb.xlsx.writeBuffer();
    const label = month ? `_${month}` : "";
    return new Response(Buffer.from(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="laporan_mengajar${label}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Error exporting laporan mengajar:", error);
    return NextResponse.json({ error: "Failed to export" }, { status: 500 });
  }
}
