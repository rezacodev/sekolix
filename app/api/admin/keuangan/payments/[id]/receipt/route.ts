import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity } from "@/lib/governance/server";
import { formatRupiah } from "@/lib/finance/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const access = await requireApiPermission("export", "keuangan");
  if (!access.ok) return access.response;

  const { id } = await context.params;
  const payment = await db.studentPayment.findUnique({
    where: { id },
    include: {
      invoice: {
        include: {
          student: { select: { fullName: true, nisn: true } },
          billingType: { select: { name: true, code: true } },
          academicYear: { select: { label: true } },
          rombel: { select: { name: true, class: { select: { name: true } } } },
        },
      },
    },
  });

  if (!payment) return NextResponse.json({ error: "Pembayaran tidak ditemukan" }, { status: 404 });

  const pdf = await PDFDocument.create();
  pdf.setTitle(`Kwitansi ${payment.payment_number}`);
  pdf.setCreator("Sekolix");
  const page = pdf.addPage([595.28, 420]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const draw = (text: string, x: number, y: number, size = 10, isBold = false) => {
    page.drawText(text, { x, y, size, font: isBold ? bold : regular, color: rgb(0.08, 0.09, 0.12) });
  };

  page.drawRectangle({ x: 32, y: 32, width: 531, height: 356, borderColor: rgb(0.75, 0.79, 0.86), borderWidth: 1 });
  draw("SEKOLIX", 52, 354, 18, true);
  draw("Kwitansi Pembayaran Sekolah", 52, 334, 11);
  draw("KWITANSI", 430, 350, 20, true);
  draw(payment.payment_number, 430, 330, 10);

  page.drawLine({ start: { x: 52, y: 310 }, end: { x: 543, y: 310 }, thickness: 0.75, color: rgb(0.75, 0.79, 0.86) });

  const rows = [
    ["Nomor Invoice", payment.invoice.invoice_number],
    ["Tanggal Bayar", payment.paid_at.toLocaleDateString("id-ID")],
    ["Nama Siswa", payment.invoice.student.fullName],
    ["NISN", payment.invoice.student.nisn ?? "-"],
    ["Rombel", payment.invoice.rombel ? `${payment.invoice.rombel.class.name} - ${payment.invoice.rombel.name}` : "-"],
    ["Tahun Ajaran", payment.invoice.academicYear?.label ?? "-"],
    ["Jenis Tagihan", payment.invoice.billingType.name],
    ["Metode", payment.method],
  ];

  let y = 284;
  for (const [label, value] of rows) {
    draw(label, 52, y, 10, true);
    draw(":", 150, y, 10);
    draw(String(value), 166, y, 10);
    y -= 20;
  }

  page.drawRectangle({ x: 344, y: 114, width: 178, height: 52, color: rgb(0.94, 0.98, 0.96) });
  draw("Jumlah Dibayar", 364, 146, 10, true);
  draw(formatRupiah(payment.amount), 364, 124, 18, true);

  draw("Dicetak otomatis oleh Sekolix. Simpan dokumen ini sebagai bukti pembayaran resmi.", 52, 72, 8);
  draw(`Status: ${payment.status}`, 52, 54, 8, true);

  const bytes = await pdf.save();

  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "keuangan",
    action: "export_receipt_pdf",
    entityType: "StudentPayment",
    entityId: payment.id,
    metadata: { paymentNumber: payment.payment_number },
    request,
  });

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="kwitansi-${payment.payment_number}.pdf"`,
    },
  });
}
