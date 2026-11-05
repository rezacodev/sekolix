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
 * GET /api/admin/manajemen-akademik/laporan/jadwal
 *
 * Query params:
 *   - format : "excel" (default) | "pdf"
 *   - tahunAjaranId : id tahun ajaran (default: aktif)
 *   - rombelId      : BigInt rombel id (opsional)
 *   - day           : filter hari (opsional)
 *   - includeConflicts : "1" untuk highlight konflik (informational saja)
 */
export async function GET(request: NextRequest) {
  const access = await requireReportAccess();
  if (!access.ok) return access.response;

  const { searchParams } = new URL(request.url);
  const format = (searchParams.get("format") ?? "excel").toLowerCase();
  const tahunAjaranId = searchParams.get("tahunAjaranId");
  const rombelIdParam = searchParams.get("rombelId");
  const day = searchParams.get("day");
  const rombelId = rombelIdParam ? BigInt(rombelIdParam) : null;

  const tahunAjaran = await resolveTahunAjaran(tahunAjaranId);
  if (!tahunAjaran) return errorResponse("Tahun ajaran tidak ditemukan", 404);

  const schedules = await prisma.classSchedule.findMany({
    where: {
      deleted_at: null,
      ...(day ? { day: day as "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY" } : {}),
      ...(rombelId ? { rombel_id: rombelId } : {}),
      ...(rombelId
        ? { rombel: { tahunAjaranId: tahunAjaran.id } }
        : {
            OR: [
              { rombel: { tahunAjaranId: tahunAjaran.id } },
              { rombel_id: null },
            ],
          }),
    },
    include: {
      class: { select: { name: true } },
      rombel: { select: { name: true, tahunAjaranId: true } },
      teacherSubject: {
        include: {
          teacher: { select: { id: true, name: true, nip: true } },
          subject: { select: { name: true, code: true } },
        },
      },
    },
    orderBy: [{ day: "asc" }, { period: "asc" }, { start_time: "asc" }],
  });

  // Detect conflicts: same (staff, day, period) appears twice
  const conflictKeys = new Set<string>();
  const seenKeys = new Map<string, number>();
  for (const s of schedules) {
    const staffId = s.teacherSubject?.teacher?.id ?? "unknown";
    const key = `${staffId}|${s.day}|${s.period ?? ""}`;
    const count = (seenKeys.get(key) ?? 0) + 1;
    seenKeys.set(key, count);
    if (count > 1) conflictKeys.add(key);
  }

  const DAY_LABEL: Record<string, string> = {
    MONDAY: "Senin",
    TUESDAY: "Selasa",
    WEDNESDAY: "Rabu",
    THURSDAY: "Kamis",
    FRIDAY: "Jumat",
    SATURDAY: "Sabtu",
    SUNDAY: "Minggu",
  };

  const rows = schedules.map((s, idx) => {
    const staffId = s.teacherSubject?.teacher?.id ?? "unknown";
    const conflictKey = `${staffId}|${s.day}|${s.period ?? ""}`;
    const hasConflict = conflictKeys.has(conflictKey);
    const startStr = s.start_time ? formatTime(s.start_time) : "";
    const endStr = s.end_time ? formatTime(s.end_time) : "";
    return {
      no: idx + 1,
      hari: DAY_LABEL[s.day] ?? s.day,
      jamKe: s.period ?? "",
      waktu: startStr && endStr ? `${startStr} - ${endStr}` : "",
      rombel: s.rombel?.name ?? "-",
      kelas: s.class?.name ?? "-",
      mataPelajaran: s.teacherSubject?.subject?.name ?? "-",
      guru: s.teacherSubject?.teacher?.name ?? "-",
      nip: s.teacherSubject?.teacher?.nip ?? "",
      ruangan: s.room ?? "-",
      konflik: hasConflict ? "YA" : "",
    };
  });

  const conflictCount = conflictKeys.size;
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `jadwal-pelajaran-${timestamp}`;

  // Default: Excel
  const columns: ExcelColumn[] = [
    { header: "No", key: "no", width: 6 },
    { header: "Hari", key: "hari", width: 12 },
    { header: "Jam Ke-", key: "jamKe", width: 8 },
    { header: "Waktu", key: "waktu", width: 16 },
    { header: "Rombel", key: "rombel", width: 18 },
    { header: "Kelas", key: "kelas", width: 10 },
    { header: "Mata Pelajaran", key: "mataPelajaran", width: 22 },
    { header: "Guru", key: "guru", width: 24 },
    { header: "NIP", key: "nip", width: 16 },
    { header: "Ruangan", key: "ruangan", width: 14 },
    { header: "Konflik", key: "konflik", width: 10 },
  ];

  return respondExcel("Jadwal Pelajaran", columns, rows, `${filename}.xlsx`);
}

function formatTime(d: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}
