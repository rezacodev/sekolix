import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get staffId from session
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { staff: true }
    });

    const staffId = user?.staff?.[0]?.id;
    if (!staffId) {
      return NextResponse.json(
        { error: "Staff ID not found" },
        { status: 403 }
      );
    }

    // Get teacher subjects (classes taught by this teacher)
    const teacherSubjects = await prisma.teacherSubject.findMany({
      where: {
        teacher_id: staffId,
        deleted_at: null,
      },
      include: {
        subject: {
          select: { id: true, name: true },
        },
        class: {
          select: { id: true, name: true },
        },
        rombel: {
          select: { id: true, name: true },
        },
      },
    });

    // Get or create online classes for these teacher subjects
    const onlineClasses = [];
    
    for (const ts of teacherSubjects) {
      const classId = ts.class_id;
      const subjectId = ts.subject_id;
      
      // Find or create online class
      let onlineClass = await prisma.onlineClass.findFirst({
        where: {
          class_id: classId,
          subject_id: subjectId,
          deleted_at: null,
        },
      });

      if (!onlineClass) {
        // Create online class if not exists
        onlineClass = await prisma.onlineClass.create({
          data: {
            class_id: classId,
            subject_id: subjectId,
            title: `${ts.subject.name} - ${ts.class.name}`,
            description: null,
          },
        });
      }

      onlineClasses.push({
        id: Number(onlineClass.id),
        subject: {
          id: ts.subject.id.toString(),
          name: ts.subject.name,
        },
        rombel: {
          id: ts.rombel_id?.toString() || ts.class_id.toString(),
          name: ts.rombel?.name || "",
          class: {
            name: ts.class.name,
          },
        },
      });
    }

    return NextResponse.json({
      onlineClasses,
    });
  } catch (error) {
    console.error("Error fetching online classes:", error);
    return NextResponse.json(
      { error: "Failed to fetch online classes" },
      { status: 500 }
    );
  }
}
