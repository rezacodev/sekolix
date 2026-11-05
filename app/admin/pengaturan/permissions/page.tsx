"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Plus, Trash2, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useBreadcrumb } from "@/hooks/useBreadcrumb";

type AccessRole = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  is_system: boolean;
  permissions: AccessPermission[];
};

type AccessPermission = {
  id: string;
  subject: string;
  action: string;
  inverted: boolean;
};

type PermissionSubject = {
  slug: string;
  label: string;
  group: string;
  sensitive?: boolean;
};

const ACTION_LABELS: Record<string, string> = {
  manage: "Kelola",
  read: "Lihat",
  create: "Tambah",
  update: "Edit",
  delete: "Hapus",
  export: "Export",
  approve: "Setujui",
};

function groupSubjects(subjects: PermissionSubject[]) {
  return subjects.reduce<Record<string, PermissionSubject[]>>((acc, subject) => {
    if (!acc[subject.group]) acc[subject.group] = [];
    acc[subject.group].push(subject);
    return acc;
  }, {});
}

export default function PermissionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const breadcrumbContext = useBreadcrumb();
  const [roles, setRoles] = useState<AccessRole[]>([]);
  const [subjects, setSubjects] = useState<PermissionSubject[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newAction, setNewAction] = useState("read");
  const [newInverted, setNewInverted] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (session?.user?.role !== "SUPERADMIN") router.replace("/unauthorized");
  }, [status, session, router]);

  useEffect(() => {
    breadcrumbContext?.setBreadcrumbs?.([
      { label: "Pengaturan", href: "/admin/pengaturan" },
      { label: "Izin Akses Role", href: "/admin/pengaturan/permissions" },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPermissions = useCallback(async (roleId?: string) => {
    setLoading(true);
    try {
      const params = roleId ? `?roleId=${roleId}` : "";
      const res = await fetch(`/api/admin/settings/permissions${params}`);
      if (!res.ok) throw new Error("Gagal memuat permission matrix");
      const data = await res.json();
      setRoles(data.accessRoles ?? []);
      setSubjects(data.subjects ?? []);
      setActions(data.actions ?? []);
      setSelectedRoleId(data.selectedAccessRole?.id ?? data.accessRoles?.[0]?.id ?? "");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memuat izin akses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? null;
  const subjectGroups = useMemo(() => groupSubjects(subjects), [subjects]);

  async function handleAddPermission() {
    if (!selectedRoleId || !newSubject || !newAction) {
      toast.error("Pilih role, fitur, dan aksi terlebih dahulu");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roleId: selectedRoleId,
          subject: newSubject,
          action: newAction,
          inverted: newInverted,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Gagal menyimpan izin");
      }
      toast.success("Izin role berhasil disimpan");
      setNewSubject("");
      setNewAction("read");
      setNewInverted(false);
      await fetchPermissions(selectedRoleId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan izin");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(permissionId: string) {
    try {
      const res = await fetch("/api/admin/settings/permissions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: permissionId, type: "access" }),
      });
      if (!res.ok) throw new Error("Gagal menghapus izin");
      toast.success("Izin role dihapus");
      await fetchPermissions(selectedRoleId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menghapus izin");
    }
  }

  if (status === "loading" || session?.user?.role !== "SUPERADMIN") return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Izin Akses Role</h1>
          <p className="text-muted-foreground">
            Kelola role operasional dinamis seperti Bendahara, BK, Pustakawan, Sarpras, TU, dan Kepala Sekolah.
          </p>
        </div>
        <Button variant="outline" onClick={() => fetchPermissions(selectedRoleId)} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
          <span className="ml-2">Refresh</span>
        </Button>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
        <CardContent className="pt-4 flex gap-3">
          <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
          <p className="text-sm text-blue-900 dark:text-blue-200">
            `UserRole` tetap menjadi role portal utama. Role di halaman ini adalah role operasional yang bisa diberikan ke user tanpa migration enum baru.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Role Operasional</CardTitle>
            <CardDescription>{roles.length} role aktif tersedia</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => {
                    setSelectedRoleId(role.id);
                    fetchPermissions(role.id);
                  }}
                  className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                    selectedRoleId === role.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm">{role.name}</span>
                    {role.is_system && <Badge variant="outline">System</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{role.slug}</p>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tambah Izin</CardTitle>
              <CardDescription>
                {selectedRole ? `Role: ${selectedRole.name}` : "Pilih role terlebih dahulu"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-64 flex-1">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Fitur</label>
                  <Select value={newSubject} onValueChange={setNewSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih fitur" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(subjectGroups).map(([group, items]) => (
                        <div key={group}>
                          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                            {group}
                          </div>
                          {items.map((subject) => (
                            <SelectItem key={subject.slug} value={subject.slug}>
                              {subject.label}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-40">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Aksi</label>
                  <Select value={newAction} onValueChange={setNewAction}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {actions.map((action) => (
                        <SelectItem key={action} value={action}>
                          {ACTION_LABELS[action] ?? action}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2 pb-2">
                  <Switch checked={newInverted} onCheckedChange={setNewInverted} id="inverted" />
                  <label htmlFor="inverted" className="text-sm">
                    {newInverted ? "Tolak" : "Izinkan"}
                  </label>
                </div>

                <Button onClick={handleAddPermission} disabled={saving || !selectedRoleId}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  <span className="ml-2">Simpan</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Permission Matrix</CardTitle>
              <CardDescription>
                {selectedRole?.permissions.length ?? 0} izin terpasang untuk {selectedRole?.name ?? "-"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedRole ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Pilih role untuk melihat izin.</p>
              ) : selectedRole.permissions.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Belum ada izin pada role ini.</p>
              ) : (
                <div className="space-y-2">
                  {selectedRole.permissions.map((permission) => {
                    const subject = subjects.find((item) => item.slug === permission.subject);
                    return (
                      <div
                        key={permission.id}
                        className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 ${
                          permission.inverted ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"
                        }`}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className={permission.inverted ? "text-red-700" : "text-green-700"}>
                            {permission.inverted ? "cannot" : "can"}
                          </Badge>
                          <span className="text-sm font-medium">{ACTION_LABELS[permission.action] ?? permission.action}</span>
                          <span className="text-sm text-muted-foreground">{subject?.label ?? permission.subject}</span>
                          {subject?.sensitive && <Badge variant="destructive">Sensitif</Badge>}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(permission.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
