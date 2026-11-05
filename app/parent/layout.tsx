import type { Metadata } from "next";
import Link from "next/link";
import { Bell, CalendarCheck, CreditCard, FileText, Home, MessageSquare, TrendingUp, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Portal Orang Tua | Sekolix",
  description: "Portal orang tua dan wali siswa Sekolix",
};

const navItems = [
  { href: "/parent", label: "Dashboard", icon: Home },
  { href: "/parent/tagihan", label: "Tagihan", icon: CreditCard },
  { href: "/parent/perkembangan", label: "Perkembangan", icon: TrendingUp },
  { href: "/parent/izin", label: "Izin", icon: CalendarCheck },
  { href: "/parent/pesan", label: "Pesan", icon: MessageSquare },
  { href: "/parent/pengumuman", label: "Pengumuman", icon: Bell },
];

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-white px-4 py-5 md:block">
        <Link href="/parent" className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold">Sekolix</p>
            <p className="text-xs text-slate-500">Portal Orang Tua</p>
          </div>
        </Link>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="md:pl-64">
        <header className="sticky top-0 z-10 border-b bg-white/90 px-4 py-3 backdrop-blur md:px-8">
          <div className="flex items-center justify-between">
            <Link href="/parent" className="flex items-center gap-2 text-sm font-semibold md:hidden">
              <FileText className="h-4 w-4" />
              Portal Orang Tua
            </Link>
            <nav className="flex gap-2 md:hidden">
              {navItems.slice(1).map((item) => (
                <Link key={item.href} href={item.href} className="rounded-md px-2 py-1 text-xs text-slate-600">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
