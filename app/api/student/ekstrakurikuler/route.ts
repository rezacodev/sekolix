import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStudentForUser } from "@/lib/extracurricular/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "MURID") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const student = await getStudentForUser(session.user.email);
  if (!student) return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });
  const [clubs, registrations, memberships, achievements] = await Promise.all([
    db.extracurricular.findMany({ where: { is_active: true }, include: { coaches: { include: { staff: { select: { name: true } } } }, _count: { select: { members: true } } }, orderBy: { name: "asc" } }),
    db.extracurricularRegistration.findMany({ where: { student_id: student.id }, include: { extracurricular: true }, orderBy: { createdAt: "desc" } }),
    db.extracurricularMember.findMany({ where: { student_id: student.id }, include: { extracurricular: true }, orderBy: { joined_at: "desc" } }),
    db.extracurricularAchievement.findMany({ where: { student_id: student.id, portfolio_visible: true }, include: { extracurricular: true }, orderBy: { achieved_at: "desc" } }),
  ]);
  return NextResponse.json({ data: { clubs, registrations, memberships, achievements } });
}

