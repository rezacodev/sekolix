"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save, Mail, Bell, Send, Eye, EyeOff, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EmailConfig {
  is_enabled: boolean;
  smtp_host: string | null;
  smtp_port: number | null;
  smtp_user: string | null;
  smtp_pass: string | null;
  from_email: string | null;
  from_name: string | null;
}

interface InAppSetting {
  new_applicant: boolean;
  payment_received: boolean;
  grade_submitted: boolean;
  new_assignment: boolean;
  attendance_summary: boolean;
}

const IN_APP_LABELS: Record<keyof InAppSetting, string> = {
  new_applicant: "Pendaftar baru (PPDB)",
  payment_received: "Pembayaran diterima",
  grade_submitted: "Nilai diinput guru",
  new_assignment: "Tugas baru diterbitkan",
  attendance_summary: "Rekap kehadiran harian",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotifikasiPage() {
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    is_enabled: false,
    smtp_host: null,
    smtp_port: 587,
    smtp_user: null,
    smtp_pass: null,
    from_email: null,
    from_name: null,
  });
  const [inApp, setInApp] = useState<InAppSetting>({
    new_applicant: true,
    payment_received: true,
    grade_submitted: false,
    new_assignment: false,
    attendance_summary: false,
  });
  const [loading, setLoading] = useState(true);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingInApp, setSavingInApp] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [testSent, setTestSent] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/settings/notifikasi");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setEmailConfig(data.email);
      setInApp(data.inApp);
    } catch {
      toast.error("Gagal memuat pengaturan notifikasi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  // ── Email config handlers ─────────────────────────────────────────────────
  const setEmail = <K extends keyof EmailConfig>(key: K, value: EmailConfig[K]) => {
    setEmailConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveEmail = async () => {
    try {
      setSavingEmail(true);
      const res = await fetch("/api/admin/settings/notifikasi", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailConfig }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Gagal menyimpan konfigurasi email"); return; }
      toast.success("Konfigurasi email berhasil disimpan");
      setTestSent(false);
    } catch {
      toast.error("Gagal menyimpan konfigurasi email");
    } finally {
      setSavingEmail(false);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail) { toast.error("Masukkan alamat email tujuan"); return; }
    try {
      setSendingTest(true);
      const res = await fetch("/api/admin/settings/notifikasi/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testEmail }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Gagal mengirim email"); return; }
      toast.success("Email test berhasil dikirim!");
      setTestSent(true);
    } catch {
      toast.error("Gagal mengirim email test");
    } finally {
      setSendingTest(false);
    }
  };

  // ── In-app handlers ───────────────────────────────────────────────────────
  const toggleInApp = (key: keyof InAppSetting) => {
    setInApp(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveInApp = async () => {
    try {
      setSavingInApp(true);
      const res = await fetch("/api/admin/settings/notifikasi", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inApp }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Gagal menyimpan pengaturan notifikasi"); return; }
      toast.success("Pengaturan notifikasi berhasil disimpan");
    } catch {
      toast.error("Gagal menyimpan pengaturan notifikasi");
    } finally {
      setSavingInApp(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengaturan Notifikasi"
        description="Kelola konfigurasi SMTP email dan notifikasi dalam aplikasi"
      />

      {/* ── Email / SMTP ────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Konfigurasi Email SMTP
              </CardTitle>
              <CardDescription className="mt-1">
                Pengaturan server SMTP untuk pengiriman notifikasi melalui email.
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${emailConfig.is_enabled ? "bg-green-600" : "bg-muted-foreground/30"}`}
                  onClick={() => setEmail("is_enabled", !emailConfig.is_enabled)}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${emailConfig.is_enabled ? "translate-x-6" : "translate-x-1"}`}
                  />
                </div>
                <span className="text-sm font-medium">
                  {emailConfig.is_enabled ? (
                    <Badge className="bg-green-600">Aktif</Badge>
                  ) : (
                    <Badge variant="secondary">Nonaktif</Badge>
                  )}
                </span>
              </label>
              <Button size="sm" onClick={handleSaveEmail} disabled={savingEmail}>
                {savingEmail ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                Simpan
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">SMTP Host</label>
              <Input
                value={emailConfig.smtp_host ?? ""}
                onChange={e => setEmail("smtp_host", e.target.value || null)}
                placeholder="smtp.gmail.com"
                disabled={!emailConfig.is_enabled}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">SMTP Port</label>
              <Input
                type="number"
                value={emailConfig.smtp_port ?? 587}
                onChange={e => setEmail("smtp_port", parseInt(e.target.value) || 587)}
                placeholder="587"
                disabled={!emailConfig.is_enabled}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">SMTP User / Email</label>
              <Input
                value={emailConfig.smtp_user ?? ""}
                onChange={e => setEmail("smtp_user", e.target.value || null)}
                placeholder="your@email.com"
                disabled={!emailConfig.is_enabled}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">SMTP Password / App Password</label>
              <div className="relative">
                <Input
                  type={showPass ? "text" : "password"}
                  value={emailConfig.smtp_pass ?? ""}
                  onChange={e => setEmail("smtp_pass", e.target.value || null)}
                  placeholder="••••••••"
                  disabled={!emailConfig.is_enabled}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Nama Pengirim</label>
              <Input
                value={emailConfig.from_name ?? ""}
                onChange={e => setEmail("from_name", e.target.value || null)}
                placeholder="Sekolix"
                disabled={!emailConfig.is_enabled}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email Pengirim (From)</label>
              <Input
                value={emailConfig.from_email ?? ""}
                onChange={e => setEmail("from_email", e.target.value || null)}
                placeholder="noreply@sekolix.id"
                disabled={!emailConfig.is_enabled}
              />
            </div>
          </div>

          <Separator />

          {/* Test email */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Send className="h-4 w-4" />
              Kirim Email Test
            </h4>
            <p className="text-xs text-muted-foreground">
              Kirim email percobaan untuk memverifikasi konfigurasi SMTP di atas.
            </p>
            <div className="flex items-center gap-2">
              <Input
                value={testEmail}
                onChange={e => { setTestEmail(e.target.value); setTestSent(false); }}
                placeholder="tujuan@email.com"
                type="email"
                className="max-w-xs"
                disabled={!emailConfig.is_enabled}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleSendTest}
                disabled={sendingTest || !emailConfig.is_enabled || !testEmail}
              >
                {sendingTest
                  ? <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  : testSent
                    ? <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                    : <Send className="h-4 w-4 mr-1" />
                }
                {testSent ? "Terkirim" : "Kirim Test"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── In-App Notifications ────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifikasi Dalam Aplikasi
              </CardTitle>
              <CardDescription className="mt-1">
                Tentukan jenis event yang akan memunculkan notifikasi di dalam dashboard.
              </CardDescription>
            </div>
            <Button size="sm" onClick={handleSaveInApp} disabled={savingInApp}>
              {savingInApp ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
              Simpan
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-1">
            {(Object.keys(IN_APP_LABELS) as (keyof InAppSetting)[]).map((key, i) => (
              <div key={key}>
                {i > 0 && <Separator className="my-1" />}
                <div className="flex items-center justify-between py-3 px-1">
                  <div>
                    <p className="text-sm font-medium">{IN_APP_LABELS[key]}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleInApp(key)}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${inApp[key] ? "bg-primary" : "bg-muted-foreground/30"}`}
                    role="switch"
                    aria-checked={inApp[key]}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${inApp[key] ? "translate-x-6" : "translate-x-1"}`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
