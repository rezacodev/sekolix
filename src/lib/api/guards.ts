import { forbidden, requirePermission } from "@/lib/governance/server";

export async function requireApiPermission(action: string, subject: string) {
  const context = await requirePermission(action, subject);
  if (!context) {
    return {
      ok: false as const,
      response: forbidden("Unauthorized"),
    };
  }

  return {
    ok: true as const,
    context,
  };
}
