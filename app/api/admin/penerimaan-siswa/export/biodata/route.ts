import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

function splitTextToLines(
  text: string,
  font: { widthOfTextAtSize: (t: string, s: number) => number },
  size: number,
  maxWidth: number
) {
  const words = String(text).split(" ");
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    const test = current ? current + " " + w : w;
    const width = font.widthOfTextAtSize(test, size);
    if (width > maxWidth) {
      if (current) lines.push(current);
      current = w;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const applicantId = url.searchParams.get("applicantId");
    if (!applicantId)
      return NextResponse.json({ message: "applicantId is required" }, { status: 400 });

    const a = await db.applicant.findUnique({
      where: { id: applicantId },
      include: { program: true, academicYear: true, payments: true }
    });
    if (!a) return NextResponse.json({ message: "Applicant not found" }, { status: 404 });

    const pdfDoc = await PDFDocument.create();
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const mono = await pdfDoc.embedFont(StandardFonts.Courier);

    const pageSize: [number, number] = [595.28, 841.89];
    let page = pdfDoc.addPage(pageSize);
    const { height } = page.getSize();
    const margin = 40;
    let y = height - margin;

    const titleSize = 16;
    // Header
    const schoolTitle = "Biodata Calon Peserta Didik";
    const titleWidth = helveticaBold.widthOfTextAtSize(schoolTitle, titleSize);
    page.drawText(schoolTitle, {
      x: (pageSize[0] - titleWidth) / 2,
      y: y - titleSize,
      size: titleSize,
      font: helveticaBold,
      color: rgb(0, 0, 0)
    });
    y -= titleSize + 10;

    // Registration code (mono) aligned right
    const code = a.registrationCode ?? a.id;
    const codeStr = `Kode: ${code}`;
    const codeWidth = mono.widthOfTextAtSize(codeStr, 10);
    page.drawText(codeStr, {
      x: pageSize[0] - margin - codeWidth,
      y: y + 6,
      size: 10,
      font: mono,
      color: rgb(0, 0, 0)
    });
    y -= 14;

    const sectionGap = 14;
    const labelX = margin;
    const valueX = margin + 140;
    const rightColumnWidth = pageSize[0] - margin - valueX;

    const ensureSpace = (needed = 40) => {
      if (y < margin + needed) {
        page = pdfDoc.addPage(pageSize);
        y = page.getSize().height - margin;
      }
    };

    const drawLabel = (lbl: string, size = 10) => {
      ensureSpace(30);
      page.drawText(lbl, { x: labelX, y: y, size, font: helveticaBold, color: rgb(0.1, 0.1, 0.1) });
    };

    const drawValueWrapped = (
      val: string | number | null | undefined,
      maxWidth = rightColumnWidth,
      size = 10
    ) => {
      const text =
        val === null || val === undefined || String(val).trim() === "" ? "" : String(val);
      const lines = text ? splitTextToLines(text, helvetica, size, maxWidth) : [];
      if (lines.length === 0) {
        page.drawText("-", { x: valueX, y: y, size, font: helvetica, color: rgb(0, 0, 0) });
        y -= size + 3;
        return;
      }
      for (const ln of lines) {
        ensureSpace(20);
        page.drawText(ln, { x: valueX, y: y, size, font: helvetica, color: rgb(0, 0, 0) });
        y -= size + 3;
      }
    };

    // Section: Personal
    page.drawText("1. Data Pribadi", {
      x: labelX,
      y: y,
      size: 12,
      font: helveticaBold,
      color: rgb(0, 0, 0)
    });
    y -= 16;
    drawLabel("Nama Lengkap");
    drawValueWrapped(a.fullName);
    drawLabel("Registration Code");
    drawValueWrapped(a.registrationCode ?? a.id);
    drawLabel("NISN");
    drawValueWrapped(a.nisn);
    drawLabel("NIK");
    drawValueWrapped(a.nik);
    drawLabel("No. Kartu Keluarga");
    drawValueWrapped(a.noKK);
    drawLabel("Jenis Kelamin");
    drawValueWrapped(a.gender);
    drawLabel("Tempat, Tgl Lahir");
    drawValueWrapped(
      `${a.placeOfBirth ?? ""}${a.dateOfBirth ? " / " + new Date(a.dateOfBirth).toLocaleDateString("id-ID") : ""}`
    );
    drawLabel("Kewarganegaraan");
    drawValueWrapped(a.nationality);
    drawLabel("Agama");
    drawValueWrapped(a.religion);
    drawLabel("Bahasa Ibu");
    drawValueWrapped(a.motherTongue);
    drawLabel("Alamat");
    drawValueWrapped(a.address);
    drawLabel("Desa/Kelurahan");
    drawValueWrapped(a.village);
    drawLabel("Kecamatan");
    drawValueWrapped(a.district);
    drawLabel("Kota");
    drawValueWrapped(a.city);
    drawLabel("Provinsi");
    drawValueWrapped(a.province);
    drawLabel("Kode Pos");
    drawValueWrapped(a.postalCode);
    y -= sectionGap;

    // Section: Kontak
    page.drawText("2. Kontak", {
      x: labelX,
      y: y,
      size: 12,
      font: helveticaBold,
      color: rgb(0, 0, 0)
    });
    y -= 16;
    drawLabel("Telepon Rumah");
    drawValueWrapped(a.phone);
    drawLabel("Nomor HP");
    drawValueWrapped(a.mobile ?? a.phone);
    drawLabel("Email");
    drawValueWrapped(a.email);
    y -= sectionGap;

    // Section: Orang Tua / Wali
    page.drawText("3. Orang Tua / Wali", {
      x: labelX,
      y: y,
      size: 12,
      font: helveticaBold,
      color: rgb(0, 0, 0)
    });
    y -= 16;
    drawLabel("Nama Ayah");
    drawValueWrapped(a.fatherName);
    drawLabel("NIK Ayah");
    drawValueWrapped(a.fatherNik);
    drawLabel("Tahun Lahir Ayah");
    drawValueWrapped(a.fatherBirthYear);
    drawLabel("Pendidikan Ayah");
    drawValueWrapped(a.fatherEducation);
    drawLabel("Pekerjaan Ayah");
    drawValueWrapped(a.fatherOccupation);
    drawLabel("Pendapatan Ayah");
    drawValueWrapped(a.fatherIncome);

    drawLabel("Nama Ibu");
    drawValueWrapped(a.motherName);
    drawLabel("NIK Ibu");
    drawValueWrapped(a.motherNik);
    drawLabel("Tahun Lahir Ibu");
    drawValueWrapped(a.motherBirthYear);
    drawLabel("Pendidikan Ibu");
    drawValueWrapped(a.motherEducation);
    drawLabel("Pekerjaan Ibu");
    drawValueWrapped(a.motherOccupation);
    drawLabel("Pendapatan Ibu");
    drawValueWrapped(a.motherIncome);

    drawLabel("Nama Wali");
    drawValueWrapped(a.guardianName);
    drawLabel("NIK Wali");
    drawValueWrapped(a.guardianNik);
    drawLabel("Tahun Lahir Wali");
    drawValueWrapped(a.guardianBirthYear);
    drawLabel("Pendidikan Wali");
    drawValueWrapped(a.guardianEducation);
    drawLabel("Pekerjaan Wali");
    drawValueWrapped(a.guardianOccupation);
    drawLabel("Pendapatan Wali");
    drawValueWrapped(a.guardianIncome);
    y -= sectionGap;

    // Section: Pendidikan & Program
    page.drawText("4. Pilihan Program", {
      x: labelX,
      y: y,
      size: 12,
      font: helveticaBold,
      color: rgb(0, 0, 0)
    });
    y -= 16;
    drawLabel("Asal Sekolah");
    drawValueWrapped(a.schoolOrigin);
    drawLabel("Pilihan Program");
    drawValueWrapped(a.programChoice);
    drawLabel("Program");
    drawValueWrapped(a.program?.name);
    drawLabel("Tahun Ajaran");
    drawValueWrapped(a.academicYear?.label);
    y -= sectionGap;

    // Section: Tambahan
    page.drawText("5. Rincian Peserta Didik", {
      x: labelX,
      y: y,
      size: 12,
      font: helveticaBold,
      color: rgb(0, 0, 0)
    });
    y -= 16;
    drawLabel("Tinggal Bersama");
    drawValueWrapped(a.livesWith);
    drawLabel("Berat (kg)");
    drawValueWrapped(a.weight);
    drawLabel("Tinggi (cm)");
    drawValueWrapped(a.height);
    drawLabel("Jarak ke Sekolah (km)");
    drawValueWrapped(a.distanceToSchool);
    drawLabel("Moda Transportasi");
    drawValueWrapped(a.transportationMode);
    drawLabel("Anak ke");
    drawValueWrapped(a.anakKe);
    drawLabel("Jumlah Saudara");
    drawValueWrapped(a.jumlahSaudara);

    y -= sectionGap;
    page.drawText("6. Keterangan Tambahan", {
      x: labelX,
      y: y,
      size: 12,
      font: helveticaBold,
      color: rgb(0, 0, 0)
    });
    y -= 16;
    drawLabel("Prestasi");
    drawValueWrapped(a.achievements);

    const pdfBytes = await pdfDoc.save();
    return new Response(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="biodata_${a.registrationCode ?? a.id}.pdf"`
      }
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Failed to generate biodata" }, { status: 500 });
  }
}
