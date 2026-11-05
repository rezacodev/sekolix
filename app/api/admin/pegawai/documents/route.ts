import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";
import { getStaffIdForUser } from "@/lib/staff-ops/server";

const documentSchema = z.object({
  staffId: z.string().min(1),
  type: z.enum(["SK", "CERTIFICATE", "CONTRACT", "IDENTITY", "OTHER"]).default("OTHER"),
  title: z.string().trim().min(2).max(180),
  fileUrl: z.string().trim().url(),
  fileName: z.string().trim().max(180).optional().nullable(),
  issuedAt: z.coerce.date().optional().nullable(),
  expiresAt: z.coerce.date().optional().nullable(),
  isSensitive: z.coerce.boolean().default(true),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export async function GET() {
  const access = await requireApiPermission("read", "pegawai");
  if (!access.ok) return access.response;

  const documents = await db.staffDocument.findMany({
    include: { staff: { select: { id: true, name: true, nip: true } }, uploader: { select: { name: true } } },
    orderBy: [{ expires_at: "asc" }, { createdAt: "desc" }],
    take: 300,
  });
  return NextResponse.json({ data: documents });
}

export async function POST(request: Request) {
  const access = await requireApiPermission("create", "pegawai");
  if (!access.ok) return access.response;

  const parsed = documentSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  }

  const [staff, uploaderId] = await Promise.all([
    db.staff.findFirst({ where: { id: parsed.data.staffId, deleted_at: null } }),
    getStaffIdForUser(access.context.user.id),
  ]);
  if (!staff) return NextResponse.json({ error: "Pegawai tidak ditemukan" }, { status: 404 });

  const document = await db.staffDocument.create({
    data: {
      staff_id: staff.id,
      type: parsed.data.type,
      title: parsed.data.title,
      file_url: parsed.data.fileUrl,
      file_name: parsed.data.fileName ?? null,
      issued_at: parsed.data.issuedAt ?? null,
      expires_at: parsed.data.expiresAt ?? null,
      uploaded_by: uploaderId,
      is_sensitive: parsed.data.isSensitive,
      notes: parsed.data.notes ?? null,
    },
  });

  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "pegawai",
    action: "upload_staff_document",
    entityType: "StaffDocument",
    entityId: document.id,
    metadata: { staffName: staff.name, type: document.type, title: document.title },
    request,
  });
  await writeAuditTrail({
    actorUserId: access.context.user.id,
    entityType: "StaffDocument",
    entityId: document.id,
    action: "create",
    after: document,
  });

  return NextResponse.json({ data: document }, { status: 201 });
}

