import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkGuruData() {
  try {
    // Get guru@sekolix.com staff
    const user = await prisma.user.findUnique({
      where: { email: 'guru@sekolix.com' },
      include: { staff: true }
    });
    
    console.log('User:', user?.email);
    console.log('Staff ID:', user?.staff?.[0]?.id);
    console.log('Staff Name:', user?.staff?.[0]?.name);
    console.log('');
    
    if (!user?.staff?.[0]) {
      console.log('No staff found for guru@sekolix.com');
      return;
    }
    
    const staffId = user.staff[0].id;
    
    // Get teacher subjects
    const teacherSubjects = await prisma.teacherSubject.findMany({
      where: {
        teacher_id: staffId,
        deleted_at: null
      },
      include: {
        subject: true,
        rombel: {
          include: {
            class: true
          }
        }
      }
    });
    
    console.log('Teacher Subjects Count:', teacherSubjects.length);
    console.log('');
    
    // Group by subject
    const subjects = new Map();
    teacherSubjects.forEach(ts => {
      const subjectName = ts.subject.name;
      if (!subjects.has(subjectName)) {
        subjects.set(subjectName, []);
      }
      subjects.get(subjectName).push({
        rombel: ts.rombel ? `${ts.rombel.class.name} ${ts.rombel.name}` : 'No rombel',
        rombelId: ts.rombel_id
      });
    });
    
    console.log('Subjects taught:');
    for (const [subject, rombels] of subjects.entries()) {
      console.log(`  ${subject}:`);
      rombels.forEach((r: { rombel: string; rombelId: bigint | null }) => console.log(`    - ${r.rombel} (ID: ${r.rombelId})`));
    }
    console.log('');
    
    // Check if Matematika has grades
    const matematika = await prisma.subject.findFirst({
      where: { name: 'Matematika' }
    });
    
    if (matematika) {
      console.log('Matematika Subject ID:', matematika.id);
      
      const assessments = await prisma.assessment.findMany({
        where: { subject_id: matematika.id }
      });
      console.log('Matematika Assessments:', assessments.length);
      
      if (assessments.length > 0) {
        const grades = await prisma.grade.findMany({
          where: {
            assessment_id: { in: assessments.map(a => a.id) }
          },
          take: 5
        });
        console.log('Matematika Grades (sample):', grades.length);
        
        // Check which rombel has the grades
        if (grades.length > 0) {
          const studentIds = grades.map(g => g.student_id);
          const students = await prisma.pesertaDidik.findMany({
            where: { id: { in: studentIds } },
            include: {
              rombels: {
                include: { class: true }
              }
            }
          });
          
          console.log('Students with grades (sample):');
          const rombelSet = new Set();
          students.forEach(s => {
            s.rombels.forEach(r => {
              rombelSet.add(`${r.class.name} ${r.name} (ID: ${r.id})`);
            });
          });
          rombelSet.forEach(r => console.log(`  - ${r}`));
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkGuruData();
