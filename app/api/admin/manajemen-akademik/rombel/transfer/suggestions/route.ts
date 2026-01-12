import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Class, Rombel } from "@prisma/client";

const suggestionsSchema = z.object({
  fromYearId: z.string(),
  toYearId: z.string()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fromYearId } = suggestionsSchema.parse(body);

    const students = await prisma.pesertaDidik.findMany({
      where: { entryYearId: fromYearId, deleted_at: null },
      include: { rombels: { include: { class: true } } }
    });

    const suggestions = await Promise.all(
      students.map(async student => {
        const currentClassGroup = student.rombels[0];
        const currentClass = currentClassGroup?.class;
        const currentGroup = currentClassGroup;

        let suggestedClass: Class | null = null;
        let suggestedGroup: (Rombel & { _count: { students: number } }) | null = null;
        let status: "ready" | "no_suggestion" | "graduated" = "no_suggestion";

        if (currentClass) {
          const classMatch = currentClass.name.match(/^(\d+)([A-Z]?)$/);
          if (classMatch) {
            const classNumber = parseInt(classMatch[1]);
            const nextClassNumber = classNumber + 1;

            if (nextClassNumber <= 12) {
              const nextClass = await prisma.class.findFirst({
                where: { name: nextClassNumber.toString(), deleted_at: null },
                include: { rombels: { include: { _count: { select: { students: true } } } } }
              });

              if (nextClass) {
                suggestedClass = nextClass;
                let targetGroup = nextClass.rombels.find(
                  (group) => group.name === currentGroup?.name
                );
                if (!targetGroup) {
                  targetGroup = nextClass.rombels.find(
                    (group) => (group.capacity || 0) > group._count.students
                  );
                }
                if (targetGroup) {
                  suggestedGroup = targetGroup;
                  status = "ready";
                }
              }
            } else {
              status = "graduated";
            }
          }
        }

        return {
          id: student.id,
          fullName: student.fullName,
          nisn: student.nisn,
          currentClass: currentClass
            ? { id: currentClass.id.toString(), name: currentClass.name }
            : null,
          currentGroup: currentGroup
            ? { id: currentGroup.id.toString(), name: currentGroup.name }
            : null,
          suggestedClass: suggestedClass
            ? { id: suggestedClass.id.toString(), name: suggestedClass.name }
            : null,
          suggestedGroup: suggestedGroup
            ? {
                id: suggestedGroup.id.toString(),
                name: suggestedGroup.name,
                capacity: suggestedGroup.capacity,
                student_count: suggestedGroup._count.students
              }
            : null,
          status
        };
      })
    );

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Error generating transfer suggestions:", error);
    return NextResponse.json({ error: "Gagal generate suggestions" }, { status: 500 });
  }
}
