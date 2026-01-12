import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const teacherSubject = await prisma.teacherSubject.findUnique({
      where: { id: BigInt(id), deleted_at: null },
      include: {
        teacher: { select: { id: true, name: true, nip: true, email: true } },
        subject: {
          select: { id: true, name: true, code: true, is_practice: true }
        },
        class: {
          select: { id: true, name: true }
        }
      }
    });

    if (!teacherSubject) {
      return NextResponse.json({ error: "Teacher subject assignment not found" }, { status: 404 });
    }

    // Convert BigInt to number for JSON serialization
    const serializedTeacherSubject = {
      ...teacherSubject,
      id: Number(teacherSubject.id),
      subject_id: Number(teacherSubject.subject_id),
      class_id: Number(teacherSubject.class_id),
      subject: {
        ...teacherSubject.subject,
        id: Number(teacherSubject.subject.id)
      },
      class: {
        ...teacherSubject.class,
        id: Number(teacherSubject.class.id)
      }
    };

    return NextResponse.json(serializedTeacherSubject);
  } catch (error) {
    console.error("Error fetching teacher subject:", error);
    return NextResponse.json(
      { error: "Failed to fetch teacher subject assignment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.teacherSubject.update({
      where: { id: BigInt(id) },
      data: { deleted_at: new Date() }
    });

    return NextResponse.json({ message: "Teacher subject assignment deleted successfully" });
  } catch (error) {
    console.error("Error deleting teacher subject:", error);
    return NextResponse.json(
      { error: "Failed to delete teacher subject assignment" },
      { status: 500 }
    );
  }
}
