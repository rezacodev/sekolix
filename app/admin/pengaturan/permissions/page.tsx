"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, ShieldCheck, Plus, Trash2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useBreadcrumb } from "@/hooks/useBreadcrumb";

// ─── Types ───────────────────────────────────────────────────────────────────

type AppAction = "manage" | "read" | "create" | "update" | "delete";
type UserRole = "SUPERADMIN" | "ADMIN" | "GURU" | "STAFF" | "MURID" | "ORANGTUA";

interface PermOverride {
  id: string;
  role: UserRole;
  subject: string;
  action: AppAction;
  inverted: boolean;
}

const CONFIGURABLE_ROLES: UserRole[] = ["STAFF", "GURU", "MURID", "ORANGTUA"];

const ACTIONS: AppAction[] = ["manage", "read", "create", "update", "delete"];

const SUBJECTS: { slug: string; label: string; group: string }[] = [
  { slug: "dashboard", label: "Dashboard", group: "Umum" },
  { slug: "penerimaan-siswa", label: "Penerimaan Siswa", group: "Umum" },
  { slug: "landing-website", label: "Landing Website", group: "Umum" },
  { slug: "akademik.tahun-ajaran", label: "Tahun Ajaran", group: "Akademik" },
  { slug: "akademik.rombel", label: "Rombel", group: "Akademik" },
  { slug: "akademik.mata-pelajaran", label: "Mata Pelajaran", group: "Akademik" },
  { slug: "akademik.jadwal", label: "Jadwal", group: "Akademik" },
  { slug: "akademik.nilai", label: "Nilai & Rapor", group: "Akademik" },
  { slug: "akademik.absensi", label: "Absensi", group: "Akademik" },
  { slug: "akademik.pengaturan", label: "Pengaturan Akademik", group: "Akademik" },
  { slug: "pengaturan.identitas", label: "Identitas Sekolah", group: "Pengaturan" },
  { slug: "pengaturan.notifikasi", label: "Notifikasi", group: "Pengaturan" },
  { slug: "pengaturan.pengguna", label: "Manajemen Pengguna", group: "Pengaturan" },
  { slug: "pengaturan.system", label: "Sistem (API, Backup)", group: "Pengaturan" },
  { slug: "teacher.portal", label: "Portal Guru", group: "Teacher" },
  { slug: "teacher.kelas", label: "Kelas", group: "Teacher" },
  { slug: "teacher.tugas", label: "Tugas", group: "Teacher" },
  { slug: "teacher.absensi", label: "Absensi (Guru)", group: "Teacher" },
  { slug: "teacher.nilai", label: "Nilai (Guru)", group: "Teacher" },
  { slug: "student.portal", label: "Portal Siswa", group: "Portal" },
  { slug: "parent.portal", label: "Portal Orangtua", group: "Portal" },
];

