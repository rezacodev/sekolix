import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";
import { serializeDocumentType } from "@/lib/staff-ops/server";
import { StaffDocumentForm } from "../_components/StaffOpsForms";

export default async function StaffDocumentPage() {
  const access = await requirePermission("read", "pegawai");
  if (!access) redirect("/unauthorized");

  const [staff, documents] = await Promise.all([
    db.staff.findMany({ where: { deleted_at: null, isActive: true }, orderBy: { name: "asc" }, take: 300 }),
    db.staffDocument.findMany({ include: { staff: true, uploader: { select: { name: true } } }, orderBy: [{ expires_at: "asc" }, { createdAt: "desc" }], take: 200 }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Manajemen Pegawai</p>
        <h1 className="text-2xl font-bold">Dokumen Kepegawaian</h1>
      </div>

      <StaffDocumentForm staff={staff.map((item) => ({ id: item.id, label: item.name }))} />

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr><th className="px-3 py-2">Pegawai</th><th className="px-3 py-2">Jenis</th><th className="px-3 py-2">Dokumen</th><th className="px-3 py-2">Terbit</th><th className="px-3 py-2">Kadaluarsa</th><th className="px-3 py-2">Uploader</th></tr>
          </thead>
          <tbody>
            {documents.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-3 py-2 font-medium">{item.staff.name}</td>
                <td className="px-3 py-2">{serializeDocumentType(item.type)}</td>
                <td className="px-3 py-2"><a href={item.file_url} className="font-medium text-cyan-700" target="_blank" rel="noreferrer">{item.title}</a></td>
                <td className="px-3 py-2">{item.issued_at?.toLocaleDateString("id-ID") ?? "-"}</td>
                <td className="px-3 py-2">{item.expires_at?.toLocaleDateString("id-ID") ?? "-"}</td>
                <td className="px-3 py-2">{item.uploader?.name ?? "-"}</td>
              </tr>
            ))}
            {documents.length === 0 && <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={6}>Belum ada dokumen.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

