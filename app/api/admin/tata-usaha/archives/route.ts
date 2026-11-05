import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";
import { getStaffIdForUser, nextOfficeNumber } from "@/lib/office/server";

const archiveSchema = z.object({
  code: z.string().trim().max(80).optional().nullable(),
  title: z.string().trim().min(2).max(180),
  category: z.string().trim().max(80).default("GENERAL"),
  visibility: z.enum(["INTERNAL", "RESTRICTED", "PUBLIC_LINK"]).default("INTERNAL"),
  incomingLetterId: z.string().optional().nullable(),
  outgoingLetterId: z.string().optional().nullable(),
  generatedLetterId: z.string().optional().nullable(),
  fileUrl: z.string().trim().url().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export async function GET(request: Request) {
  const access = await requireApiPermission("read", "tata-usaha");
  if (!access.ok) return access.response;
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim();
  const archives = await db.archiveRecord.findMany({
    where: search ? { OR: [{ title: { contains: search, mode: "insensitive" } }, { code: { contains: search, mode: "insensitive" } }] } : {},
    include: { incomingLetter: true, outgoingLetter: true, generatedLetter: true, creator: { select: { name: true } } },
    orderBy: { archived_at: "desc" },
    take: 300,
  });
  return NextResponse.json({ data: archives });
}

export async function POST(request: Request) {
  const access = await requireApiPermission("create", "tata-usaha");
  if (!access.ok) return access.response;
  const parsed = archiveSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  const creatorId = await getStaffIdForUser(access.context.user.id);
  const code = parsed.data.code || (await nextOfficeNumber("ARCHIVE", "ARS"));
  const archive = await db.archiveRecord.create({
    data: {
      code,
      title: parsed.data.title,
      category: parsed.data.category,
      visibility: parsed.data.visibility,
      incoming_letter_id: parsed.data.incomingLetterId ?? null,
      outgoing_letter_id: parsed.data.outgoingLetterId ?? null,
      generated_letter_id: parsed.data.generatedLetterId ?? null,
      file_url: parsed.data.fileUrl ?? null,
      tags: parsed.data.tags,
      created_by: creatorId,
      notes: parsed.data.notes ?? null,
    },
  });
  await logActivity({ actorUserId: access.context.user.id, actorName: access.context.user.name, module: "tata-usaha", action: "create_archive_record", entityType: "ArchiveRecord", entityId: archive.id, metadata: { code }, request });
  await writeAuditTrail({ actorUserId: access.context.user.id, entityType: "ArchiveRecord", entityId: archive.id, action: "create", after: archive });
  return NextResponse.json({ data: archive }, { status: 201 });
}

