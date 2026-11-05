/**
 * PDF report helpers using pdf-lib.
 * Used by laporan endpoints to produce downloadable .pdf files.
 */
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

export interface PdfColumnSpec {
  header: string;
  /** Function to extract the value for this column from a row */
  get: (row: Record<string, unknown>) => string | number;
  /** Column width in points (default: 80) */
  width?: number;
  align?: "left" | "right" | "center";
}

export interface PdfTableSpec {
  /** Page-width columns list — total width should be <= usable page width */
  columns: PdfColumnSpec[];
  rows: Array<Record<string, unknown>>;
  title?: string;
  subtitle?: string;
}

export interface PdfOptions {
  title: string;
  subtitle?: string;
  /** Landscape A4 by default for tables */
  landscape?: boolean;
  footerText?: string;
}

/**
 * Render a basic tabular PDF report.
 * Suitable for A4-sized reports; long tables auto-paginate.
 */
export async function buildPdfBuffer(spec: PdfTableSpec, options: PdfOptions): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(options.title);
  pdfDoc.setCreator("Sekolix");
  pdfDoc.setProducer("Sekolix Reports");

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = options.landscape === false ? 595.28 : 841.89; // A4
  const pageHeight = options.landscape === false ? 841.89 : 595.28;
  const margin = 40;
  const usableWidth = pageWidth - margin * 2;
  const rowHeight = 18;

  // Normalize column widths to fit usable area
  const totalRequested = spec.columns.reduce((acc, c) => acc + (c.width ?? 80), 0);
  const scale = usableWidth / totalRequested;
  const columnWidths = spec.columns.map((c) => (c.width ?? 80) * scale);

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  // Header
  drawText(page, options.title, fontBold, 16, margin, y, { color: rgb(0.06, 0.09, 0.16) });
  y -= 22;

  if (options.subtitle) {
    drawText(page, options.subtitle, fontRegular, 10, margin, y, { color: rgb(0.4, 0.45, 0.55) });
    y -= 18;
  }

  y -= 6;
  drawHorizontalLine(page, y, margin, usableWidth);
  y -= 16;

  // Table header
  drawTableRow(page, spec.columns, columnWidths, margin, y, fontBold, true);
  y -= rowHeight;
  drawHorizontalLine(page, y + 4, margin, usableWidth);

  // Rows
  for (const row of spec.rows) {
    if (y < margin + rowHeight) {
      // New page
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
      drawTableRow(page, spec.columns, columnWidths, margin, y, fontBold, true);
      y -= rowHeight;
      drawHorizontalLine(page, y + 4, margin, usableWidth);
    }

    drawTableRow(page, spec.columns, columnWidths, margin, y, fontRegular, false, row);
    y -= rowHeight;
  }

  // Footer on each page
  const pages = pdfDoc.getPages();
  pages.forEach((p, idx) => {
    const footer = options.footerText ?? "Sekolix — Laporan Akademik";
    drawText(p, footer, fontRegular, 8, margin, 20, { color: rgb(0.4, 0.45, 0.55) });
    drawText(
      p,
      `Halaman ${idx + 1} / ${pages.length}`,
      fontRegular,
      8,
      pageWidth - margin - 60,
      20,
      { color: rgb(0.4, 0.45, 0.55), align: "right" as const }
    );
  });

  return pdfDoc.save();
}

function drawText(
  page: PDFPage,
  text: string,
  font: PDFFont,
  size: number,
  x: number,
  y: number,
  options: { color?: ReturnType<typeof rgb>; align?: "left" | "right" | "center" } = {}
): void {
  const textWidth = font.widthOfTextAtSize(text, size);
  let drawX = x;
  if (options.align === "right") drawX = x - textWidth;
  else if (options.align === "center") drawX = x - textWidth / 2;
  page.drawText(text, { x: drawX, y, size, font, color: options.color ?? rgb(0, 0, 0) });
}

function drawHorizontalLine(page: PDFPage, y: number, x: number, width: number): void {
  page.drawLine({
    start: { x, y },
    end: { x: x + width, y },
    thickness: 0.5,
    color: rgb(0.7, 0.75, 0.82),
  });
}

function drawTableRow(
  page: PDFPage,
  columns: PdfColumnSpec[],
  widths: number[],
  startX: number,
  y: number,
  font: PDFFont,
  isHeader: boolean,
  row?: Record<string, unknown>
): void {
  let x = startX;
  for (let i = 0; i < columns.length; i++) {
    const col = columns[i];
    const w = widths[i];
    const text = isHeader ? col.header : String(col.get(row ?? {}) ?? "");
    const truncated = text.length > Math.floor(w / 4) ? text.slice(0, Math.floor(w / 4) - 1) + "…" : text;

    const fillColor = isHeader ? rgb(0.94, 0.96, 0.99) : undefined;
    if (fillColor) {
      page.drawRectangle({
        x,
        y: y - 4,
        width: w,
        height: 16,
        color: fillColor,
      });
    }

    drawText(page, truncated, font, 9, x + 4, y, {
      align: col.align ?? "left",
      color: rgb(0.06, 0.09, 0.16),
    });
    x += w;
  }
}
