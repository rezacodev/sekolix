import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rombelId = BigInt(id);

    // Get rombel with class and program info
    const rombel = await prisma.rombel.findUnique({
      where: { id: rombelId },
      include: {
        class: true,
        program: {
          include: {
            subjects: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
    });

    if (!rombel) {
      return NextResponse.json(
        { error: "Rombel not found" },
        { status: 404 }
      );
    }

    // Check if already generated
    const existingCount = await prisma.teacherSubject.count({
      where: {
        class_id: BigInt(rombel.class_id),
        rombel_id: rombelId,
      },
    });

    const isRegenerate = existingCount > 0;

    // Get subjects from program
    const programSubjects = rombel.program?.subjects || [];

    if (programSubjects.length === 0) {
      return NextResponse.json(
        { error: "No subjects found in program" },
        { status: 400 }
      );
    }

    // Create SubjectClass records (class-level mapping) if not exist
    const subjectClassPromises = programSubjects.map(async (ps) => {
      const existing = await prisma.subjectClass.findFirst({
        where: {
          class_id: BigInt(rombel.class_id),
          subject_id: BigInt(ps.subject.id),
        },
      });

      if (!existing) {
        return prisma.subjectClass.create({
          data: {
            class_id: BigInt(rombel.class_id),
            subject_id: BigInt(ps.subject.id),
          },
        });
      }
      return existing;
    });

    await Promise.all(subjectClassPromises);

    // Create initial TeacherSubject records (rombel-level) only for subjects that don't exist yet
    let addedCount = 0;
    for (const ps of programSubjects) {
      const existingTeacherSubject = await prisma.teacherSubject.findFirst({
        where: {
          subject_id: BigInt(ps.subject.id),
          class_id: BigInt(rombel.class_id),
          rombel_id: rombelId,
        },
      });

      // Only create if doesn't exist
      if (!existingTeacherSubject) {
        await prisma.teacherSubject.create({
          data: {
            subject_id: BigInt(ps.subject.id),
            class_id: BigInt(rombel.class_id),
            rombel_id: rombelId,
            // teacher_id is null - will be assigned later by user
          },
        });
        addedCount++;
      }
    }

    return NextResponse.json({
      message: isRegenerate 
        ? `Berhasil menambahkan ${addedCount} mata pelajaran baru`
        : "Subjects generated successfully",
      count: isRegenerate ? addedCount : programSubjects.length,
      isRegenerate,
    });
  } catch (error) {
    console.error("Error generating subjects:", error);
    return NextResponse.json(
      { error: "Failed to generate subjects" },
      { status: 500 }
    );
  }
}
