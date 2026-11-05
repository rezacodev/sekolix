import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, requireReportAccess, respondExcel } from "@/lib/reports";
import type { ExcelColumn } from "@/lib/reports";

export async function GET(_request: NextRequest) {
  const access = await requireReportAccess();
  if (!access.ok) return access.response;

  const rooms = await prisma.room.findMany({
    where: { deleted_at: null },
    orderBy: [{ building: "asc" }, { floor: "asc" }, { name: "asc" }],
  });

  const lessonTimes = await prisma.lessonTime.findMany({
    where: { is_active: true },
    orderBy: [{ day: "asc" }, { session: "asc" }],
  });

  const SHEETS = [
    {
      name: "Ruang",
      columns: [
        { header: "Kode", key: "code", width: 14 },
        { header: "Nama Ruang", key: "name", width: 28 },
        { header: "Tipe", key: "type", width: 14 },
        { header: "Gedung", key: "building", width: 18 },
        { header: "Lantai", key: "floor", width: 10 },
        { header: "Kapasitas", key: "capacity", width: 12 },
      ] satisfies ExcelColumn[],
      rows: rooms.map((r) => ({
        code: r.code ?? "",
        name: r.name,
        type: r.type,
        building: r.building ?? "",
        floor: r.floor ?? "",
        capacity: r.capacity ?? "",
      })),
    },
    {
      name: "Jam Pelajaran",
      columns: [
        { header: "Hari", key: "day", width: 12 },
        { header: "Jam Ke-", key: "session", width: 10 },
        { header: "Mulai", key: "start", width: 10 },
        { header: "Selesai", key: "end", width: 10 },
        { header: "Istirahat?", key: "isBreak", width: 14 },
        { header: "Label", key: "label", width: 22 },
      ] satisfies ExcelColumn[],
      rows: lessonTimes.map((l) => ({
        day: l.day,
        session: l.session,
        start: l.start_time,
        end: l.end_time,
        isBreak: l.is_break ? "Ya" : "Tidak",
        label: l.break_label ?? "",
      })),
    },
  ];

  const timestamp = new Date().toISOString().slice(0, 10);
  return respondExcel("Ruang & Jam", SHEETS[0].columns, SHEETS[0].rows, `ruang-jam-${timestamp}.xlsx`);
}
