import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedGradesForGuru() {
  try {
    console.log('Seeding grades for guru@sekolix.com classes...\n');

    // Get guru staff
    const user = await prisma.user.findUnique({
      where: { email: 'guru@sekolix.com' },
      include: { staff: true }
    });

    if (!user?.staff?.[0]) {
      console.log('Guru not found');
      return;
    }

    const staffId = user.staff[0].id;

    // Get teacher's rombels for Matematika
    const teacherSubjects = await prisma.teacherSubject.findMany({
      where: {
        teacher_id: staffId,
        subject: {
          name: 'Matematika'
        },
        deleted_at: null
      },
      include: {
        rombel: {
          include: {
            students: {
              where: { deleted_at: null }
            }
          }
        },
        subject: true
      }
    });

    if (teacherSubjects.length === 0) {
      console.log('No Matematika classes found for this teacher');
      return;
    }

    // Get Matematika assessments
    const matematikaSubject = await prisma.subject.findFirst({
      where: { name: 'Matematika' }
    });

    if (!matematikaSubject) {
      console.log('Matematika subject not found');
      return;
    }

    const assessments = await prisma.assessment.findMany({
      where: {
        subject_id: matematikaSubject.id,
        deleted_at: null
      }
    });

    if (assessments.length === 0) {
      console.log('No assessments found for Matematika');
      return;
    }

    console.log(`Found ${assessments.length} assessments for Matematika`);
    console.log(`Teacher has ${teacherSubjects.length} Matematika classes\n`);

    let totalCreated = 0;

    for (const ts of teacherSubjects) {
      if (!ts.rombel) continue;

      const rombel = await prisma.rombel.findUnique({
        where: { id: ts.rombel_id! },
        include: {
          class: true,
          students: {
            where: { deleted_at: null }
          }
        }
      });

      if (!rombel) continue;

      console.log(`Processing ${rombel.class.name} ${rombel.name}...`);
      console.log(`  Students: ${rombel.students.length}`);

      for (const student of rombel.students) {
        for (const assessment of assessments) {
          // Check if grade already exists
          const existing = await prisma.grade.findUnique({
            where: {
              student_id_assessment_id: {
                student_id: student.id,
                assessment_id: assessment.id
              }
            }
          });

          if (existing) {
            continue;
          }

          // Generate realistic random grade (60-100)
          const isGoodGrade = Math.random() > 0.3;
          const baseScore = isGoodGrade 
            ? 75 + Math.random() * 20  // 75-95
            : 60 + Math.random() * 15; // 60-75
          
          const score = Math.round(baseScore * 10) / 10;

          await prisma.grade.create({
            data: {
              student_id: student.id,
              assessment_id: assessment.id,
              score: score
            }
          });

          totalCreated++;
        }
      }

      console.log(`  ✓ Created grades for ${rombel.students.length} students\n`);
    }

    console.log(`\n✅ Total new grades created: ${totalCreated}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedGradesForGuru();
