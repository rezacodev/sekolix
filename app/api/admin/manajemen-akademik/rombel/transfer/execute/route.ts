import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Rombel } from "@prisma/client";

const executeSchema = z.object({
  fromYearId: z.string(),
  toYearId: z.string(),
  studentIds: z.array(z.string())
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fromYearId, toYearId, studentIds } = executeSchema.parse(body);

    if (studentIds.length === 0) {
      return NextResponse.json({ error: "Tidak ada siswa yang dipilih" }, { status: 400 });
    }

    const fromYear = await prisma.tahunAjaran.findUnique({ where: { id: fromYearId } });
    const toYear = await prisma.tahunAjaran.findUnique({ where: { id: toYearId } });

    if (!fromYear || !toYear) {
      return NextResponse.json({ error: "Tahun ajaran tidak ditemukan" }, { status: 404 });
    }

    const batchName = `Transfer ${fromYear.label} → ${toYear.label} (${new Date().toLocaleDateString("id-ID")})`;

    const result = await prisma.$transaction(async tx => {
      const batch = await tx.transferBatch.create({
        data: { name: batchName, fromYearId, toYearId, status: "IN_PROGRESS" }
      });

      const students = await tx.pesertaDidik.findMany({
        where: { id: { in: studentIds }, entryYearId: fromYearId },
        include: { rombels: { include: { class: true } } }
      });

      const transferPromises = students.map(async student => {
        const currentClassGroup = student.rombels[0];
        if (!currentClassGroup?.class)
          throw new Error(`Siswa ${student.fullName} tidak memiliki kelas`);

        const currentClass = currentClassGroup.class;
        const classMatch = currentClass.name.match(/^(\d+)/);
        if (!classMatch)
          throw new Error(`Format kelas tidak valid untuk siswa ${student.fullName}`);

        const classNumber = parseInt(classMatch[1]);
        const nextClassNumber = classNumber + 1;

        const nextClass = await tx.class.findFirst({
          where: { name: nextClassNumber.toString(), deleted_at: null }
        });
        if (!nextClass)
          throw new Error(`Kelas tujuan tidak ditemukan untuk siswa ${student.fullName}`);

        let targetGroup: (Rombel & { _count: { students: number } }) | null = null;
        if (currentClassGroup) {
          targetGroup = await tx.rombel.findFirst({
            where: { class_id: nextClass.id, name: currentClassGroup.name },
            include: { _count: { select: { students: true } } }
          });
        }
        if (!targetGroup) {
          const groups = await tx.rombel.findMany({
            where: { class_id: nextClass.id },
            include: { _count: { select: { students: true } } }
          });
          targetGroup = groups.find(group => (group.capacity || 0) > group._count.students) || null;
        }
        if (!targetGroup)
          throw new Error(`Tidak ada rombel tersedia untuk siswa ${student.fullName}`);

        const transfer = await tx.transfer.create({
          data: {
            batchId: batch.id,
            studentId: student.id,
            fromClassId: currentClass.id,
            toClassId: nextClass.id,
            fromGroupId: currentClassGroup.id,
            toGroupId: targetGroup.id,
            status: "COMPLETED"
          }
        });

        await tx.pesertaDidik.update({
          where: { id: student.id },
          data: {
            entryYearId: toYearId,
            rombels: { set: [], connect: { id: targetGroup.id } }
          }
        });

        return transfer;
      });

      await Promise.all(transferPromises);
      await tx.transferBatch.update({ where: { id: batch.id }, data: { status: "COMPLETED" } });
      return batch;
    });

    return NextResponse.json({
      success: true,
      batch: result,
      message: `Transfer berhasil untuk ${studentIds.length} siswa`
    });
  } catch (error) {
    console.error("Error executing transfer:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal mengeksekusi transfer" },
      { status: 500 }
    );
  }
}
