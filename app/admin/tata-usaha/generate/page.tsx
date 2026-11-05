import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";
import { GenerateLetterForm } from "../_components/OfficeForms";

export default async function GeneratedLettersPage() {
  const access = await requirePermission("read", "tata-usaha");
  if (!access) redirect("/unauthorized");
  const [templates, students, staff, letters] = await Promise.all([
    db.letterTemplate.findMany({ where: { is_active: true }, orderBy: { name: "asc" } }),
    db.pesertaDidik.findMany({ where: { deleted_at: null }, orderBy: { fullName: "asc" }, take: 300 }),
    db.staff.findMany({ where: { deleted_at: null, isActive: true }, orderBy: { name: "asc" }, take: 300 }),
    db.generatedLetter.findMany({ include: { template: true }, orderBy: { createdAt: "desc" }, take: 200 }),
  ]);
  return (
    <div className="space-y-6">
      <div><p className="text-sm text-muted-foreground">Tata Usaha</p><h1 className="text-2xl font-bold">Generate Surat</h1></div>
      <GenerateLetterForm templates={templates.map((item) => ({ id: item.id, label: item.name }))} students={students.map((item) => ({ id: item.id, label: item.fullName }))} staff={staff.map((item) => ({ id: item.id, label: item.name }))} />
      <div className="overflow-hidden rounded-lg border bg-white"><table className="w-full text-sm"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-3 py-2">Tanggal</th><th className="px-3 py-2">Template</th><th className="px-3 py-2">Subjek</th><th className="px-3 py-2">Validasi</th><th className="px-3 py-2">PDF</th></tr></thead><tbody>
        {letters.map((item) => <tr key={item.id} className="border-t"><td className="px-3 py-2">{item.createdAt.toLocaleDateString("id-ID")}</td><td className="px-3 py-2">{item.template.name}</td><td className="px-3 py-2 font-medium">{item.subject_name}</td><td className="px-3 py-2 font-mono text-xs">{item.validation_code}</td><td className="px-3 py-2"><a className="text-indigo-700" href={`/api/admin/tata-usaha/generated-letters/${item.id}/pdf`}>PDF</a></td></tr>)}
        {letters.length === 0 && <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={5}>Belum ada surat generate.</td></tr>}
      </tbody></table></div>
    </div>
  );
}

