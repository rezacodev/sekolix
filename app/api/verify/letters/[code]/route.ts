import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const [outgoing, generated] = await Promise.all([
    db.outgoingLetter.findUnique({ where: { validation_code: code }, select: { letter_number: true, recipient: true, subject: true, letter_date: true, status: true } }),
    db.generatedLetter.findUnique({ where: { validation_code: code }, select: { subject_name: true, subject_identifier: true, createdAt: true, template: { select: { subject: true } } } }),
  ]);
  if (!outgoing && !generated) return NextResponse.json({ error: "Kode validasi tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ data: outgoing ? { type: "OUTGOING", ...outgoing } : { type: "GENERATED", ...generated } });
}

