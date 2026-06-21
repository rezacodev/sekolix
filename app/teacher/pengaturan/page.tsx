"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Lock,
  Camera,
  Loader2,
  Save,
  Eye,
  EyeOff,
  GraduationCap,
  Phone,
  MapPin,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

interface StaffProfile {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  photo: string | null;
  bio: string | null;
  position: string | null;
  gtkPosition: string | null;
  jenisPTK: string | null;
  jabatanPTK: string | null;
  nip: string | null;
  niy: string | null;
  nuptk: string | null;
  placeOfBirth: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  religion: string | null;
  maritalStatus: string | null;
  academicDegree: string | null;
  educationHistory: unknown;
  educatorCertification: unknown;
}

export default function PengaturanPage() {
  const { data: session } = useSession();

  // ── Profil state ─────────────────────────────────────────────────────────
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    bio: "",
  });

  // ── Password state ────────────────────────────────────────────────────────
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ── Fetch profil ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      const res = await fetch("/api/teacher/pengaturan/profil");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProfile(data.staff);
      setForm({
        name: data.staff.name ?? "",
        phone: data.staff.phone ?? "",
        address: data.staff.address ?? "",
        city: data.staff.city ?? "",
        province: data.staff.province ?? "",
        bio: data.staff.bio ?? "",
      });
    } catch {
      toast.error("Gagal memuat profil");
    } finally {
      setLoadingProfile(false);
    }
  };

  // ── Photo handling ────────────────────────────────────────────────────────
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran foto maksimal 2MB");
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  // ── Save profil ───────────────────────────────────────────────────────────
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Nama tidak boleh kosong");
      return;
    }

    try {
      setSavingProfile(true);
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("phone", form.phone);
      fd.append("address", form.address);
      fd.append("city", form.city);
      fd.append("province", form.province);
      fd.append("bio", form.bio);
      if (photoFile) fd.append("photo", photoFile);

      const res = await fetch("/api/teacher/pengaturan/profil", { method: "PUT", body: fd });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Gagal menyimpan profil");
        return;
      }

      setProfile(prev => prev ? { ...prev, ...data.staff } : data.staff);
      setPhotoFile(null);
      toast.success("Profil berhasil diperbarui");
    } catch {
      toast.error("Gagal menyimpan profil");
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Save password ─────────────────────────────────────────────────────────
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Semua field wajib diisi");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password baru minimal 8 karakter");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password tidak cocok");
      return;
    }

    try {
      setSavingPassword(true);
      const res = await fetch("/api/teacher/pengaturan/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Gagal mengganti password");
        return;
      }

      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password berhasil diubah");
    } catch {
      toast.error("Gagal mengganti password");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const avatarSrc = photoPreview ?? profile?.photo ?? undefined;
  const initials = (profile?.name ?? session?.user?.name ?? "G")
    .split(" ")
    .map(w => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-muted-foreground">Kelola profil dan keamanan akun Anda</p>
      </div>

      <Tabs defaultValue="profil">
        <div className="border-b border-border">
          <TabsList className="h-auto bg-transparent p-0 rounded-none gap-0">
            <TabsTrigger
              value="profil"
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-none border-b-2 border-transparent bg-transparent shadow-none text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none hover:text-foreground"
            >
              <User className="h-4 w-4" />
              Profil
            </TabsTrigger>
            <TabsTrigger
              value="riwayat"
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-none border-b-2 border-transparent bg-transparent shadow-none text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none hover:text-foreground"
            >
              <GraduationCap className="h-4 w-4" />
              Riwayat &amp; Sertifikasi
            </TabsTrigger>
            <TabsTrigger
              value="password"
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-none border-b-2 border-transparent bg-transparent shadow-none text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none hover:text-foreground"
            >
              <Lock className="h-4 w-4" />
              Password
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ─── TAB: PROFIL ───────────────────────────────────────────────── */}
        <TabsContent value="profil" className="pt-6">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Foto & identitas singkat */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Foto Profil
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-6">
                <div className="relative group">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarSrc} alt={profile?.name} />
                    <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Camera className="h-6 w-6 text-white" />
                  </button>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-lg">{profile?.name}</p>
                  {profile?.jabatanPTK && (
                    <Badge variant="secondary">{profile.jabatanPTK}</Badge>
                  )}
                  {profile?.email && (
                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => photoInputRef.current?.click()}
                    className="mt-2"
                  >
                    Ganti Foto
                  </Button>
                  {photoFile && (
                    <p className="text-xs text-muted-foreground">{photoFile.name} siap diunggah</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Identitas diri */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informasi Dasar
                </CardTitle>
                <CardDescription>Data ini tampil di profil publik Anda</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Lengkap *</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="Nama lengkap"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={profile?.email ?? ""} disabled className="bg-muted" />
                    <p className="text-xs text-muted-foreground">Email dikelola oleh admin sekolah</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio / Deskripsi Singkat</Label>
                  <Textarea
                    id="bio"
                    value={form.bio}
                    onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                    placeholder="Tuliskan sedikit tentang diri Anda..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Kontak & Lokasi */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Kontak & Lokasi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">No. Telepon / HP</Label>
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="08xx-xxxx-xxxx"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Kota</Label>
                    <Input
                      id="city"
                      value={form.city}
                      onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                      placeholder="Nama kota"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="province">Provinsi</Label>
                    <Input
                      id="province"
                      value={form.province}
                      onChange={e => setForm(p => ({ ...p, province: e.target.value }))}
                      placeholder="Nama provinsi"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Alamat Lengkap
                  </Label>
                  <Textarea
                    id="address"
                    value={form.address}
                    onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                    placeholder="Jl. ..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={savingProfile} className="gap-2">
                {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Simpan Profil
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* ─── TAB: RIWAYAT & SERTIFIKASI ────────────────────────────────── */}
        <TabsContent value="riwayat" className="pt-6">
          <div className="space-y-6">
            {/* Info kepegawaian (read-only) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Data Kepegawaian
                </CardTitle>
                <CardDescription>Data ini dikelola oleh admin sekolah</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "NIP", value: profile?.nip },
                    { label: "NIY", value: profile?.niy },
                    { label: "NUPTK", value: profile?.nuptk },
                    { label: "Jabatan PTK", value: profile?.jabatanPTK },
                    { label: "Jenis PTK", value: profile?.jenisPTK },
                    { label: "Posisi", value: profile?.gtkPosition },
                    { label: "Gelar Akademik", value: profile?.academicDegree },
                  ].map(item => (
                    <div key={item.label} className="space-y-1">
                      <Label className="text-xs text-muted-foreground">{item.label}</Label>
                      <p className="text-sm font-medium">{item.value ?? <span className="text-muted-foreground italic">—</span>}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Riwayat Pendidikan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Riwayat Pendidikan
                </CardTitle>
                <CardDescription>Data dikelola oleh admin. Hubungi admin untuk memperbarui.</CardDescription>
              </CardHeader>
              <CardContent>
                {Array.isArray(profile?.educationHistory) && profile.educationHistory.length > 0 ? (
                  <div className="space-y-3">
                    {(profile.educationHistory as Array<{ level?: string; major?: string; institution?: string; year?: number }>).map((edu, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                        <GraduationCap className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium">{edu.level ?? "—"} — {edu.major ?? "—"}</p>
                          {edu.institution && <p className="text-sm text-muted-foreground">{edu.institution}</p>}
                          {edu.year && <p className="text-xs text-muted-foreground">Lulus {edu.year}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Belum ada data riwayat pendidikan</p>
                )}
              </CardContent>
            </Card>

            {/* Sertifikasi */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  Sertifikasi & Kompetensi
                </CardTitle>
                <CardDescription>Data dikelola oleh admin. Hubungi admin untuk memperbarui.</CardDescription>
              </CardHeader>
              <CardContent>
                {profile?.educatorCertification ? (
                  <div className="p-3 rounded-lg border bg-muted/30">
                    <pre className="text-sm whitespace-pre-wrap font-sans">
                      {typeof profile.educatorCertification === "string"
                        ? profile.educatorCertification
                        : JSON.stringify(profile.educatorCertification, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Belum ada data sertifikasi</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── TAB: PASSWORD ──────────────────────────────────────────────── */}
        <TabsContent value="password" className="pt-6">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Ganti Password
              </CardTitle>
              <CardDescription>
                Gunakan password yang kuat dan unik untuk melindungi akun Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSavePassword} className="space-y-4">
                {/* Password lama */}
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Password Saat Ini</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrent ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                      placeholder="Masukkan password saat ini"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Separator />

                {/* Password baru */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Password Baru</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNew ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                      placeholder="Minimal 8 karakter"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordForm.newPassword.length > 0 && passwordForm.newPassword.length < 8 && (
                    <p className="text-xs text-destructive">Password minimal 8 karakter</p>
                  )}
                </div>

                {/* Konfirmasi */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                      placeholder="Ulangi password baru"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordForm.confirmPassword.length > 0 &&
                    passwordForm.newPassword !== passwordForm.confirmPassword && (
                      <p className="text-xs text-destructive">Password tidak cocok</p>
                    )}
                </div>

                <Button type="submit" disabled={savingPassword} className="w-full gap-2">
                  {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                  Ubah Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
