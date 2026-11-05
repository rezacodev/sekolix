import { authOptions } from "@/lib/auth";
import { createApprovalRequest, logActivity, writeAuditTrail } from "@/lib/governance/server";
import { db as prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["SUPERADMIN", "ADMIN"].includes(session.user.role)) return null;
  return session.user;
}

export async function GET(req: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const status = url.searchParams.get("status") || undefined;
  const moduleFilter = url.searchParams.get("module") || undefined;
  const take = Math.min(Number(url.searchParams.get("take") ?? 50), 100);

  const requests = await prisma.approvalRequest.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(moduleFilter ? { module: moduleFilter } : {}),
    },
    include: { steps: { orderBy: { step_order: "asc" } } },
    orderBy: { created_at: "desc" },
    take,
  });

  return NextResponse.json({ requests });
}

export async function POST(req: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (!body.module || !body.action || !body.title) {
    return NextResponse.json({ error: "module, action, dan title wajib diisi" }, { status: 400 });
  }

  const request = await createApprovalRequest({
    module: body.module,
    action: body.action,
    title: body.title,
    description: body.description,
    entityType: body.entityType,
    entityId: body.entityId,
    requestedBy: user.id,
    requestedByName: user.name,
    payload: body.payload,
    steps: body.steps,
  });

  await logActivity({
    actorUserId: user.id,
    actorName: user.name,
    module: "pengaturan.approval",
    action: "create",
    entityType: "ApprovalRequest",
    entityId: request.id,
    metadata: { module: body.module, action: body.action },
    request: req,
  });

  return NextResponse.json(request, { status: 201 });
}

export async function PATCH(req: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, decision, note } = await req.json();
  if (!id || !["APPROVED", "REJECTED", "CANCELLED"].includes(decision)) {
    return NextResponse.json({ error: "id dan decision valid wajib diisi" }, { status: 400 });
  }

  const before = await prisma.approvalRequest.findUnique({
    where: { id },
    include: { steps: true },
  });
  if (!before) return NextResponse.json({ error: "Approval request tidak ditemukan" }, { status: 404 });

  const updated = await prisma.approvalRequest.update({
    where: { id },
    data: {
      status: decision,
      decided_by: user.id,
      decided_at: new Date(),
      decision_note: note ?? null,
      steps: {
        updateMany: {
          where: { status: "PENDING" },
          data: {
            status: decision,
            decided_by: user.id,
            decided_at: new Date(),
            note: note ?? null,
          },
        },
      },
    },
    include: { steps: { orderBy: { step_order: "asc" } } },
  });

  await logActivity({
    actorUserId: user.id,
    actorName: user.name,
    module: "pengaturan.approval",
    action: decision.toLowerCase(),
    entityType: "ApprovalRequest",
    entityId: id,
    metadata: { note },
    request: req,
  });
  await writeAuditTrail({
    actorUserId: user.id,
    entityType: "ApprovalRequest",
    entityId: id,
    action: decision.toLowerCase(),
    before,
    after: updated,
    reason: note,
  });

  return NextResponse.json(updated);
}
