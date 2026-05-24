import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { DEFAULT_SCALES } from "@/lib/grade/scale";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

// GET — skala konversi nilai huruf saat ini
export async function GET() {
  try {
    if (!await requireAdmin()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = await prisma.gradeScale.findMany({ orderBy: { min_score: "desc" } });
    const scales = rows.length > 0 ? rows : DEFAULT_SCALES;

    return NextResponse.json({ scales });
  } catch (error) {
    console.error("Error fetching grade scales:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const scaleEntrySchema = z.object({
  grade: z.string().min(1).max(5),
  min_score: z.number().int().min(0).max(100),
  max_score: z.number().int().min(0).max(100),
  label: z.string().max(50).optional().nullable(),
});

const updateSchema = z.object({
  scales: z.array(scaleEntrySchema).min(1).max(10),
});

// PUT — simpan konfigurasi skala (replace all)
export async function PUT(request: NextRequest) {
  try {
    if (!await requireAdmin()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { scales } = updateSchema.parse(body);

    // Validate: min <= max for every entry
    for (const s of scales) {
      if (s.min_score > s.max_score) {
        return NextResponse.json(
          { error: `Predikat ${s.grade}: nilai minimum (${s.min_score}) tidak boleh lebih besar dari nilai maksimum (${s.max_score})` },
          { status: 400 }
        );
      }
    }

    // Validate: no overlapping ranges
    const sorted = [...scales].sort((a, b) => a.min_score - b.min_score);
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].min_score <= sorted[i - 1].max_score) {
        return NextResponse.json(
          { error: `Rentang predikat ${sorted[i - 1].grade} dan ${sorted[i].grade} saling tumpang tindih` },
          { status: 400 }
        );
      }
    }

    // Upsert each grade entry
    await Promise.all(
      scales.map(({ grade, min_score, max_score, label }) =>
        prisma.gradeScale.upsert({
          where: { grade },
          update: { min_score, max_score, label: label ?? null },
          create: { grade, min_score, max_score, label: label ?? null },
        })
      )
    );

    // Remove grades that no longer exist in the new config
    const gradeKeys = scales.map(s => s.grade);
    await prisma.gradeScale.deleteMany({ where: { grade: { notIn: gradeKeys } } });

    return NextResponse.json({ success: true, updated: scales.length });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }
    console.error("Error updating grade scales:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
