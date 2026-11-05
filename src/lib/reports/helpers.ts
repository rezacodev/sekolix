/**
 * Shared helpers for laporan API routes:
 * - Year/semester resolution from query
 * - Response builders for Excel & PDF
 * - Common filters (active academic year, etc.)
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildSimpleExcel, type ExcelColumn } from "./excel";
import { buildPdfBuffer, type PdfTableSpec, type PdfOptions } from "./pdf";

/** Resolve the academic year from `tahunAjaranId` query or fall back to the active one. */
export async function resolveTahunAjaran(tahunAjaranId?: string | null) {
  if (tahunAjaranId) {
    const found = await prisma.tahunAjaran.findUnique({ where: { id: tahunAjaranId } });
    if (found) return found;
  }
  return prisma.tahunAjaran.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
}

/** Require admin or editor role; returns null + NextResponse on failure. */
export async function requireReportAccess(): Promise<
  { ok: true } | { ok: false; response: NextResponse }
> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  const role = session.user.role;
  if (role !== "ADMIN" && role !== "EDITOR" && role !== "SUPERADMIN") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { ok: true };
}

/** Build an Excel HTTP response with sensible filename. */
export function excelResponse(buffer: ArrayBuffer, filename: string): NextResponse {
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

/** Build a PDF HTTP response with sensible filename. */
export function pdfResponse(buffer: Uint8Array, filename: string): NextResponse {
  return new NextResponse(Buffer.from(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

/** Higher-level helper: build Excel from columns + rows. */
export async function respondExcel(
  sheetName: string,
  columns: ExcelColumn[],
  rows: Array<Record<string, unknown>>,
  filename: string
): Promise<NextResponse> {
  const buffer = await buildSimpleExcel(sheetName, columns, rows);
  return excelResponse(buffer, filename);
}

/** Higher-level helper: build PDF from a table spec + options. */
export async function respondPdf(
  table: PdfTableSpec,
  options: PdfOptions,
  filename: string
): Promise<NextResponse> {
  const buffer = await buildPdfBuffer(table, options);
  return pdfResponse(buffer, filename);
}

/** Standardised error response shape. */
export function errorResponse(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/** Format date as dd/mm/yyyy (id-ID). */
export function formatDateID(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

/** Format number with id-ID locale. */
export function formatNumberID(value: number | null | undefined, fractionDigits = 2): string {
  if (value === null || value === undefined) return "";
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}
