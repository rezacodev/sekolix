import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const classNames: Record<string, string[]> = {
  SD: ["Kelas 1", "Kelas 2", "Kelas 3", "Kelas 4", "Kelas 5", "Kelas 6"],
  MI: ["Kelas 1", "Kelas 2", "Kelas 3", "Kelas 4", "Kelas 5", "Kelas 6"],
  SMP: ["Kelas 7", "Kelas 8", "Kelas 9"],
  MTS: ["Kelas 7", "Kelas 8", "Kelas 9"],
  SMA: ["Kelas 10", "Kelas 11", "Kelas 12"],
  MA: ["Kelas 10", "Kelas 11", "Kelas 12"],
  SMK: ["Kelas 10", "Kelas 11", "Kelas 12"]
};

async function generateClassesForSchoolLevel() {
  try {
    // Get school identity
    const schoolIdentity = await prisma.schoolIdentity.findFirst();
    if (!schoolIdentity?.schoolLevel) {
      console.log("School level not configured");
      return;
    }

    const availableClasses = classNames[schoolIdentity.schoolLevel] || [];
    console.log(`Generating classes for ${schoolIdentity.schoolLevel}:`, availableClasses);

    // Soft delete existing classes (set deleted_at)
    await prisma.class.updateMany({
      where: { deleted_at: null },
      data: { deleted_at: new Date() }
    });

    // Create new classes
    for (const className of availableClasses) {
      await prisma.class.create({
        data: { name: className }
      });
    }

    console.log(`Successfully generated ${availableClasses.length} classes`);
  } catch (error) {
    console.error("Error generating classes:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
generateClassesForSchoolLevel();
