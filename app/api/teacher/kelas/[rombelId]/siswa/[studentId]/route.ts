import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ rombelId: string; studentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const params = await context.params;

    if (!session?.user?.staffId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rombelId = params.rombelId;
    const studentId = params.studentId;
    const teacherId = session.user.staffId;

    // Verify teacher has access to this rombel
    const hasAccess = await prisma.teacherSubject.findFirst({
      where: {
        teacher_id: teacherId,
        deleted_at: null,
        OR: [
          { rombel_id: BigInt(rombelId) },
          {
            class: {
              rombels: {
                some: {
                  id: BigInt(rombelId),
                },
              },
            },
          },
        ],
      },
    });

    if (!hasAccess) {
      return NextResponse.json(
        { error: "You don't have access to this class" },
        { status: 403 }
      );
    }

    // Get student detail
    const student = await prisma.pesertaDidik.findUnique({
      where: {
        id: studentId,
      },
      include: {
        program: {
          select: {
            name: true,
            code: true,
          },
        },
        entryYear: {
          select: {
            label: true,
          },
        },
        rombels: {
          where: {
            id: BigInt(rombelId),
          },
          select: {
            id: true,
            name: true,
            class: {
              select: {
                id: true,
                name: true,
              },
            },
            tahunAjaran: {
              select: {
                label: true,
              },
            },
          },
        },
        grades: {
          select: {
            id: true,
            score: true,
            assessment: {
              select: {
                title: true,
                type: true,
                max_score: true,
                subject: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            created_at: "desc",
          },
          take: 10,
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    // Verify student is in the rombel
    if (student.rombels.length === 0) {
      return NextResponse.json(
        { error: "Student is not in this rombel" },
        { status: 404 }
      );
    }

    // Format response
    const currentRombel = student.rombels[0];
    
    // Calculate average grade
    const avgGrade =
      student.grades.length > 0
        ? student.grades.reduce(
            (sum, grade) => sum + Number(grade.score),
            0
          ) / student.grades.length
        : null;

    const formattedStudent = {
      // Basic Info
      id: student.id,
      fullName: student.fullName,
      nik: student.nik,
      nisn: student.nisn,
      registrationCode: student.registrationCode,
      
      // Personal Data
      gender: student.gender,
      placeOfBirth: student.placeOfBirth,
      dateOfBirth: student.dateOfBirth,
      nationality: student.nationality,
      religion: student.religion,
      motherTongue: student.motherTongue,
      
      // Address
      address: student.address,
      village: student.village,
      district: student.district,
      city: student.city,
      province: student.province,
      postalCode: student.postalCode,
      
      // Contact
      phone: student.phone,
      mobile: student.mobile,
      email: student.email,
      
      // Academic
      program: student.program?.name || null,
      programCode: student.program?.code || null,
      entryYear: student.entryYear?.label || null,
      rombelName: currentRombel.name,
      className: currentRombel.class.name,
      tahunAjaran: currentRombel.tahunAjaran?.label || null,
      
      // Family Data
      fatherName: student.fatherName,
      fatherNik: student.fatherNik,
      fatherBirthYear: student.fatherBirthYear,
      fatherEducation: student.fatherEducation,
      fatherOccupation: student.fatherOccupation,
      fatherIncome: student.fatherIncome,
      
      motherName: student.motherName,
      motherNik: student.motherNik,
      motherBirthYear: student.motherBirthYear,
      motherEducation: student.motherEducation,
      motherOccupation: student.motherOccupation,
      motherIncome: student.motherIncome,
      
      guardianName: student.guardianName,
      guardianNik: student.guardianNik,
      guardianBirthYear: student.guardianBirthYear,
      guardianEducation: student.guardianEducation,
      guardianOccupation: student.guardianOccupation,
      guardianIncome: student.guardianIncome,
      
      // Student Details
      livesWith: student.livesWith,
      weight: student.weight,
      height: student.height,
      distanceToSchool: student.distanceToSchool,
      transportationMode: student.transportationMode,
      anakKe: student.anakKe,
      jumlahSaudara: student.jumlahSaudara,
      
      // Other
      schoolOrigin: student.schoolOrigin,
      achievements: student.achievements,
      notes: student.notes,
      
      // Statistics
      averageGrade: avgGrade ? Number(avgGrade.toFixed(2)) : null,
      totalGrades: student.grades.length,
      
      // Recent Grades
      recentGrades: student.grades.map((grade) => ({
        id: Number(grade.id),
        score: Number(grade.score),
        assessmentTitle: grade.assessment.title,
        assessmentType: grade.assessment.type,
        maxScore: grade.assessment.max_score
          ? Number(grade.assessment.max_score)
          : null,
        subjectName: grade.assessment.subject.name,
      })),
    };

    return NextResponse.json({
      success: true,
      data: formattedStudent,
    });
  } catch (error) {
    console.error("[teacher/student-detail] Error fetching student:", error);
    return NextResponse.json(
      { error: "Failed to fetch student details" },
      { status: 500 }
    );
  }
}
