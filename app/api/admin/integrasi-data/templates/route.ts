import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/api/guards";
import { buildExcelBuffer } from "@/lib/reports/excel";
import { getIntegrationTemplateColumns, supportedEntityOrDefault } from "@/lib/data-integration/server";

export async function GET(request: Request) {
  const access = await requireApiPermission("read", "integrasi-data");
  if (!access.ok) return access.response;

  const url = new URL(request.url);
  const entity = supportedEntityOrDefault(url.searchParams.get("entity"));
  const columns = getIntegrationTemplateColumns(entity);
  const rows = [
    Object.fromEntries(columns.map((column) => [column.key, column.sample ?? ""])),
  ];
  const requirements = columns.map((column) => ({
    field: column.key,
    label: column.header,
    required: column.required ? "Ya" : "Tidak",
  }));
  const buffer = await buildExcelBuffer([
    { name: `Template ${entity}`, columns, rows },
    {
      name: "Catatan",
      columns: [
        { key: "field", header: "Field", width: 24 },
        { key: "label", header: "Label", width: 32 },
        { key: "required", header: "Wajib", width: 12 },
      ],
      rows: requirements,
    },
  ]);
  const filename = `template-integrasi-${entity}.xlsx`;

  return new NextResponse(buffer, {
    headers: {
      "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "content-disposition": `attachment; filename="${filename}"`,
    },
  });
}
