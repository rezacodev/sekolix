import { db } from "@/lib/db";
import ExcelJS from "exceljs";
import { PDFDocument as PDFLibDocument, rgb, StandardFonts } from "pdf-lib";
import type { Prisma, ApplicantStatus, Applicant } from "@prisma/client";

type ApplicantExport = {
  id: string;
  registrationCode?: string | null;
  fullName?: string | null;
  program?: { name?: string } | null;
  academicYear?: { label?: string } | null;
  status?: string | null;
};

// FullApplicant type is declared later with a narrower scope; remove duplicate

async function applicantsForExport(
  filters: { yearId?: string; status?: string; program?: string } = {}
): Promise<ApplicantExport[]> {
  const { yearId, status, program } = filters;
  const where: Prisma.ApplicantWhereInput = {};
  // normalize filters: treat common sentinel values as no-filter
  const normalize = (v?: string) => {
    if (!v) return undefined;
    const t = String(v).trim().toLowerCase();
    if (t === "all" || t === "null" || t === "undefined" || t === "") return undefined;
    return v;
  };

  const yearFilter = normalize(yearId);
  let statusFilter = normalize(status) as unknown as ApplicantStatus | undefined;
  // default to accepted when no explicit status provided
  if (!statusFilter) {
    statusFilter = "accepted" as unknown as ApplicantStatus;
  }
  const programFilterRaw = normalize(program);

  if (yearFilter) where.academicYearId = yearFilter;
  if (statusFilter) where.status = statusFilter;

  // program filter: support program name, programChoice, or programId
  if (programFilterRaw) {
    const pf = programFilterRaw;
    const maybeId = /[0-9a-fA-F-]{20,}/.test(pf);
    const orClauses: Prisma.ApplicantWhereInput[] = [];
    if (maybeId) orClauses.push({ programId: pf });
    orClauses.push({ program: { is: { name: pf } } });
    orClauses.push({ programChoice: pf });
    where.OR = orClauses;
  }

  const rows = await db.applicant.findMany({
    where,
    include: { program: true, academicYear: true },
    orderBy: { fullName: "asc" }
  });

  // Map to a narrow export shape
  return rows.map(r => ({
    id: r.id,
    registrationCode: r.registrationCode ?? null,
    fullName: r.fullName ?? null,
    program: r.program ? { name: r.program.name } : null,
    academicYear: r.academicYear ? { label: r.academicYear.label } : null,
    status: r.status ?? null
  }));
}

// Fetch full applicant records (including relations) for detailed exports
// Removed unused helper `fetchFullApplicants` to avoid lint warnings.

