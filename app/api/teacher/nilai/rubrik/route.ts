import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AssessmentType } from "@prisma/client";

// GET - Fetch rubrik penilaian by subject
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId");
    const rombelId = searchParams.get("rombelId");
    const type = searchParams.get("type");

    if (!subjectId || !rombelId) {
      return NextResponse.json(
        { error: "subjectId and rombelId are required" },
        { status: 400 }
      );
    }

    // Get staffId to verify teacher access
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

    // Verify teacher mengampu subject ini di rombel tersebut
    const teacherSubject = await prisma.teacherSubject.findFirst({
      where: {
        teacher_id: staffId,
        subject_id: BigInt(subjectId),
        rombel_id: BigInt(rombelId),
        deleted_at: null
      }
    });

    if (!teacherSubject) {
      return NextResponse.json(
        { error: "You don't have access to this subject" },
        { status: 403 }
      );
    }

    // Get rubrik penilaian
    const rubrics = await prisma.assessmentRubric.findMany({
      where: {
        subject_id: BigInt(subjectId),
        rombel_id: BigInt(rombelId),
        ...(type && { type: type as AssessmentType }),
        deleted_at: null
      },
      include: {
        criteria: {
          where: { deleted_at: null },
          orderBy: { order: "asc" }
        }
      },
      orderBy: { created_at: "desc" }
    });

    return NextResponse.json({
      rubrics: rubrics.map(r => ({
        id: Number(r.id),
        name: r.name,
        description: r.description,
        type: r.type,
        weight: r.weight,
        maxScore: Number(r.max_score),
        isActive: r.is_active,
        criteria: r.criteria.map(c => ({
          id: Number(c.id),
          name: c.name,
          description: c.description,
          maxScore: Number(c.max_score),
          order: c.order
        }))
      }))
    });
  } catch (error) {
    console.error("Error fetching rubrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch rubrics" },
      { status: 500 }
    );
  }
}

// POST - Create new rubrik
export async function POST(request: Request) {
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

    const body = await request.json();
    const { subjectId, rombelId, name, description, type, weight, maxScore, criteria } = body;

    // Validate required fields
    if (!subjectId || !rombelId) {
      return NextResponse.json(
        { error: "subjectId dan rombelId wajib diisi" },
        { status: 400 }
      );
    }

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

    // Verify teacher access
    const teacherSubject = await prisma.teacherSubject.findFirst({
      where: {
        teacher_id: staffId,
        subject_id: BigInt(subjectId),
        rombel_id: BigInt(rombelId),
        deleted_at: null
      }
    });

    if (!teacherSubject) {
      return NextResponse.json(
        { error: "You don't have access to this subject" },
        { status: 403 }
      );
    }

    // Create rubrik with criteria
    const rubric = await prisma.assessmentRubric.create({
      data: {
        subject_id: BigInt(subjectId),
        rombel_id: BigInt(rombelId),
        name,
        description,
        type: type || "TUGAS",
        weight: weight || 1,
        max_score: maxScore || 100,
        criteria: {
          create: criteria?.map((c: { name: string; description?: string; maxScore: number; order?: number }, index: number) => ({
            name: c.name,
            description: c.description,
            max_score: c.maxScore || 25,
            order: c.order ?? index
          })) || []
        }
      },
      include: {
        criteria: true
      }
    });

    return NextResponse.json({
      message: "Rubrik created successfully",
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
    console.error("Error creating rubric:", error);
    return NextResponse.json(
      { error: "Failed to create rubric" },
      { status: 500 }
    );
  }
}
