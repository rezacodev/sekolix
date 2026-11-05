import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireParentContext, serializeParentStudent } from "@/lib/parent/server";
import { ParentMessageForm } from "../_components/ParentActionForms";

export default async function ParentMessagesPage() {
  const context = await requireParentContext();
  if (!context) redirect("/login");

  const childrenOptions = context.profile.students.map(serializeParentStudent);
  const messages = await db.parentTeacherMessage.findMany({
    where: { parent_id: context.profile.id },
    include: {
      student: { select: { fullName: true } },
      teacher: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">Konsultasi</p>
        <h1 className="text-2xl font-bold">Pesan Orang Tua ke Guru</h1>
      </div>

      <ParentMessageForm childrenOptions={childrenOptions} />

      <section className="rounded-lg border bg-white p-4">
        <h2 className="mb-3 text-base font-semibold">Riwayat pesan</h2>
        <div className="space-y-2">
          {messages.map((message) => (
            <div key={message.id} className="rounded-lg border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{message.subject}</p>
                  <p className="text-xs text-slate-500">
                    {message.student.fullName} - {message.teacher?.name ?? "Wali kelas/guru terkait"} - {message.createdAt.toLocaleDateString("id-ID")}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium">{message.status}</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{message.content}</p>
              {message.response && (
                <div className="mt-3 rounded-md bg-emerald-50 p-3 text-sm text-emerald-900">
                  <p className="font-semibold">Balasan</p>
                  <p>{message.response}</p>
                </div>
              )}
            </div>
          ))}
          {messages.length === 0 && <p className="text-sm text-slate-500">Belum ada pesan.</p>}
        </div>
      </section>
    </div>
  );
}
