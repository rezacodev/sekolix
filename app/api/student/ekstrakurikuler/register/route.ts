import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStudentForUser } from "@/lib/extracurricular/server";

const registerSchema = z.object({
  extracurricularId: z.string().min(1),
  motivation: z.string().trim().max(1000).optional().nullable(),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "MURID") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = registerSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  const [student, club] = await Promise.all([getStudentForUser(session.user.email), db.extracurricular.findUnique({ where: { id: parsed.data.extracurricularId } })]);
  if (!student) return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });
  if (!club || !club.is_active) return NextResponse.json({ error: "Ekskul tidak tersedia" }, { status: 404 });
  const existingMember = await db.extracurricularMember.findUnique({ where: { extracurricular_id_student_id: { extracurricular_id: club.id, student_id: student.id } } });
  if (existingMember) return NextResponse.json({ error: "Kamu sudah menjadi anggota ekskul ini" }, { status: 400 });
  const registration = await db.extracurricularRegistration.upsert({
    where: { extracurricular_id_student_id: { extracurricular_id: club.id, student_id: student.id } },
    update: { motivation: parsed.data.motivation ?? null, status: "PENDING", review_note: null, reviewed_at: null, reviewed_by: null },
    create: { extracurricular_id: club.id, student_id: student.id, motivation: parsed.data.motivation ?? null },
  });
  return NextResponse.json({ data: registration }, { status: 201 });
}

