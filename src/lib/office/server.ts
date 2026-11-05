import { randomUUID } from "crypto";
import { db } from "@/lib/db";

export const OFFICE_MODULE = "tata-usaha";

export async function getStaffIdForUser(userId?: string | null) {
  if (!userId) return null;
  const staff = await db.staff.findFirst({
    where: { userId, deleted_at: null },
    select: { id: true },
  });
  return staff?.id ?? null;
}

export async function nextOfficeNumber(scope: string, prefix: string) {
  const sequence = await db.tuNumberSequence.upsert({
    where: { scope },
    update: { current_number: { increment: 1 }, prefix },
    create: { scope, prefix, current_number: 1 },
  });
  return `${sequence.prefix}/${new Date().getFullYear()}/${String(sequence.current_number).padStart(sequence.padding, "0")}`;
}

export function generateValidationCode() {
  return randomUUID().replaceAll("-", "").slice(0, 16).toUpperCase();
}

export function generateQrPayload(validationCode: string) {
  return `/api/verify/letters/${validationCode}`;
}

export function renderTemplate(body: string, variables: Record<string, unknown>) {
  return body.replace(/{{\s*([\w.]+)\s*}}/g, (_match, key: string) => {
    const value = variables[key];
    if (value == null) return "";
    return String(value);
  });
}

export function normalizeJson(value: Record<string, unknown>) {
  return JSON.parse(JSON.stringify(value));
}

export async function buildSubjectVariables(input: { studentId?: string | null; staffId?: string | null; variables?: Record<string, unknown> }): Promise<Record<string, unknown>> {
  const [school, student, staff] = await Promise.all([
    db.schoolIdentity.findFirst({ orderBy: { createdAt: "desc" } }),
    input.studentId ? db.pesertaDidik.findUnique({ where: { id: input.studentId } }) : null,
    input.staffId ? db.staff.findUnique({ where: { id: input.staffId } }) : null,
  ]);

  return {
    sekolah: school?.name ?? "Sekolah",
    kepala_sekolah: school?.headmaster ?? "",
    npsn: school?.npsn ?? "",
    alamat_sekolah: school?.address ?? "",
    nama_siswa: student?.fullName ?? "",
    nisn: student?.nisn ?? "",
    nik_siswa: student?.nik ?? "",
    nama_pegawai: staff?.name ?? "",
    nip: staff?.nip ?? "",
    jabatan: staff?.position ?? staff?.jabatanPTK ?? "",
    tanggal: new Date().toLocaleDateString("id-ID"),
    ...(input.variables ?? {}),
  };
}

export function serializeLetterStatus(status: string) {
  const labels: Record<string, string> = {
    DRAFT: "Draft",
    WAITING_APPROVAL: "Menunggu Approval",
    APPROVED: "Disetujui",
    SENT: "Terkirim",
    ARCHIVED: "Diarsipkan",
    CANCELLED: "Dibatalkan",
    RECEIVED: "Diterima",
  };
  return labels[status] ?? status;
}

export function serializeDispositionStatus(status: string) {
  const labels: Record<string, string> = {
    OPEN: "Terbuka",
    IN_PROGRESS: "Diproses",
    DONE: "Selesai",
  };
  return labels[status] ?? status;
}
