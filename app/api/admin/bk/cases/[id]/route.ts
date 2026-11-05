import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";

const updateCaseSchema = z.object({
  counselorId: z.string().optional().nullable(),
  category: z.string().trim().min(2).max(80).optional(),
  title: z.string().trim().min(3).max(160).optional(),
  description: z.string().trim().min(5).max(5000).optional(),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  visibility: z.enum(["PRIVATE_BK", "HOMEROOM", "TEACHER", "PARENT_VISIBLE"]).optional(),
  parentVisible: z.boolean().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const access = await requireApiPermission("update", "bk");
  if (!access.ok) return access.response;

  const { id } = await context.params;
  const parsed = updateCaseSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  }

  const before = await db.studentCounselingCase.findUnique({ where: { id } });
  if (!before) return NextResponse.json({ error: "Kasus BK tidak ditemukan" }, { status: 404 });

  const after = await db.studentCounselingCase.update({
    where: { id },
    data: {
      counselor_id: parsed.data.counselorId,
      category: parsed.data.category,
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status,
      priority: parsed.data.priority,
      visibility: parsed.data.visibility,
      parent_visible:
        parsed.data.parentVisible ?? (parsed.data.visibility === "PARENT_VISIBLE" ? true : undefined),
      closed_at: parsed.data.status && ["RESOLVED", "CLOSED"].includes(parsed.data.status) ? new Date() : undefined,
    },
  });

  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "bk",
    action: "update_case",
    entityType: "StudentCounselingCase",
    entityId: id,
    metadata: { status: after.status, priority: after.priority },
    request,
  });
  await writeAuditTrail({
    actorUserId: access.context.user.id,
    entityType: "StudentCounselingCase",
    entityId: id,
    action: "update",
    before,
    after,
  });

  return NextResponse.json({ data: after });
}
