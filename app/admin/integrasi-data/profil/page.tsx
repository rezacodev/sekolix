import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";
import { ensureDefaultIntegrationProfiles } from "@/lib/data-integration/persistence";
import { SeedIntegrationButton } from "../_components/IntegrationActions";

export default async function DataIntegrationProfilesPage() {
  const access = await requirePermission("read", "integrasi-data");
  if (!access) redirect("/unauthorized");
  await ensureDefaultIntegrationProfiles();

  const profiles = await db.dataIntegrationProfile.findMany({
    include: { mappings: { orderBy: [{ entity: "asc" }, { sort_order: "asc" }], take: 12 }, _count: { select: { mappings: true } } },
    orderBy: [{ target_system: "asc" }, { school_level: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Integrasi Data</p>
          <h1 className="text-2xl font-bold">Profil & Mapping</h1>
        </div>
        <SeedIntegrationButton />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {profiles.map((profile) => (
          <section key={profile.id} className="rounded-lg border bg-white p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="font-semibold">{profile.name}</h2>
                <p className="text-sm text-muted-foreground">{profile.description}</p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">{profile.target_system} · {profile.school_level}</span>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2">Entitas</th>
                    <th className="py-2">Internal</th>
                    <th className="py-2">Target</th>
                    <th className="py-2">Wajib</th>
                  </tr>
                </thead>
                <tbody>
                  {profile.mappings.map((mapping) => (
                    <tr key={mapping.id} className="border-b last:border-0">
                      <td className="py-2">{mapping.entity}</td>
                      <td className="py-2">{mapping.internal_field}</td>
                      <td className="py-2">{mapping.target_field}</td>
                      <td className="py-2">{mapping.required ? "Ya" : "Tidak"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{profile._count.mappings} mapping tersedia untuk profil ini.</p>
          </section>
        ))}
      </div>
    </div>
  );
}
