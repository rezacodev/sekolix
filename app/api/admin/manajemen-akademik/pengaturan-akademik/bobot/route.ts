import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const COMPONENTS = ["TUGAS", "ULANGAN_HARIAN", "UTS", "UAS", "PRAKTIK"] as const;
type ComponentKey = typeof COMPONENTS[number];

const DEFAULT_WEIGHTS: Record<ComponentKey, number> = {
  TUGAS: 20,
  ULANGAN_HARIAN: 20,
  UTS: 20,
  UAS: 30,
  PRAKTIK: 10,
};

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

// GET — bobot komponen nilai saat ini
export async function GET() {
  try {
    if (!await requireAdmin()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = await prisma.gradeComponentWeight.findMany();

    // Build map dari DB, fallback ke default untuk komponen yang belum ada
    const map: Record<string, number> = {};
    for (const row of rows) {
      map[row.component] = row.weight;
    }

    const weights = COMPONENTS.map(component => ({
      component,
      weight: map[component] ?? DEFAULT_WEIGHTS[component],
    }));

    const total = weights.reduce((s, w) => s + w.weight, 0);

    return NextResponse.json({ weights, total });
  } catch (error) {
    console.error("Error fetching grade component weights:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const updateSchema = z.object({
  weights: z.array(
    z.object({
      component: z.enum(COMPONENTS),
      weight: z.number().int().min(0).max(100),
    })
  ).length(COMPONENTS.length),
});

// PUT — simpan bobot (upsert semua komponen sekaligus)
export async function PUT(request: NextRequest) {
  try {
    if (!await requireAdmin()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { weights } = updateSchema.parse(body);

    const total = weights.reduce((s, w) => s + w.weight, 0);
    if (total !== 100) {
      return NextResponse.json(
        { error: `Total bobot harus 100%. Saat ini: ${total}%` },
        { status: 400 }
      );
    }

    // Upsert tiap komponen
    await Promise.all(
      weights.map(({ component, weight }) =>
        prisma.gradeComponentWeight.upsert({
          where: { component },
          update: { weight },
          create: { component, weight },
        })
      )
    );

    return NextResponse.json({ success: true, total });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }
    console.error("Error updating grade component weights:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
