import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema
const teachingJournalSchema = z.object({
  date: z.string(), // ISO date string
  timeStart: z.string().optional(),
  timeEnd: z.string().optional(),
  period: z.number().int().positive().optional(),
  topic: z.string().min(1),
  teachingMethod: z.string().optional(),
  mediaUsed: z.string().optional(),
  obstacles: z.string().optional(),
  followUp: z.string().optional(),
  notes: z.string().optional(),
  subjectId: z.string().transform((val) => BigInt(val)),
});

// GET - Fetch teaching journals
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ rombelId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const rombelId = BigInt(params.rombelId);
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!subjectId) {
      return NextResponse.json(
        { error: "subjectId is required" },
        { status: 400 }
      );
    }

    const staffId = session.user.staffId;
    if (!staffId) {
      return NextResponse.json(
        { error: "Staff ID not found in session" },
        { status: 403 }
      );
    }

    // Verify teacher has access to this subject + rombel
    const teacherSubject = await prisma.teacherSubject.findFirst({
      where: {
        teacher_id: staffId,
        subject_id: BigInt(subjectId),
        rombel_id: rombelId,
        deleted_at: null,
      },
      include: {
        subject: true,
        rombel: {
          include: {
            class: true,
            program: true,
          },
        },
      },
    });

    if (!teacherSubject) {
      return NextResponse.json(
        { error: "You don't have access to this class" },
        { status: 403 }
      );
    }

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      teacher_subject_id: teacherSubject.id,
      rombel_id: rombelId,
      deleted_at: null,
    };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      where.date = {
        gte: new Date(startDate),
      };
    } else if (endDate) {
      where.date = {
        lte: new Date(endDate),
      };
    }

    // Fetch journals
    const journals = await prisma.teachingJournal.findMany({
      where,
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json({
      subject: {
        id: Number(teacherSubject.subject.id),
        name: teacherSubject.subject.name,
      },
      rombel: {
        id: Number(teacherSubject.rombel!.id),
        name: teacherSubject.rombel!.name,
        className: teacherSubject.rombel!.class.name,
        program: teacherSubject.rombel!.program.name,
      },
      journals: journals.map((journal) => ({
        id: Number(journal.id),
        date: journal.date.toISOString().split("T")[0],
        timeStart: journal.time_start,
        timeEnd: journal.time_end,
        period: journal.period,
        topic: journal.topic,
        teachingMethod: journal.teaching_method,
        mediaUsed: journal.media_used,
        obstacles: journal.obstacles,
        followUp: journal.follow_up,
        notes: journal.notes,
        createdAt: journal.created_at.toISOString(),
        updatedAt: journal.updated_at.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching teaching journals:", error);
    return NextResponse.json(
      { error: "Failed to fetch teaching journals" },
      { status: 500 }
    );
  }
}

// POST - Create teaching journal
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ rombelId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const rombelId = BigInt(params.rombelId);
    const body = await request.json();

    // Validate request
    const validatedData = teachingJournalSchema.parse(body);
    const {
      date,
      timeStart,
      timeEnd,
      period,
      topic,
      teachingMethod,
      mediaUsed,
      obstacles,
      followUp,
      notes,
      subjectId,
    } = validatedData;

    const staffId = session.user.staffId;
    if (!staffId) {
      return NextResponse.json(
        { error: "Staff ID not found in session" },
        { status: 403 }
      );
    }

    // Verify teacher has access
    const teacherSubject = await prisma.teacherSubject.findFirst({
      where: {
        teacher_id: staffId,
        subject_id: subjectId,
        rombel_id: rombelId,
        deleted_at: null,
      },
    });

    if (!teacherSubject) {
      return NextResponse.json(
        { error: "You don't have access to this class" },
        { status: 403 }
      );
    }

    // Create journal
    const journal = await prisma.teachingJournal.create({
      data: {
        teacher_subject_id: teacherSubject.id,
        rombel_id: rombelId,
        date: new Date(date),
        time_start: timeStart,
        time_end: timeEnd,
        period,
        topic,
        teaching_method: teachingMethod,
        media_used: mediaUsed,
        obstacles,
        follow_up: followUp,
        notes,
        recorded_by: staffId,
      },
    });

    return NextResponse.json({
      id: Number(journal.id),
      date: journal.date.toISOString().split("T")[0],
      timeStart: journal.time_start,
      timeEnd: journal.time_end,
      period: journal.period,
      topic: journal.topic,
      teachingMethod: journal.teaching_method,
      mediaUsed: journal.media_used,
      obstacles: journal.obstacles,
      followUp: journal.follow_up,
      notes: journal.notes,
      createdAt: journal.created_at.toISOString(),
      updatedAt: journal.updated_at.toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating teaching journal:", error);
    return NextResponse.json(
      { error: "Failed to create teaching journal" },
      { status: 500 }
    );
  }
}

// PUT - Update teaching journal
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ rombelId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const rombelId = BigInt(params.rombelId);
    const { searchParams } = new URL(request.url);
    const journalId = searchParams.get("id");

    if (!journalId) {
      return NextResponse.json(
        { error: "Journal ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = teachingJournalSchema.partial().parse(body);

    const staffId = session.user.staffId;
    if (!staffId) {
      return NextResponse.json(
        { error: "Staff ID not found in session" },
        { status: 403 }
      );
    }

    // Verify ownership
    const existing = await prisma.teachingJournal.findFirst({
      where: {
        id: BigInt(journalId),
        rombel_id: rombelId,
        recorded_by: staffId,
        deleted_at: null,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Journal not found or access denied" },
        { status: 404 }
      );
    }

    // Update journal
    const journal = await prisma.teachingJournal.update({
      where: { id: BigInt(journalId) },
      data: {
        ...(validatedData.date && { date: new Date(validatedData.date) }),
        ...(validatedData.timeStart !== undefined && {
          time_start: validatedData.timeStart,
        }),
        ...(validatedData.timeEnd !== undefined && {
          time_end: validatedData.timeEnd,
        }),
        ...(validatedData.period !== undefined && {
          period: validatedData.period,
        }),
        ...(validatedData.topic && { topic: validatedData.topic }),
        ...(validatedData.teachingMethod !== undefined && {
          teaching_method: validatedData.teachingMethod,
        }),
        ...(validatedData.mediaUsed !== undefined && {
          media_used: validatedData.mediaUsed,
        }),
        ...(validatedData.obstacles !== undefined && {
          obstacles: validatedData.obstacles,
        }),
        ...(validatedData.followUp !== undefined && {
          follow_up: validatedData.followUp,
        }),
        ...(validatedData.notes !== undefined && { notes: validatedData.notes }),
      },
    });

    return NextResponse.json({
      id: Number(journal.id),
      date: journal.date.toISOString().split("T")[0],
      timeStart: journal.time_start,
      timeEnd: journal.time_end,
      period: journal.period,
      topic: journal.topic,
      teachingMethod: journal.teaching_method,
      mediaUsed: journal.media_used,
      obstacles: journal.obstacles,
      followUp: journal.follow_up,
      notes: journal.notes,
      createdAt: journal.created_at.toISOString(),
      updatedAt: journal.updated_at.toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating teaching journal:", error);
    return NextResponse.json(
      { error: "Failed to update teaching journal" },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete teaching journal
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ rombelId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const rombelId = BigInt(params.rombelId);
    const { searchParams } = new URL(request.url);
    const journalId = searchParams.get("id");

    if (!journalId) {
      return NextResponse.json(
        { error: "Journal ID is required" },
        { status: 400 }
      );
    }

    const staffId = session.user.staffId;
    if (!staffId) {
      return NextResponse.json(
        { error: "Staff ID not found in session" },
        { status: 403 }
      );
    }

    // Verify ownership
    const existing = await prisma.teachingJournal.findFirst({
      where: {
        id: BigInt(journalId),
        rombel_id: rombelId,
        recorded_by: staffId,
        deleted_at: null,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Journal not found or access denied" },
        { status: 404 }
      );
    }

    // Soft delete
    await prisma.teachingJournal.update({
      where: { id: BigInt(journalId) },
      data: { deleted_at: new Date() },
    });

    return NextResponse.json({ message: "Journal deleted successfully" });
  } catch (error) {
    console.error("Error deleting teaching journal:", error);
    return NextResponse.json(
      { error: "Failed to delete teaching journal" },
      { status: 500 }
    );
  }
}
