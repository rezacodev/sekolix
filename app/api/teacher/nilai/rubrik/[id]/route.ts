import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// PATCH - Update specific fields (like weight only)
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { staff: true }
    });

    const staffId = user?.staff?.[0]?.id;
    if (!staffId) {
      return NextResponse.json(
        { error: "Staff ID not found" },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();
    const { weight } = body;

    // Get existing rubrik
    const existingRubric = await prisma.assessmentRubric.findUnique({
      where: { id: BigInt(id) },
      include: { subject: true }
    });

    if (!existingRubric) {
      return NextResponse.json(
        { error: "Rubric not found" },
        { status: 404 }
      );
    }

    // Verify teacher access
    const teacherSubject = await prisma.teacherSubject.findFirst({
      where: {
        teacher_id: staffId,
        subject_id: existingRubric.subject_id,
        deleted_at: null
      }
    });

    if (!teacherSubject) {
      return NextResponse.json(
        { error: "You don't have access to this rubric" },
        { status: 403 }
      );
    }

    // Update only weight
    const rubric = await prisma.assessmentRubric.update({
      where: { id: BigInt(id) },
      data: { weight },
      select: {
        id: true,
        name: true,
        weight: true
      }
    });

    return NextResponse.json({
      message: "Rubric weight updated successfully",
      rubric: {
        id: Number(rubric.id),
        name: rubric.name,
        weight: rubric.weight
      }
    });
  } catch (error) {
    console.error("Error updating rubric weight:", error);
    return NextResponse.json(
      { error: "Failed to update rubric weight" },
      { status: 500 }
    );
  }
}

// PUT - Update rubrik
export async function PUT(request: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { staff: true }
    });

    const staffId = user?.staff?.[0]?.id;
    if (!staffId) {
      return NextResponse.json(
        { error: "Staff ID not found" },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();
    const { name, description, type, weight, maxScore, isActive, criteria } = body;

    // Validate required fields
    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Nama rubrik wajib diisi" },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { error: "Tipe penilaian wajib dipilih" },
        { status: 400 }
      );
    }

    if (!criteria || !Array.isArray(criteria) || criteria.length === 0) {
      return NextResponse.json(
        { error: "Minimal satu kriteria penilaian wajib ditambahkan" },
        { status: 400 }
      );
    }

    // Validate criteria
    for (const [index, criterion] of criteria.entries()) {
      if (!criterion.name?.trim()) {
        return NextResponse.json(
          { error: `Nama kriteria ${index + 1} wajib diisi` },
          { status: 400 }
        );
      }
      if (!criterion.maxScore || criterion.maxScore <= 0) {
        return NextResponse.json(
          { error: `Nilai maksimal kriteria ${index + 1} harus lebih dari 0` },
          { status: 400 }
        );
      }
    }

    // Validate total criteria max score doesn't exceed 100
    const totalMaxScore = criteria.reduce((sum: number, c: { maxScore?: number }) => sum + (c.maxScore || 0), 0);
    if (totalMaxScore > 100) {
      return NextResponse.json(
        { error: `Total nilai maksimal kriteria tidak boleh melebihi 100. Total saat ini: ${totalMaxScore}` },
        { status: 400 }
      );
    }

    // Get existing rubrik
    const existingRubric = await prisma.assessmentRubric.findUnique({
      where: { id: BigInt(id) },
      include: { subject: true }
    });

    if (!existingRubric) {
      return NextResponse.json(
        { error: "Rubric not found" },
        { status: 404 }
      );
    }

    // Verify teacher access
    const teacherSubject = await prisma.teacherSubject.findFirst({
      where: {
        teacher_id: staffId,
        subject_id: existingRubric.subject_id,
        deleted_at: null
      }
    });

    if (!teacherSubject) {
      return NextResponse.json(
        { error: "You don't have access to this rubric" },
        { status: 403 }
      );
    }

    // Update rubrik and criteria
    const rubric = await prisma.assessmentRubric.update({
      where: { id: BigInt(id) },
      data: {
        name,
        description,
        type,
        weight,
        max_score: maxScore,
        is_active: isActive,
        criteria: criteria ? {
          // Soft delete existing criteria
          updateMany: {
            where: { deleted_at: null },
            data: { deleted_at: new Date() }
          },
          // Create new criteria
          create: criteria.map((c: { name: string; description?: string; maxScore: number; order?: number }, index: number) => ({
            name: c.name,
            description: c.description,
            max_score: c.maxScore || 25,
            order: c.order ?? index
          }))
        } : undefined
      },
      include: {
        criteria: {
          where: { deleted_at: null },
          orderBy: { order: "asc" }
        }
      }
    });

    return NextResponse.json({
      message: "Rubrik updated successfully",
      rubric: {
        id: Number(rubric.id),
        name: rubric.name,
        criteria: rubric.criteria.map(c => ({
          id: Number(c.id),
          name: c.name,
          maxScore: Number(c.max_score)
        }))
      }
    });
  } catch (error) {
    console.error("Error updating rubric:", error);
    return NextResponse.json(
      { error: "Failed to update rubric" },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete rubrik
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { staff: true }
    });

    const staffId = user?.staff?.[0]?.id;
    if (!staffId) {
      return NextResponse.json(
        { error: "Staff ID not found" },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    // Get existing rubrik
    const existingRubric = await prisma.assessmentRubric.findUnique({
      where: { id: BigInt(id) },
      include: { subject: true }
    });

    if (!existingRubric) {
      return NextResponse.json(
        { error: "Rubric not found" },
        { status: 404 }
      );
    }

    // Verify teacher access
    const teacherSubject = await prisma.teacherSubject.findFirst({
      where: {
        teacher_id: staffId,
        subject_id: existingRubric.subject_id,
        deleted_at: null
      }
    });

    if (!teacherSubject) {
      return NextResponse.json(
        { error: "You don't have access to this rubric" },
        { status: 403 }
      );
    }

    // Soft delete
    await prisma.assessmentRubric.update({
      where: { id: BigInt(id) },
      data: { deleted_at: new Date() }
    });

    return NextResponse.json({
      message: "Rubrik deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting rubric:", error);
    return NextResponse.json(
      { error: "Failed to delete rubric" },
      { status: 500 }
    );
  }
}
