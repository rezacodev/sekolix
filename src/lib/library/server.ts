import { randomUUID } from "crypto";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export const LIBRARY_MODULE = "perpustakaan";
export const DEFAULT_LOAN_DAYS = 7;
export const DEFAULT_DAILY_FINE = 1000;

export function generateBarcode(prefix = "LIB") {
  const now = new Date();
  return `${prefix}-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

export function generateMemberCode(type: "STUDENT" | "STAFF") {
  return `${type === "STUDENT" ? "STD" : "STF"}-${randomUUID().slice(0, 10).toUpperCase()}`;
}

export function toMoneyNumber(value: Prisma.Decimal | number | string | null | undefined) {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return value.toNumber();
}

export function formatRupiah(value: Prisma.Decimal | number | string | null | undefined) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(toMoneyNumber(value));
}

export function calculateOverdueDays(dueAt: Date, returnedAt = new Date()) {
  const diffMs = returnedAt.getTime() - dueAt.getTime();
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / (24 * 60 * 60 * 1000));
}

export function calculateFineAmount(dueAt: Date, returnedAt = new Date(), dailyFine = DEFAULT_DAILY_FINE) {
  return calculateOverdueDays(dueAt, returnedAt) * dailyFine;
}

export async function getStaffIdForUser(userId?: string | null) {
  if (!userId) return null;
  const staff = await db.staff.findFirst({
    where: { userId, deleted_at: null },
    select: { id: true },
  });
  return staff?.id ?? null;
}

export function serializeCopyStatus(status: string) {
  const labels: Record<string, string> = {
    AVAILABLE: "Tersedia",
    BORROWED: "Dipinjam",
    LOST: "Hilang",
    DAMAGED: "Rusak",
    IN_REPAIR: "Perbaikan",
  };
  return labels[status] ?? status;
}

export function serializeLoanStatus(status: string) {
  const labels: Record<string, string> = {
    ACTIVE: "Aktif",
    RETURNED: "Dikembalikan",
    OVERDUE: "Terlambat",
    LOST: "Hilang",
  };
  return labels[status] ?? status;
}
