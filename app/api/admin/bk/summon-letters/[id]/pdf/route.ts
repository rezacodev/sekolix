import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity } from "@/lib/governance/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const access = await requireApiPermission("export", "bk");
  if (!access.ok) return access.response;

  const { id } = await context.params;
  const letter = await db.parentSummonLetter.findUnique({
    where: { id },
    include: {
      student: { select: { fullName: true, nisn: true, address: true } },
      parent: { select: { name: true, phone: true, address: true } },
      counselingCase: { select: { title: true, category: true } },
      creator: { select: { name: true } },
    },
  });

  if (!letter) return NextResponse.json({ error: "Surat panggilan tidak ditemukan" }, { status: 404 });

  const pdf = await PDFDocument.create();
  pdf.setTitle(`Surat Panggilan ${letter.letter_number}`);
  pdf.setCreator("Sekolix");
  const page = pdf.addPage([595.28, 841.89]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const draw = (text: string, x: number, y: number, size = 11, isBold = false) => {
    page.drawText(text, { x, y, size, font: isBold ? bold : regular, color: rgb(0.08, 0.09, 0.12) });
  };

  draw("SEKOLIX", 52, 790, 18, true);
  draw("Bimbingan Konseling Sekolah", 52, 770, 11);
  page.drawLine({ start: { x: 52, y: 750 }, end: { x: 543, y: 750 }, thickness: 0.8, color: rgb(0.5, 0.55, 0.65) });

  draw("SURAT PANGGILAN ORANG TUA/WALI", 175, 714, 14, true);
  draw(`Nomor: ${letter.letter_number}`, 220, 694, 10);

  let y = 652;
  draw("Kepada Yth.", 52, y);
  y -= 18;
  draw(letter.parent?.name ?? "Orang Tua/Wali Siswa", 52, y, 11, true);
  y -= 18;
  draw(letter.parent?.address ?? letter.student.address ?? "Di tempat", 52, y);
  y -= 38;

  draw("Dengan hormat,", 52, y);
  y -= 24;
  draw("Sehubungan dengan kebutuhan pendampingan perkembangan siswa, kami mengundang Bapak/Ibu", 52, y);
  y -= 16;
  draw("untuk hadir dalam pertemuan bersama tim BK sekolah dengan rincian berikut:", 52, y);
  y -= 34;

  const rows = [
    ["Nama Siswa", letter.student.fullName],
    ["NISN", letter.student.nisn ?? "-"],
    ["Agenda", letter.agenda],
    ["Jadwal", letter.scheduled_at.toLocaleString("id-ID")],
    ["Kasus/Topik", letter.counselingCase.title],
  ];

  for (const [label, value] of rows) {
    draw(label, 72, y, 10, true);
    draw(":", 170, y, 10);
    draw(String(value).slice(0, 86), 184, y, 10);
    y -= 20;
  }

  y -= 18;
  draw("Demikian surat panggilan ini kami sampaikan. Atas perhatian dan kerja sama Bapak/Ibu,", 52, y);
  y -= 16;
  draw("kami ucapkan terima kasih.", 52, y);

  draw("Petugas BK,", 420, 180);
  draw(letter.creator?.name ?? "Tim BK", 420, 112, 11, true);

  const bytes = await pdf.save();
  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "bk",
    action: "export_parent_summon_pdf",
    entityType: "ParentSummonLetter",
    entityId: letter.id,
    metadata: { letterNumber: letter.letter_number },
    request,
  });

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="surat-panggilan-${letter.letter_number.replaceAll("/", "-")}.pdf"`,
    },
  });
}