async function pdfBufferFromApplicants(applicants: ApplicantExport[]): Promise<Buffer> {
  // Use built-in Helvetica to avoid relying on external TTF files
  const pdfDoc = await PDFLibDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  let page = pdfDoc.addPage([595.28, 841.89]); // A4 in points
  const { height } = page.getSize();
  const margin = 40;
  let y = height - margin;

  const titleSize = 16;
  page.drawText("Rekap Siswa Diterima", {
    x: margin,
    y: y - titleSize,
    size: titleSize,
    font,
    color: rgb(0, 0, 0)
  });
  y -= titleSize + 10;

  const header = ["Kode", "Nama", "Program", "Tahun Ajaran", "Status"];
  const colWidths = [80, 200, 120, 100, 70];
  const fontSize = 10;

  // Draw header
  let x = margin;
  for (let i = 0; i < header.length; i++) {
    page.drawText(header[i], { x, y: y - fontSize, size: fontSize, font, color: rgb(0, 0, 0) });
    x += colWidths[i];
  }
  y -= fontSize + 8;

  // Rows
  for (const a of applicants) {
    x = margin;
    const row = [
      a.registrationCode ?? "",
      a.fullName ?? "",
      a.program?.name ?? "",
      a.academicYear?.label ?? "",
      a.status ?? ""
    ];
    for (let i = 0; i < row.length; i++) {
      page.drawText(String(row[i]), {
        x,
        y: y - fontSize,
        size: fontSize,
        font,
        color: rgb(0, 0, 0)
      });
      x += colWidths[i];
    }
    y -= fontSize + 6;
    if (y < margin + 50) {
      // add a new page and continue drawing there
      page = pdfDoc.addPage([595.28, 841.89]);
      y = page.getSize().height - margin;
    }
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const type = (url.searchParams.get("type") || "pdf").toLowerCase();
    const yearId = url.searchParams.get("yearId") || undefined;
    const status = url.searchParams.get("status") || undefined;
    const program = url.searchParams.get("program") || undefined;

    const applicants = await applicantsForExport({ yearId, status, program });

    const today = new Date().toISOString().slice(0, 10);

    if (type === "xlsx" || type === "excel" || type === "csv") {
      // fetch full applicant records for richer export
      const ids = applicants.map(a => a.id);
      const fullApplicants = await db.applicant.findMany({
        where: ids.length ? { id: { in: ids } } : {},
        include: { program: true, academicYear: true },
        orderBy: { fullName: "asc" }
      });

      const columns = [
        { header: "ID", key: "id" },
        { header: "Kode Pendaftaran", key: "registrationCode" },
        { header: "NIK", key: "nik" },
        { header: "Nama Lengkap", key: "fullName" },
        { header: "Email", key: "email" },
        { header: "Telepon", key: "phone" },
        { header: "Asal Sekolah", key: "schoolOrigin" },
        { header: "Pilihan Program", key: "programChoice" },
        { header: "Program", key: "programName" },
        { header: "Tahun Ajaran", key: "academicYear" },
        { header: "Status", key: "status" },
        { header: "Catatan", key: "notes" },
        { header: "Ditangani Oleh", key: "handledBy" },
        { header: "Profil Lengkap", key: "profileCompleted" },
        { header: "Jenis Kelamin", key: "gender" },
        { header: "NISN", key: "nisn" },
        { header: "No KK", key: "noKK" },
        { header: "Tempat Lahir", key: "placeOfBirth" },
        { header: "Tanggal Lahir", key: "dateOfBirth" },
        { header: "Kewarganegaraan", key: "nationality" },
        { header: "Agama", key: "religion" },
        { header: "Bahasa Ibu", key: "motherTongue" },
        { header: "Alamat", key: "address" },
        { header: "Desa/Kelurahan", key: "village" },
        { header: "Kecamatan", key: "district" },
        { header: "Kota", key: "city" },
        { header: "Provinsi", key: "province" },
        { header: "Kode Pos", key: "postalCode" },
        { header: "Nama Ayah", key: "fatherName" },
        { header: "NIK Ayah", key: "fatherNik" },
        { header: "Tahun Lahir Ayah", key: "fatherBirthYear" },
        { header: "Pendidikan Ayah", key: "fatherEducation" },
        { header: "Pekerjaan Ayah", key: "fatherOccupation" },
        { header: "Pendapatan Ayah", key: "fatherIncome" },
        { header: "Nama Ibu", key: "motherName" },
        { header: "NIK Ibu", key: "motherNik" },
        { header: "Tahun Lahir Ibu", key: "motherBirthYear" },
        { header: "Pendidikan Ibu", key: "motherEducation" },
        { header: "Pekerjaan Ibu", key: "motherOccupation" },
        { header: "Pendapatan Ibu", key: "motherIncome" },
        { header: "Nama Wali", key: "guardianName" },
        { header: "NIK Wali", key: "guardianNik" },
        { header: "Tahun Lahir Wali", key: "guardianBirthYear" },
        { header: "Pendidikan Wali", key: "guardianEducation" },
        { header: "Pekerjaan Wali", key: "guardianOccupation" },
        { header: "Pendapatan Wali", key: "guardianIncome" },
        { header: "Kontak Mobile", key: "mobile" },
        { header: "Tinggal Dengan", key: "livesWith" },
        { header: "Berat (kg)", key: "weight" },
        { header: "Tinggi (cm)", key: "height" },
        { header: "Jarak ke Sekolah (km)", key: "distanceToSchool" },
        { header: "Transportasi", key: "transportationMode" },
        { header: "Anak Ke", key: "anakKe" },
        { header: "Jumlah Saudara", key: "jumlahSaudara" },
        { header: "Prestasi", key: "achievements" },
        { header: "Dibuat Pada", key: "createdAt" },
        { header: "Diupdate Pada", key: "updatedAt" }
      ];

      // CSV helper
      const escapeCsv = (v: unknown): string => {
        if (v === null || v === undefined) return "";
        const s = typeof v === "string" ? v : String(v);
        const cleaned = s.replace(/\r\n|\r|\n/g, " ");
        if (cleaned.includes(",") || cleaned.includes('"')) {
          return '"' + cleaned.replace(/"/g, '""') + '"';
        }
        return cleaned;
      };

      const formatValue = (r: FullApplicant, key: string): string => {
        switch (key) {
          case "programName":
            return r.program?.name ?? "";
          case "academicYear":
            return r.academicYear?.label ?? "";
          case "dateOfBirth":
            return r.dateOfBirth ? r.dateOfBirth.toISOString().split("T")[0] : "";
          case "createdAt":
            return r.createdAt ? r.createdAt.toISOString() : "";
          case "updatedAt":
            return r.updatedAt ? r.updatedAt.toISOString() : "";
          default: {
            const val = (r as unknown as Record<string, unknown>)[key];
            return val === null || val === undefined ? "" : String(val);
          }
        }
      };

      type FullApplicant = Applicant & {
        program?: { name?: string } | null;
        academicYear?: { label?: string } | null;
      };
      const fullTyped = fullApplicants as FullApplicant[];
      const rows: string[][] = fullTyped.map((r: FullApplicant) => {
        return columns.map(c => formatValue(r, c.key));
      });

      if (type === "csv") {
        const csvLines = [columns.map(c => c.header).join(",")].concat(
          rows.map(r => r.map(escapeCsv).join(","))
        );
        const csvBuffer = Buffer.from(csvLines.join("\n"), "utf-8");
        return new Response(csvBuffer as unknown as BodyInit, {
          status: 200,
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="siswa_diterima_${today}.csv"`
          }
        });
      }

      // XLSX generation for full data
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Siswa Diterima");
      sheet.columns = columns.map(c => ({ header: c.header, key: c.key, width: 20 }));
      rows.forEach(r => {
        const obj: Record<string, string> = {};
        columns.forEach((c, i) => (obj[c.key] = r[i]));
        sheet.addRow(obj);
      });

      const arrayBuffer = await workbook.xlsx.writeBuffer();
      const buffer = Buffer.from(arrayBuffer as ArrayBuffer);
      return new Response(buffer as unknown as BodyInit, {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="siswa_diterima_${today}.xlsx"`
        }
      });
    }

    // default PDF — if PDF generation fails, fall back to XLSX to avoid
    // returning a 500 when pdfkit can't load AFM/font data in some dev
    // environments. This ensures the export endpoint still returns usable
    // data for the user while we address the root cause.
    try {
      const buffer = await pdfBufferFromApplicants(applicants);
      return new Response(buffer as unknown as BodyInit, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="siswa_diterima_${today}.pdf"`
        }
      });
    } catch (pdfErr) {
      console.error("PDF generation failed, falling back to XLSX:", pdfErr);

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Siswa Diterima");
      sheet.columns = [
        { header: "Kode", key: "kode", width: 20 },
        { header: "Nama", key: "nama", width: 40 },
        { header: "Program", key: "program", width: 30 },
        { header: "Tahun Ajaran", key: "tahun", width: 20 },
        { header: "Status", key: "status", width: 15 }
      ];

      applicants.forEach(a => {
        sheet.addRow({
          kode: a.registrationCode ?? "",
          nama: a.fullName ?? "",
          program: a.program?.name ?? "",
          tahun: a.academicYear?.label ?? "",
          status: a.status ?? ""
        });
      });

      const arrayBuffer = await workbook.xlsx.writeBuffer();
      const buffer = Buffer.from(arrayBuffer as ArrayBuffer);
      return new Response(buffer as unknown as BodyInit, {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="siswa_diterima_${today}_fallback.xlsx"`,
          "X-Export-Fallback": "pdf->xlsx"
        }
      });
    }
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Gagal membuat export." }), { status: 500 });
  }
}
