import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";

export async function GET() {
  const access = await requireApiPermission("read", "integrasi-data");
  if (!access.ok) return access.response;

  const [
    profiles,
    mappings,
    importBatches,
    exportBatches,
    openIssues,
    errorIssues,
    incompleteStudents,
    duplicateNik,
    duplicateNisn,
  ] = await Promise.all([
    db.dataIntegrationProfile.count({ where: { is_active: true } }),
    db.dataFieldMapping.count(),
    db.importBatch.count(),
    db.exportBatch.count(),
    db.dataValidationIssue.count({ where: { status: "OPEN" } }),
    db.dataValidationIssue.count({ where: { status: "OPEN", severity: "ERROR" } }),
    db.pesertaDidik.count({
      where: {
        deleted_at: null,
        OR: [{ nisn: null }, { fatherName: null, motherName: null, guardianName: null }],
      },
    }),
    db.pesertaDidik.groupBy({ by: ["nik"], _count: { nik: true }, having: { nik: { _count: { gt: 1 } } } }),
    db.pesertaDidik.groupBy({
      by: ["nisn"],
      where: { nisn: { not: null } },
      _count: { nisn: true },
      having: { nisn: { _count: { gt: 1 } } },
    }),
  ]);

  return NextResponse.json({
    data: {
      profiles,
      mappings,
      importBatches,
      exportBatches,
      openIssues,
      errorIssues,
      incompleteStudents,
      duplicateNik: duplicateNik.length,
      duplicateNisn: duplicateNisn.length,
    },
  });
}
