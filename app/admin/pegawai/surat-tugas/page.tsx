import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";
import { AssignmentLetterForm } from "../_components/StaffOpsForms";

export default async function StaffAssignmentLetterPage() {
  const access = await requirePermission("read", "pegawai");
  if (!access) redirect("/unauthorized");

  const [staff, letters] = await Promise.all([
    db.staff.findMany({ where: { deleted_at: null, isActive: true }, orderBy: { name: "asc" }, take: 300 }),
    db.staffAssignmentLetter.findMany({ include: { staff: true, creator: { select: { name: true } } }, orderBy: { issued_at: "desc" }, take: 200 }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Manajemen Pegawai</p>
        <h1 className="text-2xl font-bold">SK dan Surat Tugas</h1>
      </div>

      <AssignmentLetterForm staff={staff.map((item) => ({ id: item.id, label: item.name }))} />

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr><th className="px-3 py-2">Nomor</th><th className="px-3 py-2">Pegawai</th><th className="px-3 py-2">Judul</th><th className="px-3 py-2">Terbit</th><th className="px-3 py-2">Periode</th><th className="px-3 py-2">Sumber</th></tr>
          </thead>
          <tbody>
            {letters.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-3 py-2 font-mono text-xs">{item.letter_number}</td>
                <td className="px-3 py-2 font-medium">{item.staff.name}</td>
                <td className="px-3 py-2">{item.file_url ? <a href={item.file_url} className="text-cyan-700" target="_blank" rel="noreferrer">{item.title}</a> : item.title}</td>
                <td className="px-3 py-2">{item.issued_at.toLocaleDateString("id-ID")}</td>
                <td className="px-3 py-2">{item.start_date?.toLocaleDateString("id-ID") ?? "-"} - {item.end_date?.toLocaleDateString("id-ID") ?? "-"}</td>
                <td className="px-3 py-2">{item.module_source}</td>
              </tr>
            ))}
            {letters.length === 0 && <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={6}>Belum ada surat tugas.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