const ROLE_LABELS: Record<UserRole, { label: string; color: string }> = {
  SUPERADMIN: { label: "Superadmin", color: "bg-purple-100 text-purple-800 border-purple-200" },
  ADMIN: { label: "Admin", color: "bg-red-100 text-red-800 border-red-200" },
  GURU: { label: "Guru", color: "bg-blue-100 text-blue-800 border-blue-200" },
  STAFF: { label: "Staf", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  MURID: { label: "Murid", color: "bg-green-100 text-green-800 border-green-200" },
  ORANGTUA: { label: "Orangtua", color: "bg-orange-100 text-orange-800 border-orange-200" },
};

const ACTION_LABELS: Record<AppAction, string> = {
  manage: "Kelola (semua)",
  read: "Lihat",
  create: "Tambah",
  update: "Edit",
  delete: "Hapus",
};

function groupBy<T>(arr: T[], fn: (item: T) => string): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const key = fn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PermissionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const breadcrumbContext = useBreadcrumb();

  // Guard: superadmin only
  useEffect(() => {
    if (status === "loading") return;
    if (session?.user?.role !== "SUPERADMIN") {
      router.replace("/unauthorized");
    }
  }, [status, session, router]);

  useEffect(() => {
    breadcrumbContext?.setBreadcrumbs?.([
      { label: "Pengaturan", href: "/admin/pengaturan" },
      { label: "Izin Akses Role", href: "/admin/pengaturan/permissions" },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [selectedRole, setSelectedRole] = useState<UserRole>("STAFF");
  const [overrides, setOverrides] = useState<PermOverride[]>([]);
  const [loading, setLoading] = useState(false);

  // New override form
  const [newSubject, setNewSubject] = useState("");
  const [newAction, setNewAction] = useState<AppAction>("read");
  const [newInverted, setNewInverted] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchOverrides = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/settings/permissions?role=${selectedRole}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOverrides(data.overrides);
    } catch {
      toast.error("Gagal memuat konfigurasi izin");
    } finally {
      setLoading(false);
    }
  }, [selectedRole]);

  useEffect(() => {
    fetchOverrides();
  }, [fetchOverrides]);

  async function handleAdd() {
    if (!newSubject) return toast.error("Pilih fitur terlebih dahulu");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole, subject: newSubject, action: newAction, inverted: newInverted }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Gagal menyimpan");
      }
      toast.success("Izin berhasil ditambahkan");
      setNewSubject("");
      setNewAction("read");
      setNewInverted(false);
      fetchOverrides();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch("/api/admin/settings/permissions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      toast.success("Izin dihapus");
      fetchOverrides();
    } catch {
      toast.error("Gagal menghapus izin");
    }
  }

  const subjectGroups = groupBy(SUBJECTS, (s) => s.group);

  if (status === "loading" || session?.user?.role !== "SUPERADMIN") {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Izin Akses Role</h1>
        <p className="text-muted-foreground">Konfigurasi izin fitur per role secara fleksibel</p>
      </div>

      {/* Role overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
          <Card
            key={role}
            className={`cursor-pointer transition-all ${selectedRole === role ? "ring-2 ring-primary" : "hover:shadow-md"}`}
            onClick={() => setSelectedRole(role)}
          >
            <CardContent className="pt-4 pb-3 text-center">
              <Badge variant="outline" className={`${ROLE_LABELS[role].color} text-xs`}>
                {ROLE_LABELS[role].label}
              </Badge>
              {role === "SUPERADMIN" && (
                <p className="text-[10px] text-muted-foreground mt-1">Semua akses</p>
              )}
              {role === "ADMIN" && (
                <p className="text-[10px] text-muted-foreground mt-1">Kecuali sistem</p>
              )}
              {CONFIGURABLE_ROLES.includes(role) && (
                <p className="text-[10px] text-muted-foreground mt-1">Dapat dikonfigurasi</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info banner for fixed roles */}
      {(selectedRole === "SUPERADMIN" || selectedRole === "ADMIN") && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
          <CardContent className="pt-4 pb-3 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                {selectedRole === "SUPERADMIN"
                  ? "Superadmin memiliki akses penuh ke semua fitur dan tidak dapat diubah."
                  : "Admin memiliki akses penuh kecuali pengaturan sistem (integrasi API, backup). Override tidak disarankan untuk role ini."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Override management for configurable roles */}
      {CONFIGURABLE_ROLES.includes(selectedRole) && (
        <>
          {/* Add override */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Tambah Override Izin</CardTitle>
              <CardDescription>
                Override izin akan ditambahkan di atas izin default role{" "}
                <Badge variant="outline" className={`${ROLE_LABELS[selectedRole].color} text-xs`}>
                  {ROLE_LABELS[selectedRole].label}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-48">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Fitur</label>
                  <Select value={newSubject} onValueChange={setNewSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih fitur..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(subjectGroups).map(([group, items]) => (
                        <div key={group}>
                          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {group}
                          </div>
                          {items.map((s) => (
                            <SelectItem key={s.slug} value={s.slug}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-40">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Aksi</label>
                  <Select value={newAction} onValueChange={(v) => setNewAction(v as AppAction)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIONS.map((a) => (
                        <SelectItem key={a} value={a}>{ACTION_LABELS[a]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2 mb-0.5">
                  <Switch
                    checked={newInverted}
                    onCheckedChange={setNewInverted}
                    id="inverted-toggle"
                  />
                  <label htmlFor="inverted-toggle" className="text-sm cursor-pointer">
                    {newInverted ? "Tolak (cannot)" : "Izinkan (can)"}
                  </label>
                </div>

                <Button onClick={handleAdd} disabled={saving || !newSubject}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  <span className="ml-1">Tambah</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Current overrides list */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Override Saat Ini</CardTitle>
                <CardDescription>
                  {overrides.length === 0
                    ? "Menggunakan izin default role"
                    : `${overrides.length} override aktif`}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchOverrides} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : overrides.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Tidak ada override — izin mengikuti default role.
                </p>
              ) : (
                <div className="space-y-2">
                  {overrides.map((o) => {
                    const subjectInfo = SUBJECTS.find((s) => s.slug === o.subject);
                    return (
                      <div
                        key={o.id}
                        className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg border ${
                          o.inverted
                            ? "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800"
                            : "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800"
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className={
                              o.inverted
                                ? "bg-red-100 text-red-700 border-red-200"
                                : "bg-green-100 text-green-700 border-green-200"
                            }
                          >
                            {o.inverted ? "cannot" : "can"}
                          </Badge>
                          <span className="text-sm font-medium">{ACTION_LABELS[o.action]}</span>
                          <span className="text-sm text-muted-foreground">
                            {subjectInfo?.label ?? o.subject}
                          </span>
                          <span className="text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                            {subjectInfo?.group ?? "—"}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(o.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Default permissions reference */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Referensi Izin Default</CardTitle>
          <CardDescription>Izin bawaan sebelum override diterapkan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
              <div key={role} className="flex items-start gap-3">
                <Badge variant="outline" className={`${ROLE_LABELS[role].color} text-xs shrink-0 mt-0.5`}>
                  {ROLE_LABELS[role].label}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {role === "SUPERADMIN" && "Akses penuh ke semua fitur (manage all)"}
                  {role === "ADMIN" && "Akses penuh ke semua fitur, kecuali pengaturan.system"}
                  {role === "STAFF" && "Read-only: dashboard, penerimaan siswa, akademik, jadwal, absensi, nilai"}
                  {role === "GURU" && "Kelola semua fitur teacher portal (kelas, tugas, absensi, nilai) + read dashboard"}
                  {role === "MURID" && "Akses read ke student.portal"}
                  {role === "ORANGTUA" && "Akses read ke parent.portal"}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
