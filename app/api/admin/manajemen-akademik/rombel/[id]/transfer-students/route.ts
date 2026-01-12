import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const targetRombelId = BigInt(id);
    const { sourceRombelId, studentIds } = await request.json();

    if (!sourceRombelId || !studentIds || !Array.isArray(studentIds)) {
      return NextResponse.json(
        { error: "Data tidak valid" },
        { status: 400 }
      );
    }

    // Validate target rombel exists
    const targetRombel = await prisma.rombel.findUnique({
      where: { id: targetRombelId },
      include: {
        students: true
      }
    });

    if (!targetRombel) {
      return NextResponse.json(
        { error: "Rombel tujuan tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check capacity
    if (targetRombel.capacity) {
      const newTotalStudents = targetRombel.students.length + studentIds.length;
      if (newTotalStudents > targetRombel.capacity) {
        return NextResponse.json(
          { error: `Kapasitas rombel tidak mencukupi. Kapasitas: ${targetRombel.capacity}, Saat ini: ${targetRombel.students.length}, Ditambah: ${studentIds.length}` },
          { status: 400 }
        );
      }
    }

    // Check if students already in target rombel
    const existingStudentIds = targetRombel.students.map(s => s.id);
    const duplicates = studentIds.filter(id => existingStudentIds.includes(id));
    if (duplicates.length > 0) {
      return NextResponse.json(
        { error: "Beberapa siswa sudah ada di rombel ini" },
        { status: 400 }
      );
    }

    // Transfer students - first disconnect from source, then connect to target
    // Using transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // Disconnect students from source rombel
      await tx.rombel.update({
        where: { id: BigInt(sourceRombelId) },
        data: {
          students: {
            disconnect: studentIds.map(id => ({ id }))
          }
        }
      });

      // Connect students to target rombel
      await tx.rombel.update({
        where: { id: targetRombelId },
        data: {
          students: {
            connect: studentIds.map(id => ({ id }))
          }
        }
      });
    });

    // Update student counts after successful transfer
    const updatedTargetRombel = await prisma.rombel.findUnique({
      where: { id: targetRombelId },
      include: { students: true }
    });

    const updatedSourceRombel = await prisma.rombel.findUnique({
      where: { id: BigInt(sourceRombelId) },
      include: { students: true }
    });

    if (updatedTargetRombel) {
      await prisma.rombel.update({
        where: { id: targetRombelId },
        data: { student_count: updatedTargetRombel.students.length }
      });
    }

    if (updatedSourceRombel) {
      await prisma.rombel.update({
        where: { id: BigInt(sourceRombelId) },
        data: { student_count: updatedSourceRombel.students.length }
      });
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil mentransfer ${studentIds.length} siswa`,
      transferred: studentIds.length
    });
  } catch (error) {
    console.error("Error transferring students:", error);
    return NextResponse.json(
      { error: "Gagal mentransfer siswa" },
      { status: 500 }
    );
  }
}
