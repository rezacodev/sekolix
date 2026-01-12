import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const bulkAssignSchema = z.object({
  studentIds: z.array(z.string()).min(1, "Minimal 1 siswa harus dipilih"),
  rombelId: z.string().min(1, "Rombel wajib dipilih")
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = bulkAssignSchema.parse(body);

    // Check if rombel exists and get capacity info
    const rombel = await db.rombel.findUnique({
      where: { id: parseInt(validated.rombelId) },
      include: {
        _count: {
          select: { students: true }
        }
      }
    });

    if (!rombel) {
      return NextResponse.json({ message: "Rombel tidak ditemukan" }, { status: 404 });
    }

    // Check capacity if set
    if (rombel.capacity && rombel._count.students + validated.studentIds.length > rombel.capacity) {
      return NextResponse.json(
        {
          message: `Kapasitas rombel tidak mencukupi. Kapasitas: ${rombel.capacity}, sudah terisi: ${rombel._count.students}, akan ditambah: ${validated.studentIds.length}`
        },
        { status: 400 }
      );
    }

    // Check if students exist
    const students = await db.pesertaDidik.findMany({
      where: {
        id: { in: validated.studentIds }
      },
      select: { id: true, fullName: true }
    });

    if (students.length !== validated.studentIds.length) {
      const foundIds = students.map(s => s.id);
      const missingIds = validated.studentIds.filter(id => !foundIds.includes(id));
      return NextResponse.json(
        {
          message: `Beberapa siswa tidak ditemukan: ${missingIds.join(", ")}`
        },
        { status: 404 }
      );
    }

    // Perform bulk assignment using transactions
    const result = await db.$transaction(async tx => {
      let assignedCount = 0;

      for (const studentId of validated.studentIds) {
        // First, disconnect from any existing class groups
        await tx.pesertaDidik.update({
          where: { id: studentId },
          data: {
            rombels: {
              set: []
            }
          }
        });

        // Then connect to the new class group
        await tx.pesertaDidik.update({
          where: { id: studentId },
          data: {
            rombels: {
              connect: { id: parseInt(validated.rombelId) }
            }
          }
        });

        assignedCount++;
      }

      return { count: assignedCount };
    });

    return NextResponse.json({
      message: `Berhasil assign ${result.count} siswa ke rombel ${rombel.name}`,
      assignedCount: result.count
    });
  } catch (error) {
    console.error("Bulk assign error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Data tidak valid", errors: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ message: "Terjadi kesalahan saat assign siswa" }, { status: 500 });
  }
}
