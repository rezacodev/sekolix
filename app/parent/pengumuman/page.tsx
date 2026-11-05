import Link from "next/link";
import { redirect } from "next/navigation";
import { Bell } from "lucide-react";
import { db } from "@/lib/db";
import { requireParentContext } from "@/lib/parent/server";

export default async function ParentAnnouncementsPage() {
  const context = await requireParentContext();
  if (!context) redirect("/login");

  const [notifications, news] = await Promise.all([
    db.parentNotification.findMany({
      where: { parent_id: context.profile.id },
      include: { student: { select: { fullName: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.news.findMany({
      where: { isPublished: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 20,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">Informasi</p>
        <h1 className="text-2xl font-bold">Pengumuman & Notifikasi</h1>
      </div>

      <section className="rounded-lg border bg-white p-4">
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
          <Bell className="h-4 w-4" />
          Notifikasi pribadi
        </h2>
        <div className="space-y-2">
          {notifications.map((item) => (
            <Link
              key={item.id}
              href={item.href ?? "/parent/pengumuman"}
              className="block rounded-lg border p-3 hover:bg-slate-50"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{item.title}</p>
                {!item.read_at && <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">Baru</span>}
              </div>
              <p className="text-sm text-slate-600">{item.message}</p>
              <p className="mt-1 text-xs text-slate-500">
                {item.student?.fullName ?? "Sekolah"} - {item.createdAt.toLocaleDateString("id-ID")}
              </p>
            </Link>
          ))}
          {notifications.length === 0 && <p className="text-sm text-slate-500">Belum ada notifikasi pribadi.</p>}
        </div>
      </section>

      <section className="rounded-lg border bg-white p-4">
        <h2 className="mb-3 text-base font-semibold">Pengumuman sekolah</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {news.map((item) => (
            <Link key={item.id} href={`/informasi/${item.slug}`} className="rounded-lg border p-3 hover:bg-slate-50">
              <p className="font-medium">{item.title}</p>
              <p className="mt-1 text-sm text-slate-600">{item.excerpt ?? item.category ?? "Pengumuman sekolah"}</p>
              <p className="mt-2 text-xs text-slate-500">{(item.publishedAt ?? item.createdAt).toLocaleDateString("id-ID")}</p>
            </Link>
          ))}
          {news.length === 0 && <p className="text-sm text-slate-500">Belum ada pengumuman sekolah.</p>}
        </div>
      </section>
    </div>
  );
}
