import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";
import { getStaffIdForUser } from "@/lib/bk/server";

const noteSchema = z.object({
  studentId: z.string().min(1),
  caseId: z.string().optional().nullable(),
  type: z.string().trim().min(2).max(80).default("GENERAL"),
  title: z.string().trim().min(3).max(160),
  note: z.string().trim().min(5).max(5000),
  visibility: z.enum(["PRIVATE_BK", "HOMEROOM", "TEACHER", "PARENT_VISIBLE"]).default("PRIVATE_BK"),
  parentVisible: z.boolean().default(false),
});

export async function POST(request: Request) {
  const access = await requireApiPermission("create", "bk");
  if (!access.ok) return access.response;

  const parsed = noteSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  }

  const staffId = await getStaffIdForUser(access.context.user.id);
  const created = await db.studentDevelopmentNote.create({
    data: {
      student_id: parsed.data.studentId,
      case_id: parsed.data.caseId ?? null,
      author_id: staffId,
      type: parsed.data.type,
      title: parsed.data.title,
      note: parsed.data.note,
      visibility: parsed.data.visibility,
      parent_visible: parsed.data.parentVisible || parsed.data.visibility === "PARENT_VISIBLE",
    },
  });

  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "bk",
    action: "create_development_note",
    entityType: "StudentDevelopmentNote",
    entityId: created.id,
    metadata: { studentId: created.student_id, visibility: created.visibility },
    request,
  });
  await writeAuditTrail({
    actorUserId: access.context.user.id,
    entityType: "StudentDevelopmentNote",
    entityId: created.id,
    action: "create",
    after: created,
  });

  return NextResponse.json({ data: created }, { status: 201 });
}
