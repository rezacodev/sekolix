import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";
import { ensureDefaultIntegrationProfiles } from "@/lib/data-integration/persistence";

export async function GET() {
  const access = await requireApiPermission("read", "integrasi-data");
  if (!access.ok) return access.response;

  const profiles = await db.dataIntegrationProfile.findMany({
    include: { _count: { select: { mappings: true, importBatches: true, exportBatches: true } } },
    orderBy: [{ target_system: "asc" }, { school_level: "asc" }, { name: "asc" }],
  });
  return NextResponse.json({ data: profiles });
}

export async function POST(request: Request) {
  const access = await requireApiPermission("create", "integrasi-data");
  if (!access.ok) return access.response;

  const profiles = await ensureDefaultIntegrationProfiles();
  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "integrasi-data",
    action: "seed_profiles",
    entityType: "DataIntegrationProfile",
    metadata: { count: profiles.length },
    request,
  });
  await writeAuditTrail({
    actorUserId: access.context.user.id,
    entityType: "DataIntegrationProfile",
    entityId: "default-presets",
    action: "seed",
    after: { count: profiles.length },
  });

  return NextResponse.json({ data: profiles }, { status: 201 });
}
