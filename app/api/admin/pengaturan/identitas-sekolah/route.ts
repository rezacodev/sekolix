import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

const classNames: Record<string, string[]> = {
  SD: ["Kelas 1", "Kelas 2", "Kelas 3", "Kelas 4", "Kelas 5", "Kelas 6"],
  MI: ["Kelas 1", "Kelas 2", "Kelas 3", "Kelas 4", "Kelas 5", "Kelas 6"],
  SMP: ["Kelas 7", "Kelas 8", "Kelas 9"],
  MTS: ["Kelas 7", "Kelas 8", "Kelas 9"],
  SMA: ["Kelas 10", "Kelas 11", "Kelas 12"],
  MA: ["Kelas 10", "Kelas 11", "Kelas 12"],
  SMK: ["Kelas 10", "Kelas 11", "Kelas 12"]
};

async function regenerateClassesForSchoolLevel(schoolLevel: string) {
  const availableClasses = classNames[schoolLevel] || [];

  // Soft delete existing classes
  await db.class.updateMany({
    where: { deleted_at: null },
    data: { deleted_at: new Date() }
  });

  // Create new classes
  for (const className of availableClasses) {
    await db.class.create({
      data: { name: className }
    });
  }

  return availableClasses;
}

export async function GET() {
  try {
    const identity = await db.schoolIdentity.findFirst();
    return NextResponse.json({ data: identity });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const existing = await db.schoolIdentity.findFirst();

    let result;
    if (existing) {
      result = await db.schoolIdentity.update({ where: { id: existing.id }, data: body });
    } else {
      result = await db.schoolIdentity.create({ data: body });
    }

    // Regenerate classes if schoolLevel changed
    if (body.schoolLevel && body.schoolLevel !== existing?.schoolLevel) {
      await regenerateClassesForSchoolLevel(body.schoolLevel);
    }

    return NextResponse.json({ data: result });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
