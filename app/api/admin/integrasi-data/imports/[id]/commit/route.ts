import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";
import { jsonSafe } from "@/lib/data-integration/server";

type MappedStudentRow = {
  nik?: string | null;
  nisn?: string | null;
  fullName?: string | null;
  phone?: string | null;
  email?: string | null;
  gender?: string | null;
  placeOfBirth?: string | null;
  dateOfBirth?: string | null;
  religion?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  fatherName?: string | null;
  motherName?: string | null;
  guardianName?: string | null;
};

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function asStudentRow(value: unknown): MappedStudentRow {
  return asRecord(value) as MappedStudentRow;
}

function parseDate(value?: string | null) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function asJson(value: unknown): Prisma.InputJsonValue {
  return jsonSafe(value) as Prisma.InputJsonValue;
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await requireApiPermission("create", "integrasi-data");
  if (!access.ok) return access.response;

  const { id } = await context.params;
  const batch = await db.importBatch.findUnique({
    where: { id },
    include: { rows: { orderBy: { row_number: "asc" } } },
  });
  if (!batch) return NextResponse.json({ error: "Batch import tidak ditemukan" }, { status: 404 });
  if (batch.status === "IMPORTED") return NextResponse.json({ error: "Batch sudah pernah di-commit" }, { status: 400 });
  if (batch.status === "ROLLED_BACK") return NextResponse.json({ error: "Batch sudah di-rollback" }, { status: 400 });
  if (batch.entity !== "students") {
    return NextResponse.json({ error: "Commit MVP baru mendukung entitas siswa" }, { status: 400 });
  }

  const result = await db.$transaction(async (tx) => {
    let created = 0;
    let failed = 0;

    for (const row of batch.rows) {
      if (row.status === "ERROR") continue;
      const mapped = asStudentRow(row.mapped_data);
      if (!mapped.nik || !mapped.fullName || !mapped.phone) {
        failed += 1;
        await tx.importBatchRow.update({
          where: { id: row.id },
          data: { status: "ERROR", errors: asJson([{ field: "required", severity: "ERROR", message: "NIK, nama, dan telepon wajib diisi." }]) },
        });
        continue;
      }

      const existing = await tx.pesertaDidik.findUnique({ where: { nik: mapped.nik } });
      if (existing) {
        failed += 1;
        await tx.importBatchRow.update({
          where: { id: row.id },
          data: {
            status: "DUPLICATE",
            errors: asJson([{ field: "nik", severity: "ERROR", message: "NIK sudah ada di data peserta didik." }]),
          },
        });
        continue;
      }

      const student = await tx.pesertaDidik.create({
        data: {
          nik: mapped.nik,
          nisn: mapped.nisn || undefined,
          fullName: mapped.fullName,
          phone: mapped.phone,
          email: mapped.email || undefined,
          gender: mapped.gender || undefined,
          placeOfBirth: mapped.placeOfBirth || undefined,
          dateOfBirth: parseDate(mapped.dateOfBirth),
          religion: mapped.religion || undefined,
          address: mapped.address || undefined,
          city: mapped.city || undefined,
          province: mapped.province || undefined,
          postalCode: mapped.postalCode || undefined,
          fatherName: mapped.fatherName || undefined,
          motherName: mapped.motherName || undefined,
          guardianName: mapped.guardianName || undefined,
          notes: `Dibuat dari ImportBatch ${batch.id}`,
        },
      });
      created += 1;
      await tx.importBatchRow.update({
        where: { id: row.id },
        data: { status: "IMPORTED", created_record_id: student.id },
      });
    }

    const updated = await tx.importBatch.update({
      where: { id: batch.id },
      data: {
        status: failed > 0 ? "FAILED" : "IMPORTED",
        imported_at: new Date(),
        valid_rows: created,
        error_rows: batch.rows.filter((row) => row.status === "ERROR").length + failed,
      },
    });
    return { batch: updated, created, failed };
  });

  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "integrasi-data",
    action: "commit_import",
    entityType: "ImportBatch",
    entityId: batch.id,
    metadata: { entity: batch.entity, created: result.created, failed: result.failed },
    request,
  });
  await writeAuditTrail({
    actorUserId: access.context.user.id,
    entityType: "ImportBatch",
    entityId: batch.id,
    action: "commit",
    before: { status: batch.status },
    after: result,
  });

  return NextResponse.json({ data: result });
}
