import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z, ZodError } from "zod";
import prisma from "@/lib/db";

const sectionUpdateSchema = z.object({
  id: z.string().cuid(),
  title: z.string().min(1),
  subtitle: z.string().optional().nullable(),
  body: z.string().optional().nullable(),
  image: z.string().url().optional().nullable(),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  type: z.string().optional(),
  metadata: z.string().optional().nullable()
});

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug") ?? undefined;

  const sections = await prisma.landingSection.findMany({
    where: slug ? { slug } : undefined,
    orderBy: [{ order: "asc" }, { createdAt: "asc" }]
  });

  return NextResponse.json({ sections });
}

export async function PATCH(request: NextRequest) {
  try {
    const payload = await request.json();
    const data = sectionUpdateSchema.parse(payload);

    const updated = await prisma.landingSection.update({
      where: { id: data.id },
      data: {
        title: data.title,
        subtitle: data.subtitle ?? null,
        body: data.body ?? null,
        image: data.image ?? null,
        order: data.order ?? undefined,
        isActive: data.isActive ?? undefined,
        metadata: data.metadata ?? null
      }
    });

    return NextResponse.json({ section: updated });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ errors: error.issues }, { status: 422 });
    }

    console.error("Failed to update landing section", error);
    return NextResponse.json({ message: "Unable to update section" }, { status: 500 });
  }
}
