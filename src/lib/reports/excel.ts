/**
 * Excel/CSV export helpers using exceljs.
 * Used by laporan endpoints to produce downloadable .xlsx files.
 */
import ExcelJS from "exceljs";

export interface ExcelColumn {
  header: string;
  key: string;
  /** Column width in characters (Excel-style) */
  width?: number;
  /** Optional cell formatter */
  formatter?: (value: unknown) => string | number | boolean | Date | null;
}

export interface ExcelSheetSpec {
  name: string;
  columns: ExcelColumn[];
  rows: Array<Record<string, unknown>>;
}

/**
 * Build an .xlsx workbook buffer from one or more sheets.
 * Returns ArrayBuffer suitable for NextResponse consumption.
 */
export async function buildExcelBuffer(
  sheets: ExcelSheetSpec[],
  options: { creator?: string } = {}
): Promise<ArrayBuffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = options.creator ?? "Sekolix";
  workbook.created = new Date();

  for (const sheetSpec of sheets) {
    const worksheet = workbook.addWorksheet(sheetSpec.name.slice(0, 31));
    worksheet.columns = sheetSpec.columns.map((col) => ({
      header: col.header,
      key: col.key,
      width: col.width ?? 20,
    }));

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE2E8F0" },
    };

    // Add rows
    for (const row of sheetSpec.rows) {
      const excelRow: Record<string, unknown> = {};
      for (const col of sheetSpec.columns) {
        const raw = row[col.key];
        excelRow[col.key] = col.formatter ? col.formatter(raw) : (raw as string | number | boolean | Date | null);
      }
      worksheet.addRow(excelRow);
    }

    // Auto-filter on header row
    if (sheetSpec.rows.length > 0) {
      worksheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: sheetSpec.columns.length },
      };
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as ArrayBuffer;
}

/**
 * Convenience helper for the common case of a single-sheet workbook.
 */
export async function buildSimpleExcel(
  sheetName: string,
  columns: ExcelColumn[],
  rows: Array<Record<string, unknown>>
): Promise<ArrayBuffer> {
  return buildExcelBuffer([{ name: sheetName, columns, rows }]);
}

/**
 * Trigger a download of the buffer in the browser.
 */
export function triggerBrowserDownload(
  buffer: ArrayBuffer,
  filename: string,
  mime = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
): void {
  const blob = new Blob([buffer], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
