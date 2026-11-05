import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";

export async function GET(request: Request) {
  const access = await requireApiPermission("read", "integrasi-data");
  if (!access.ok) return access.response;

  const url = new URL(request.url);
  const entity = url.searchParams.get("entity") ?? undefined;
  const issues = await db.dataValidationIssue.findMany({
    where: { status: "OPEN", entity },
    orderBy: [{ severity: "desc" }, { created_at: "desc" }],
    take: 200,
  });
  return NextResponse.json({ data: issues });
}
