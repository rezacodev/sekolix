import { prisma } from "../utils/prisma";

/**
 * Seed classes (grade levels)
 */
export async function seedClasses() {
  console.log("🏫 Seeding classes...");

  const classLevels = [10, 11, 12]; // SMA levels

  const classes = [];
  for (const level of classLevels) {
    const className = `Kelas ${level}`;

    let classData = await prisma.class.findFirst({
      where: { name: className },
    });

    if (!classData) {
      classData = await prisma.class.create({
        data: {
          name: className,
        },
      });
      console.log(`✅ Created class: ${classData.name}`);
    } else {
      console.log(`ℹ️  Class already exists: ${classData.name}`);
    }

    classes.push(classData);
  }

  return classes;
}

/**
 * Seed subject-class relationships
 */
export async function seedSubjectClasses(classes: Array<{ id: bigint; name: string; }>, subjects: Array<{ id: bigint; code: string | null; name: string; is_practice: boolean; deleted_at: Date | null; created_at: Date; updated_at: Date; }>) {
  console.log("🔗 Seeding subject-class relationships...");

  const relationships = [];

  // Define subjects available for each class level
  const classSubjects: Record<number, string[]> = {
    // Junior High (7-9) - but since this is SMA, we'll start from 10
    10: ["MAT", "BIND", "BING", "PKN", "SEJ", "FIS", "KIM", "BIO", "SEN", "PENJAS", "TIK", "BK"],
    11: ["MAT", "BIND", "BING", "PKN", "SEJ", "FIS", "KIM", "BIO", "SEN", "PENJAS", "TIK", "BK"],
    12: ["MAT", "BIND", "BING", "PKN", "SEJ", "FIS", "KIM", "BIO", "SEN", "PENJAS", "TIK", "BK"],
  };

  for (const classData of classes) {
    const level = parseInt(classData.name.split(' ')[1]); // Extract level from "Kelas 10"
    const subjectCodes = classSubjects[level] || [];
    const availableSubjects = subjects.filter(s => s.code && subjectCodes.includes(s.code));

    for (const subject of availableSubjects) {
      const relationship = await prisma.subjectClass.upsert({
        where: {
          subject_id_class_id: {
            subject_id: subject.id,
            class_id: classData.id,
          },
        },
        update: {},
        create: {
          subject_id: subject.id,
          class_id: classData.id,
        },
      });
      relationships.push(relationship);
    }
  }

  console.log(`✅ Created ${relationships.length} subject-class relationships`);
  return relationships;
}

/**
 * Seed class groups (rombels)
 */
export async function seedClassGroups(classes: Array<{ id: bigint; name: string; }>, programs: Record<string, { id: string; code: string | null; name: string; }>, years: Array<{ id: string; isActive: boolean; }>) {
  console.log("👥 Seeding class groups (rombels)...");

  const classGroups: Array<{ id: bigint; name: string; class_id: bigint; program_id: string; tahunAjaranId: string | null; capacity: number | null; }> = [];
  const activeYear = years.find(y => y.isActive);

  if (!activeYear) {
    console.log("⚠️  No active academic year found, skipping class groups");
    return classGroups;
  }

  // Create rombels for each class level and program
  for (const classData of classes) {
    for (const [programCode, program] of Object.entries(programs)) {
      // Create multiple rombels per class-program combination
      const numRombels = parseInt(classData.name.split(' ')[1]) <= 10 ? 3 : 2; // More rombels for lower grades

      for (let i = 1; i <= numRombels; i++) {
        const rombelName = `${classData.name.split(' ')[1]} ${programCode} ${i}`;
        let rombel = await prisma.rombel.findFirst({
          where: {
            name: rombelName,
            tahunAjaranId: activeYear.id,
          },
        });

        if (!rombel) {
          rombel = await prisma.rombel.create({
            data: {
              name: rombelName,
              class_id: classData.id,
              program_id: program.id,
              tahunAjaranId: activeYear.id,
              capacity: 40,
            },
          });
          console.log(`✅ Created rombel: ${rombel.name}`);
        } else {
          console.log(`ℹ️  Rombel already exists: ${rombel.name}`);
        }

        classGroups.push(rombel);
      }
    }
  }

  return classGroups;
}