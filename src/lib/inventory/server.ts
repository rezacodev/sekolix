import { randomUUID } from "crypto";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export const INVENTORY_MODULE = "inventaris";
export const DEFAULT_ASSET_LOAN_DAYS = 3;

export function generateAssetCode(prefix = "AST") {
  const now = new Date();
  return `${prefix}-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

export function generateAssetQrPayload(assetCode: string) {
  return `/admin/inventaris/label?asset=${encodeURIComponent(assetCode)}`;
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

export async function getStaffIdForUser(userId?: string | null) {
  if (!userId) return null;
  const staff = await db.staff.findFirst({
    where: { userId, deleted_at: null },
    select: { id: true },
  });
  return staff?.id ?? null;
}

export function serializeAssetStatus(status: string) {
  const labels: Record<string, string> = {
    ACTIVE: "Aktif",
    BORROWED: "Dipinjam",
    MAINTENANCE: "Pemeliharaan",
    LOST: "Hilang",
    DISPOSED: "Dihapuskan",
  };
  return labels[status] ?? status;
}

export function serializeAssetCondition(condition: string) {
  const labels: Record<string, string> = {
    GOOD: "Baik",
    FAIR: "Cukup",
    DAMAGED: "Rusak",
    BROKEN: "Berat",
  };
  return labels[condition] ?? condition;
}

export function serializeLoanStatus(status: string) {
  const labels: Record<string, string> = {
    REQUESTED: "Diajukan",
    APPROVED: "Disetujui",
    BORROWED: "Dipinjam",
    RETURNED: "Dikembalikan",
    REJECTED: "Ditolak",
  };
  return labels[status] ?? status;
}

export function serializeMaintenanceStatus(status: string) {
  const labels: Record<string, string> = {
    SCHEDULED: "Terjadwal",
    IN_PROGRESS: "Dikerjakan",
    DONE: "Selesai",
    CANCELLED: "Dibatalkan",
  };
  return labels[status] ?? status;
}

export function needsMaintenance(condition: string, status: string) {
  return condition === "DAMAGED" || condition === "BROKEN" || status === "MAINTENANCE";
}

export function getReturnAssetStatus(condition: string) {
  if (condition === "BROKEN") return "MAINTENANCE";
  if (condition === "DAMAGED") return "MAINTENANCE";
  return "ACTIVE";
}

