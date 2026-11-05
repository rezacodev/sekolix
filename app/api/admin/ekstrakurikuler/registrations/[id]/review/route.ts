import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";
import { getStaffIdForUser } from "@/lib/extracurricular/server";

const reviewSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  reviewNote: z.string().trim().max(1000).optional().nullable(),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await requireApiPermission("approve", "ekstrakurikuler");
  if (!access.ok) return access.response;
  const { id } = await context.params;
  const parsed = reviewSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  const [registration, reviewerId] = await Promise.all([db.extracurricularRegistration.findUnique({ where: { id }, include: { extracurricular: true, student: true } }), getStaffIdForUser(access.context.user.id)]);
  if (!registration) return NextResponse.json({ error: "Pendaftaran tidak ditemukan" }, { status: 404 });
  const result = await db.$transaction(async (tx) => {
    const updated = await tx.extracurricularRegistration.update({ where: { id }, data: { status: parsed.data.status, reviewed_by: reviewerId, reviewed_at: new Date(), review_note: parsed.data.reviewNote ?? null } });
    if (parsed.data.status === "APPROVED") {
      await tx.extracurricularMember.upsert({
        where: { extracurricular_id_student_id: { extracurricular_id: registration.extracurricular_id, student_id: registration.student_id } },
        update: { status: "ACTIVE" },
        create: { extracurricular_id: registration.extracurricular_id, student_id: registration.student_id, status: "ACTIVE", notes: "Disetujui dari pendaftaran portal siswa." },
      });
    }
    return updated;
  });
  await logActivity({ actorUserId: access.context.user.id, actorName: access.context.user.name, module: "ekstrakurikuler", action: "review_registration", entityType: "ExtracurricularRegistration", entityId: id, metadata: { status: parsed.data.status, club: registration.extracurricular.name, student: registration.student.fullName }, request });
  await writeAuditTrail({ actorUserId: access.context.user.id, entityType: "ExtracurricularRegistration", entityId: id, action: "review", before: registration, after: result });
  return NextResponse.json({ data: result });
}

