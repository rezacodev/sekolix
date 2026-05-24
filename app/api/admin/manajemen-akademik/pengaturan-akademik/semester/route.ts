import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const semesterSchema = z.object({
  tahunAjaranId: z.string().min(1),
  number: z.number().int().min(1).max(2),
  label: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  is_active: z.boolean().optional().default(false),
});

const batchSchema = z.object({
  tahunAjaranId: z.string().min(1),
  semesters: z.array(semesterSchema.omit({ tahunAjaranId: true })).min(1),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || (user.role !== "ADMIN" && user.role !== "EDITOR")) return null;
  return user;
}

// GET ?tahunAjaranId=xxx
export async function GET(request: Request) {
  try {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const tahunAjaranId = searchParams.get("tahunAjaranId");

    const where = tahunAjaranId ? { tahunAjaranId } : {};

    const semesters = await prisma.academicSemester.findMany({
      where,
      include: { tahunAjaran: { select: { id: true, label: true } } },
      orderBy: [{ tahunAjaranId: "asc" }, { number: "asc" }],
    });

    return NextResponse.json(
      semesters.map(s => ({
        id: s.id,
        tahunAjaranId: s.tahunAjaranId,
        tahunAjaranLabel: s.tahunAjaran.label,
        number: s.number,
        label: s.label,
        startDate: s.startDate.toISOString(),
        endDate: s.endDate.toISOString(),
        is_active: s.is_active,
      }))
    );
  } catch (error) {
    console.error("Error fetching semesters:", error);
    return NextResponse.json({ error: "Failed to fetch semesters" }, { status: 500 });
  }
}

// PUT — upsert semesters for a tahunAjaran
export async function PUT(request: Request) {
  try {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const parsed = batchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation error", details: parsed.error.flatten() }, { status: 400 });
    }

    const { tahunAjaranId, semesters } = parsed.data;

    // Verify tahunAjaran exists
    const tahunAjaran = await prisma.tahunAjaran.findUnique({ where: { id: tahunAjaranId } });
    if (!tahunAjaran) {
      return NextResponse.json({ error: "Tahun ajaran not found" }, { status: 404 });
    }

    // Validate date ranges
    for (const sem of semesters) {
      if (new Date(sem.startDate) >= new Date(sem.endDate)) {
        return NextResponse.json(
          { error: `Semester ${sem.number}: startDate must be before endDate` },
          { status: 400 }
        );
      }
    }

    // Upsert each semester
    await prisma.$transaction(
      semesters.map(sem =>
        prisma.academicSemester.upsert({
          where: { tahunAjaranId_number: { tahunAjaranId, number: sem.number } },
          update: {
            label: sem.label,
            startDate: new Date(sem.startDate),
            endDate: new Date(sem.endDate),
            is_active: sem.is_active,
          },
          create: {
            tahunAjaranId,
            number: sem.number,
            label: sem.label,
            startDate: new Date(sem.startDate),
            endDate: new Date(sem.endDate),
            is_active: sem.is_active,
          },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving semesters:", error);
    return NextResponse.json({ error: "Failed to save semesters" }, { status: 500 });
  }
}
