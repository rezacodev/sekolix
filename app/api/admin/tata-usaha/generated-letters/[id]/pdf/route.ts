import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity } from "@/lib/governance/server";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await requireApiPermission("export", "tata-usaha");
  if (!access.ok) return access.response;
  const { id } = await context.params;
  const letter = await db.generatedLetter.findUnique({ where: { id }, include: { template: true, creator: { select: { name: true } } } });
  if (!letter) return NextResponse.json({ error: "Surat tidak ditemukan" }, { status: 404 });

  const pdf = await PDFDocument.create();
  pdf.setTitle(letter.template.subject);
  pdf.setCreator("Sekolix");
  const page = pdf.addPage([595.28, 841.89]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const draw = (text: string, x: number, y: number, size = 11, isBold = false) => {
    page.drawText(text, { x, y, size, font: isBold ? bold : regular, color: rgb(0.08, 0.09, 0.12) });
  };
  draw("SEKOLIX", 52, 790, 18, true);
  draw("Administrasi Tata Usaha", 52, 770, 11);
  page.drawLine({ start: { x: 52, y: 750 }, end: { x: 543, y: 750 }, thickness: 0.8, color: rgb(0.5, 0.55, 0.65) });
  draw(letter.template.subject.toUpperCase().slice(0, 70), 52, 714, 13, true);
  let y = 680;
  const words = letter.content.split(/\s+/);
  let line = "";
  for (const word of words) {
    const next = `${line} ${word}`.trim();
    if (next.length > 88) {
      draw(line, 52, y);
      y -= 16;
      line = word;
    } else {
      line = next;
    }
    if (y < 120) break;
  }
  if (line && y >= 120) draw(line, 52, y);
  draw(`Validasi: ${letter.validation_code}`, 52, 72, 9);
  draw(letter.creator?.name ?? "Tata Usaha", 420, 112, 11, true);

  const bytes = await pdf.save();
  await logActivity({ actorUserId: access.context.user.id, actorName: access.context.user.name, module: "tata-usaha", action: "export_generated_letter_pdf", entityType: "GeneratedLetter", entityId: letter.id, metadata: { validationCode: letter.validation_code }, request });
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="surat-${letter.validation_code}.pdf"`,
    },
  });
}

