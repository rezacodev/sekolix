import { db } from "@/lib/db";

export const EXTRACURRICULAR_MODULE = "ekstrakurikuler";

export async function getStaffIdForUser(userId?: string | null) {
  if (!userId) return null;
  const staff = await db.staff.findFirst({
    where: { userId, deleted_at: null },
    select: { id: true },
  });
  return staff?.id ?? null;
}

export async function getStudentForUser(email?: string | null) {
  if (!email) return null;
  return db.pesertaDidik.findFirst({ where: { email, deleted_at: null } });
}

export function serializeMemberStatus(status: string) {
  const labels: Record<string, string> = {
    REGISTERED: "Terdaftar",
    ACTIVE: "Aktif",
    INACTIVE: "Nonaktif",
    ALUMNI: "Alumni",
  };
  return labels[status] ?? status;
}

export function serializeRegistrationStatus(status: string) {
  const labels: Record<string, string> = {
    PENDING: "Menunggu",
    APPROVED: "Disetujui",
    REJECTED: "Ditolak",
  };
  return labels[status] ?? status;
}

export function serializeAttendanceStatus(status: string) {
  const labels: Record<string, string> = {
    PRESENT: "Hadir",
    SICK: "Sakit",
    PERMISSION: "Izin",
    ABSENT: "Alpa",
  };
  return labels[status] ?? status;
}

