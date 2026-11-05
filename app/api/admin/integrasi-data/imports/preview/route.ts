import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";
import {
  jsonSafe,
  mapStudentImportRow,
  parseImportRows,
  supportedEntityOrDefault,
  validateStudentImportRow,
} from "@/lib/data-integration/server";
import { getDefaultIntegrationProfile } from "@/lib/data-integration/persistence";

const previewSchema = z.object({
  profileId: z.string().optional().nullable(),
  entity: z.string().optional().nullable(),
  fileName: z.string().trim().max(255).optional().nullable(),
  rows: z.unknown().optional(),
  items: z.unknown().optional(),
});

function asJson(value: unknown): Prisma.InputJsonValue {
  return jsonSafe(value) as Prisma.InputJsonValue;
}

export async function POST(request: Request) {
  const access = await requireApiPermission("create", "integrasi-data");
  if (!access.ok) return access.response;

  const parsed = previewSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload preview tidak valid", details: parsed.error.flatten() }, { status: 400 });
  }

  const entity = supportedEntityOrDefault(parsed.data.entity);
  const rows = parseImportRows(parsed.data.rows ?? parsed.data.items ?? []);
  if (rows.length === 0) return NextResponse.json({ error: "Minimal satu baris data wajib dikirim" }, { status: 400 });

  const profile = parsed.data.profileId
    ? await db.dataIntegrationProfile.findUnique({ where: { id: parsed.data.profileId } })
    : await getDefaultIntegrationProfile();
  if (!profile) return NextResponse.json({ error: "Profil integrasi belum tersedia" }, { status: 400 });

  const preparedRows = rows.map((row, index) => {
    const issues = entity === "students" ? validateStudentImportRow(row) : [];
    const mapped = entity === "students" ? mapStudentImportRow(row) : row;
    const hasError = issues.some((issue) => issue.severity === "ERROR");
    return {
      row_number: index + 2,
      raw_data: asJson(row),
      mapped_data: asJson(mapped),
      status: hasError ? "ERROR" : issues.length > 0 ? "WARNING" : "VALID",
      errors: asJson(issues),
    };
  });

  const batch = await db.importBatch.create({
    data: {
      profile_id: profile.id,
      entity,
      file_name: parsed.data.fileName ?? `preview-${entity}.json`,
      status: "VALIDATED",
      total_rows: preparedRows.length,
      valid_rows: preparedRows.filter((row) => row.status !== "ERROR").length,
      error_rows: preparedRows.filter((row) => row.status === "ERROR").length,
      created_by: access.context.user.id,
      rows: { create: preparedRows },
    },
    include: { rows: { orderBy: { row_number: "asc" } }, profile: true },
  });

  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "integrasi-data",
    action: "preview_import",
    entityType: "ImportBatch",
    entityId: batch.id,
    metadata: { entity, totalRows: batch.total_rows, errorRows: batch.error_rows },
    request,
  });
  await writeAuditTrail({
    actorUserId: access.context.user.id,
    entityType: "ImportBatch",
    entityId: batch.id,
    action: "preview",
    after: { entity, totalRows: batch.total_rows, validRows: batch.valid_rows, errorRows: batch.error_rows },
  });

  return NextResponse.json({ data: batch }, { status: 201 });
}
