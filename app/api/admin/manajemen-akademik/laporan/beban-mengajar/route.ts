import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  errorResponse,
  requireReportAccess,
  respondExcel,
  resolveTahunAjaran,
} from "@/lib/reports";
import type { ExcelColumn } from "@/lib/reports";

/**
 * GET /api/admin/manajemen-akademik/laporan/beban-mengajar
 *
 * Query params:
 *   - format : "excel" (default) | "pdf"
 *   - tahunAjaranId : id tahun ajaran (default: aktif)
 *
 * Menghitung jumlah slot jadwal mengajar per guru (mengganti "jam" karena slot
 * sudah mencakup periode & durasi).
 */
export async function GET(request: NextRequest) {
  const access = await requireReportAccess();
  if (!access.ok) return access.response;

  const { searchParams } = new URL(request.url);
  const format = (searchParams.get("format") ?? "excel").toLowerCase();
  const tahunAjaranId = searchParams.get("tahunAjaranId");

  const tahunAjaran = await resolveTahunAjaran(tahunAjaranId);
  if (!tahunAjaran) return errorResponse("Tahun ajaran tidak ditemukan", 404);

  // Fetch all schedules for this academic year
  const schedules = await prisma.classSchedule.findMany({
    where: {
      deleted_at: null,
      OR: [
        { rombel: { tahunAjaranId: tahunAjaran.id } },
        { rombel_id: null },
      ],
    },
    include: {
      teacherSubject: {
        include: {
          teacher: { select: { id: true, name: true, nip: true, workloadHours: true } },
          subject: { select: { name: true } },
        },
      },
    },
  });

  // Aggregate per teacher
  const byTeacher = new Map<
    string,
    {
      nama: string;
      nip: string;
      workloadHours: number | null;
      mapels: Set<string>;
      rombels: Set<string>;
      totalSlots: number;
      hari: Set<string>;
    }
  >();
  for (const s of schedules) {
    const teacher = s.teacherSubject?.teacher;
    if (!teacher) continue;
    const id = teacher.id;
    const entry =
      byTeacher.get(id) ??
      {
        nama: teacher.name,
        nip: teacher.nip ?? "",
        workloadHours: teacher.workloadHours,
        mapels: new Set<string>(),
        rombels: new Set<string>(),
        totalSlots: 0,
        hari: new Set<string>(),
      };
    if (s.teacherSubject?.subject?.name) entry.mapels.add(s.teacherSubject.subject.name);
    if (s.rombel_id) entry.rombels.add(String(s.rombel_id));
    entry.totalSlots += 1;
    entry.hari.add(s.day);
    byTeacher.set(id, entry);
  }

  const rows = Array.from(byTeacher.entries())
    .map(([id, v], idx) => ({
      no: idx + 1,
      nip: v.nip,
      nama: v.nama,
      mapelCount: v.mapels.size,
      rombelCount: v.rombels.size,
      totalSlot: v.totalSlots,
      hariAktif: v.hari.size,
      bebanTetap: v.workloadHours ?? 0,
      mapelList: Array.from(v.mapels).join("; "),
    }))
    .sort((a, b) => b.totalSlot - a.totalSlot);

  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `beban-mengajar-${timestamp}`;

  const columns: ExcelColumn[] = [
    { header: "No", key: "no", width: 6 },
    { header: "NIP", key: "nip", width: 18 },
    { header: "Nama Guru", key: "nama", width: 28 },
    { header: "Jumlah Mapel", key: "mapelCount", width: 14 },
    { header: "Jumlah Rombel", key: "rombelCount", width: 14 },
    { header: "Total Slot/Minggu", key: "totalSlot", width: 16 },
    { header: "Hari Aktif", key: "hariAktif", width: 12 },
    { header: "Beban Tetap (jam)", key: "bebanTetap", width: 16 },
    { header: "Daftar Mapel", key: "mapelList", width: 40 },
  ];

  return respondExcel("Beban Mengajar", columns, rows, `${filename}.xlsx`);
}
