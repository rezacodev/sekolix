"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  Search,
  MoreHorizontal,
  Shield,
  Edit2,
  Trash2,
  KeyRound,
  Users,
  ShieldCheck,
  Eye,
  EyeOff,
  UserX,
  GraduationCap,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";

// ─── Types ────────────────────────────────────────────────────────────────────

type UserRole = "SUPERADMIN" | "ADMIN" | "GURU" | "STAFF" | "MURID" | "ORANGTUA" | "EDITOR" | "USER";

interface StaffInfo {
  id: string;
  name: string;
  role: string;
  position: string | null;
}

interface UserRow {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  staff: StaffInfo | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<UserRole, { label: string; color: string; description: string }> = {
  SUPERADMIN: {
    label: "Superadmin",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    description: "Akses penuh termasuk konfigurasi sistem",
  },
  ADMIN: {
    label: "Admin",
    color: "bg-red-100 text-red-700 border-red-200",
    description: "Akses penuh ke semua fitur, kecuali pengaturan sistem",
  },
  GURU: {
    label: "Guru",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    description: "Akses portal guru: kelas, tugas, absensi, dan nilai",
  },
  STAFF: {
    label: "Staf",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    description: "Akses terbatas pada bagian tertentu admin (dikonfigurasi)",
  },
  MURID: {
    label: "Murid",
    color: "bg-green-100 text-green-700 border-green-200",
    description: "Akses portal siswa (untuk pengembangan fitur berikutnya)",
  },
  ORANGTUA: {
    label: "Orangtua",
    color: "bg-orange-100 text-orange-700 border-orange-200",
    description: "Akses portal orangtua (untuk pengembangan fitur berikutnya)",
  },
  EDITOR: {
    label: "Editor (Legacy)",
    color: "bg-gray-100 text-gray-700 border-gray-200",
    description: "Role lama — gunakan ADMIN atau STAFF",
  },
  USER: {
    label: "User (Legacy)",
    color: "bg-gray-100 text-gray-700 border-gray-200",
    description: "Role lama — gunakan GURU",
  },
};

function getInitials(name: string | null, email: string | null): string {
  const source = name?.trim() || email?.trim() || "?";
  return source
    .split(/[\s@.]+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function AvatarInitials({ name, email }: { name: string | null; email: string | null }) {
  const initials = getInitials(name, email);
  return (
    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0">
      {initials}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PenggunaPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", email: "", password: "", role: "GURU" as UserRole });
  const [showCreatePw, setShowCreatePw] = useState(false);
  const [creating, setCreating] = useState(false);

  // Edit dialog
  const [editTarget, setEditTarget] = useState<UserRow | null>(null);
  const [editForm, setEditForm] = useState({ name: "", role: "GURU" as UserRole, isActive: true });
  const [saving, setSaving] = useState(false);

  // Reset password dialog
  const [resetTarget, setResetTarget] = useState<UserRow | null>(null);
  const [resetPw, setResetPw] = useState("");
  const [showResetPw, setShowResetPw] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/pengguna");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsers(data);
    } catch {
      toast.error("Gagal memuat daftar pengguna");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── Derived ───────────────────────────────────────────────────────────────

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.staff?.name.toLowerCase().includes(q);
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const stats = {
    total: users.length,
    adminLevel: users.filter((u) => ["SUPERADMIN", "ADMIN"].includes(u.role)).length,
    guru: users.filter((u) => u.role === "GURU").length,
    staff: users.filter((u) => u.role === "STAFF").length,
    inactive: users.filter((u) => !u.isActive).length,
  };

  // ── Create ────────────────────────────────────────────────────────────────

  const handleCreate = async () => {
    if (!createForm.email.trim() || !createForm.password || !createForm.role) {
      toast.error("Email, password, dan role wajib diisi");
      return;
    }
    if (createForm.password.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }
    try {
      setCreating(true);
      const res = await fetch("/api/admin/pengguna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Gagal membuat pengguna"); return; }
      toast.success("Pengguna berhasil dibuat");
      setCreateOpen(false);
      setCreateForm({ name: "", email: "", password: "", role: "GURU" });
      fetchUsers();
    } catch {
      toast.error("Gagal membuat pengguna");
    } finally {
      setCreating(false);
    }
  };

  // ── Edit ──────────────────────────────────────────────────────────────────

  const openEdit = (user: UserRow) => {
    setEditTarget(user);
    setEditForm({ name: user.name ?? "", role: user.role, isActive: user.isActive });
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    try {
      setSaving(true);
      const res = await fetch("/api/admin/pengguna", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editTarget.id, ...editForm }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Gagal menyimpan perubahan"); return; }
      toast.success("Pengguna berhasil diperbarui");
      setEditTarget(null);
      fetchUsers();
    } catch {
      toast.error("Gagal menyimpan perubahan");
    } finally {
      setSaving(false);
    }
  };

  // ── Reset Password ────────────────────────────────────────────────────────

  const handleResetPassword = async () => {
    if (!resetTarget || !resetPw) return;
    if (resetPw.length < 6) { toast.error("Password minimal 6 karakter"); return; }
    try {
      setResetting(true);
      const res = await fetch("/api/admin/pengguna", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: resetTarget.id, newPassword: resetPw }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Gagal reset password"); return; }
      toast.success("Password berhasil direset");
      setResetTarget(null);
      setResetPw("");
    } catch {
      toast.error("Gagal reset password");
    } finally {
      setResetting(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const res = await fetch("/api/admin/pengguna", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteTarget.id }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Gagal menghapus pengguna"); return; }
      toast.success("Pengguna berhasil dihapus");
      setDeleteTarget(null);
      fetchUsers();
    } catch {
      toast.error("Gagal menghapus pengguna");
    } finally {
      setDeleting(false);
    }
  };

  // ── Toggle Active ─────────────────────────────────────────────────────────

  const handleToggleActive = async (user: UserRow) => {
    try {
      const res = await fetch("/api/admin/pengguna", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, isActive: !user.isActive }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Gagal mengubah status"); return; }
      toast.success(user.isActive ? "Pengguna dinonaktifkan" : "Pengguna diaktifkan");
      fetchUsers();
    } catch {
      toast.error("Gagal mengubah status");
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Pengguna</h1>
          <p className="text-muted-foreground">
            Kelola akun pengguna yang dapat mengakses sistem Sekolix
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Pengguna
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Pengguna</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-950">
                <ShieldCheck className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.adminLevel}</p>
                <p className="text-xs text-muted-foreground">Superadmin & Admin</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950">
                <GraduationCap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.guru}</p>
                <p className="text-xs text-muted-foreground">Guru</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <UserX className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inactive}</p>
                <p className="text-xs text-muted-foreground">Tidak Aktif</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role info legend */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="text-xs font-medium text-muted-foreground mb-2">Keterangan Role</p>
        <div className="flex flex-wrap gap-4">
          {(Object.entries(ROLE_CONFIG) as [UserRole, typeof ROLE_CONFIG[UserRole]][]).map(([role, cfg]) => (
            <div key={role} className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded border ${cfg.color}`}>
                <Shield className="h-3 w-3" />
                {cfg.label}
              </span>
              <span className="text-xs text-muted-foreground">{cfg.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Semua Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Role</SelectItem>
            <SelectItem value="SUPERADMIN">Superadmin</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="GURU">Guru</SelectItem>
            <SelectItem value="STAFF">Staf</SelectItem>
            <SelectItem value="MURID">Murid</SelectItem>
            <SelectItem value="ORANGTUA">Orangtua</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          {loading ? "" : `${filtered.length} pengguna`}
        </p>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 pl-4">No</TableHead>
                <TableHead>Pengguna</TableHead>
                <TableHead className="w-32">Role</TableHead>
                <TableHead className="w-28">Status</TableHead>
                <TableHead>Akun GTK</TableHead>
                <TableHead className="w-36">Bergabung</TableHead>
                <TableHead className="w-14" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16 text-muted-foreground">
                    <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p>Tidak ada pengguna ditemukan</p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((user, idx) => {
                  const roleCfg = ROLE_CONFIG[user.role];
                  return (
                    <TableRow key={user.id} className={!user.isActive ? "opacity-60" : ""}>
                      <TableCell className="pl-4 text-muted-foreground text-sm">{idx + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <AvatarInitials name={user.name} email={user.email} />
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">
                              {user.name || <span className="italic text-muted-foreground">Tanpa nama</span>}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded border ${roleCfg.color}`}>
                          <Shield className="h-3 w-3" />
                          {roleCfg.label}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.isActive ? "default" : "secondary"}
                          className={user.isActive ? "bg-green-600 hover:bg-green-600" : ""}
                        >
                          {user.isActive ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.staff ? (
                          <div className="flex items-center gap-1.5">
                            <GraduationCap className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-medium truncate">{user.staff.name}</p>
                              <p className="text-xs text-muted-foreground capitalize">
                                {user.staff.role.toLowerCase()}
                                {user.staff.position ? ` · ${user.staff.position}` : ""}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(user.createdAt), {
                            addSuffix: true,
                            locale: localeId,
                          })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(user)}>
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit Pengguna
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setResetTarget(user); setResetPw(""); setShowResetPw(false); }}>
                              <KeyRound className="h-4 w-4 mr-2" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleToggleActive(user)}>
                              {user.isActive ? (
                                <><UserX className="h-4 w-4 mr-2" />Nonaktifkan</>
                              ) : (
                                <><Users className="h-4 w-4 mr-2" />Aktifkan</>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteTarget(user)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Hapus Pengguna
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── Create Dialog ────────────────────────────────────────────────────── */}
      <Dialog open={createOpen} onOpenChange={(o) => { setCreateOpen(o); if (!o) setCreateForm({ name: "", email: "", password: "", role: "GURU" }); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Pengguna Baru</DialogTitle>
            <DialogDescription>
              Buat akun login untuk admin, guru, staf, murid, atau orangtua
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Nama Lengkap</Label>
              <Input
                value={createForm.name}
                onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Nama lengkap (opsional)"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email <span className="text-destructive">*</span></Label>
              <Input
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="email@sekolah.sch.id"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Password <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Input
                  type={showCreatePw ? "text" : "password"}
                  value={createForm.password}
                  onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="Minimal 6 karakter"
                  className="pr-10"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowCreatePw((v) => !v)}
                >
                  {showCreatePw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Role <span className="text-destructive">*</span></Label>
              <Select
                value={createForm.role}
                onValueChange={(v) => setCreateForm((p) => ({ ...p, role: v as UserRole }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(ROLE_CONFIG) as [UserRole, typeof ROLE_CONFIG[UserRole]][]).map(([role, cfg]) => (
                    <SelectItem key={role} value={role}>
                      <div>
                        <span className="font-medium">{cfg.label}</span>
                        <span className="text-xs text-muted-foreground block">{cfg.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>Batal</Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Buat Pengguna
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ──────────────────────────────────────────────────────── */}
      <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Pengguna</DialogTitle>
            <DialogDescription>
              {editTarget?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Nama Lengkap</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Nama lengkap"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select
                value={editForm.role}
                onValueChange={(v) => setEditForm((p) => ({ ...p, role: v as UserRole }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(ROLE_CONFIG) as [UserRole, typeof ROLE_CONFIG[UserRole]][]).map(([role, cfg]) => (
                    <SelectItem key={role} value={role}>
                      <div>
                        <span className="font-medium">{cfg.label}</span>
                        <span className="text-xs text-muted-foreground block">{cfg.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Status Aktif</p>
                <p className="text-xs text-muted-foreground">
                  Pengguna nonaktif tidak dapat login
                </p>
              </div>
              <Switch
                checked={editForm.isActive}
                onCheckedChange={(v) => setEditForm((p) => ({ ...p, isActive: v }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)} disabled={saving}>Batal</Button>
            <Button onClick={handleEdit} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Reset Password Dialog ─────────────────────────────────────────────── */}
      <Dialog open={!!resetTarget} onOpenChange={(o) => { if (!o) { setResetTarget(null); setResetPw(""); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Pengguna: <strong>{resetTarget?.name || resetTarget?.email}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Password Baru <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Input
                  type={showResetPw ? "text" : "password"}
                  value={resetPw}
                  onChange={(e) => setResetPw(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="pr-10"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowResetPw((v) => !v)}
                >
                  {showResetPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Pengguna perlu diberitahu password baru ini secara manual.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetTarget(null)} disabled={resetting}>Batal</Button>
            <Button onClick={handleResetPassword} disabled={resetting || resetPw.length < 6}>
              {resetting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ───────────────────────────────────────────────────── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pengguna?</AlertDialogTitle>
            <AlertDialogDescription>
              Akun <strong>{deleteTarget?.name || deleteTarget?.email}</strong> akan dihapus permanen.
              {deleteTarget?.staff && (
                <span className="block mt-1 text-amber-600">
                  Perhatian: pengguna ini terhubung ke data GTK <strong>{deleteTarget.staff.name}</strong>.
                  Data GTK tidak akan ikut terhapus.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
