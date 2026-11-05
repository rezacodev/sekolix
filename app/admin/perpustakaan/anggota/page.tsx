import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";
import { SyncMembersButton } from "../_components/LibraryForms";

export default async function LibraryMembersPage() {
  const access = await requirePermission("read", "perpustakaan");
  if (!access) redirect("/unauthorized");

  const members = await db.libraryMember.findMany({
    include: {
      student: { select: { fullName: true, nisn: true } },
      staff: { select: { name: true, position: true } },
      loans: { where: { status: { in: ["ACTIVE", "OVERDUE"] } } },
    },
    orderBy: [{ type: "asc" }, { name: "asc" }],
    take: 500,
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Perpustakaan</p>
        <h1 className="text-2xl font-bold">Anggota</h1>
      </div>

      <SyncMembersButton />

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Kode</th>
              <th className="px-3 py-2">Nama</th>
              <th className="px-3 py-2">Tipe</th>
              <th className="px-3 py-2">Kontak</th>
              <th className="px-3 py-2 text-right">Pinjaman Aktif</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-t">
                <td className="px-3 py-2 font-mono text-xs">{member.member_code}</td>
                <td className="px-3 py-2">
                  <div className="font-medium">{member.name}</div>
                  <div className="text-xs text-slate-500">{member.student?.nisn ?? member.staff?.position ?? "-"}</div>
                </td>
                <td className="px-3 py-2">{member.type}</td>
                <td className="px-3 py-2">{member.email ?? member.phone ?? "-"}</td>
                <td className="px-3 py-2 text-right">{member.loans.length}</td>
                <td className="px-3 py-2">{member.status}</td>
              </tr>
            ))}
            {members.length === 0 && <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={6}>Belum ada anggota. Jalankan sinkron anggota.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
