import { randomUUID } from "crypto";
import { db } from "@/lib/db";

export const STAFF_MODULE = "pegawai";

export function calculateLeaveDays(startDate: Date, endDate: Date) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const diff = end.getTime() - start.getTime();
  if (diff < 0) return 0;
  return Math.floor(diff / (24 * 60 * 60 * 1000)) + 1;
}

export async function getStaffIdForUser(userId?: string | null) {
  if (!userId) return null;
  const staff = await db.staff.findFirst({
    where: { userId, deleted_at: null },
    select: { id: true },
  });
  return staff?.id ?? null;
}

export function generateAssignmentLetterNumber(prefix = "ST") {
  const now = new Date();
  return `${prefix}-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

export function serializeAttendanceStatus(status: string) {
  const labels: Record<string, string> = {
    PRESENT: "Hadir",
    LATE: "Terlambat",
    SICK: "Sakit",
    PERMISSION: "Izin",
    ABSENT: "Alpa",
    LEAVE: "Cuti",
  };
  return labels[status] ?? status;
}

export function serializeLeaveStatus(status: string) {
  const labels: Record<string, string> = {
    PENDING: "Menunggu",
    APPROVED: "Disetujui",
    REJECTED: "Ditolak",
    CANCELLED: "Dibatalkan",
  };
  return labels[status] ?? status;
}

export function serializeDocumentType(type: string) {
  const labels: Record<string, string> = {
    SK: "SK",
    CERTIFICATE: "Sertifikat",
    CONTRACT: "Kontrak",
    IDENTITY: "Identitas",
    OTHER: "Lainnya",
  };
  return labels[type] ?? type;
}

export function serializeContractStatus(status: string) {
  const labels: Record<string, string> = {
    ACTIVE: "Aktif",
    EXPIRING: "Akan Berakhir",
    ENDED: "Berakhir",
    CANCELLED: "Dibatalkan",
  };
  return labels[status] ?? status;
}

export function isWithinReminder(date: Date | null, days = 60) {
  if (!date) return false;
  const now = new Date();
  const limit = new Date();
  limit.setDate(limit.getDate() + days);
  return date >= now && date <= limit;
}

