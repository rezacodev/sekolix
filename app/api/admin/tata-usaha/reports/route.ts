import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";

export async function GET() {
  const access = await requireApiPermission("read", "tata-usaha");
  if (!access.ok) return access.response;
  const [incoming, outgoing, pendingDispositions, pendingApprovals, templates, archives] = await Promise.all([
    db.incomingLetter.count(),
    db.outgoingLetter.count(),
    db.letterDisposition.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    db.letterApproval.count({ where: { status: "PENDING" } }),
    db.letterTemplate.count({ where: { is_active: true } }),
    db.archiveRecord.count(),
  ]);
  return NextResponse.json({ data: { incoming, outgoing, pendingDispositions, pendingApprovals, templates, archives } });
}

