import { randomUUID } from "crypto";
import { db } from "@/lib/db";

export const BK_MODULE = "bk";

export function generateSummonLetterNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `BK/${year}/${month}/${randomUUID().slice(0, 6).toUpperCase()}`;
}

export async function getStaffIdForUser(userId?: string | null) {
  if (!userId) return null;
  const staff = await db.staff.findFirst({
    where: { userId, deleted_at: null },
    select: { id: true },
  });
  return staff?.id ?? null;
}

export function serializeCaseStatus(status: string) {
  const labels: Record<string, string> = {
    OPEN: "Terbuka",
    IN_PROGRESS: "Dalam Penanganan",
    RESOLVED: "Selesai",
    CLOSED: "Ditutup",
  };
  return labels[status] ?? status;
}

export function serializeReferralStatus(status: string) {
  const labels: Record<string, string> = {
    PENDING: "Menunggu",
    ACCEPTED: "Diterima",
    IN_PROGRESS: "Diproses",
    RESOLVED: "Selesai",
    REJECTED: "Ditolak",
  };
  return labels[status] ?? status;
}

export function serializeVisibility(visibility: string) {
  const labels: Record<string, string> = {
    PRIVATE_BK: "Privat BK",
    HOMEROOM: "Wali Kelas",
    TEACHER: "Guru",
    PARENT_VISIBLE: "Terlihat Orang Tua",
  };
  return labels[visibility] ?? visibility;
}

export function totalDisciplinePoints(records: Array<{ points: number }>) {
  return records.reduce((sum, record) => sum + record.points, 0);
}
