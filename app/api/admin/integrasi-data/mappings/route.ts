import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { ensureDefaultIntegrationProfiles, getDefaultIntegrationProfile } from "@/lib/data-integration/persistence";
import { supportedEntityOrDefault } from "@/lib/data-integration/server";

export async function GET(request: Request) {
  const access = await requireApiPermission("read", "integrasi-data");
  if (!access.ok) return access.response;

  const url = new URL(request.url);
  const entity = supportedEntityOrDefault(url.searchParams.get("entity"));
  const profileId = url.searchParams.get("profileId");
  const profile = profileId
    ? await db.dataIntegrationProfile.findUnique({ where: { id: profileId } })
    : await getDefaultIntegrationProfile();

  if (!profile) {
    await ensureDefaultIntegrationProfiles();
    return NextResponse.json({ data: [] });
  }

  const mappings = await db.dataFieldMapping.findMany({
    where: { profile_id: profile.id, entity },
    orderBy: [{ sort_order: "asc" }, { label: "asc" }],
  });
  return NextResponse.json({ data: mappings, profile });
}

export async function POST() {
  const access = await requireApiPermission("create", "integrasi-data");
  if (!access.ok) return access.response;

  const profiles = await ensureDefaultIntegrationProfiles();
  return NextResponse.json({ data: { profiles: profiles.length } }, { status: 201 });
}
