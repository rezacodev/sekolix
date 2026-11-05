import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await requireApiPermission("delete", "integrasi-data");
  if (!access.ok) return access.response;

  const { id } = await context.params;
  const batch = await db.importBatch.findUnique({
    where: { id },
    include: { rows: true },
  });
  if (!batch) return NextResponse.json({ error: "Batch import tidak ditemukan" }, { status: 404 });
  if (batch.status === "ROLLED_BACK") return NextResponse.json({ error: "Batch sudah di-rollback" }, { status: 400 });
  if (batch.entity !== "students") return NextResponse.json({ error: "Rollback MVP baru mendukung entitas siswa" }, { status: 400 });

  const ids = batch.rows.map((row) => row.created_record_id).filter((value): value is string => Boolean(value));
  const result = await db.$transaction(async (tx) => {
    const deleted = ids.length
      ? await tx.pesertaDidik.updateMany({
          where: { id: { in: ids }, deleted_at: null },
          data: { deleted_at: new Date(), notes: `Di-rollback dari ImportBatch ${batch.id}` },
        })
      : { count: 0 };
    const updated = await tx.importBatch.update({
      where: { id: batch.id },
      data: { status: "ROLLED_BACK", rolled_back_at: new Date() },
    });
    return { batch: updated, rolledBackRecords: deleted.count };
  });

  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "integrasi-data",
    action: "rollback_import",
    entityType: "ImportBatch",
    entityId: batch.id,
    metadata: { entity: batch.entity, records: result.rolledBackRecords },
    request,
  });
  await writeAuditTrail({
    actorUserId: access.context.user.id,
    entityType: "ImportBatch",
    entityId: batch.id,
    action: "rollback",
    before: { status: batch.status, records: ids.length },
    after: result,
  });

  return NextResponse.json({ data: result });
}
