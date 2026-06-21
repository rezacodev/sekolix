"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { toast } from "sonner";
import {
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  Loader2,
  Webhook,
  Send,
  RefreshCw,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiKeyItem {
  id: string;
  name: string;
  key_prefix: string;
  is_active: boolean;
  last_used_at: string | null;
  expires_at: string | null;
  created_by: string | null;
  created_at: string;
}

interface WebhookConfigItem {
  id: string;
  event: string;
  label: string;
  url: string | null;
  is_active: boolean;
  secret: string | null;
  last_triggered_at: string | null;
  last_status: number | null;
}

// ─── API Keys Tab ─────────────────────────────────────────────────────────────

function ApiKeysTab() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createExpiry, setCreateExpiry] = useState("");
  const [creating, setCreating] = useState(false);
  const [newRawKey, setNewRawKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [revokeTarget, setRevokeTarget] = useState<ApiKeyItem | null>(null);
  const [revoking, setRevoking] = useState(false);

  const fetchKeys = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/settings/api-keys");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setKeys(data.keys);
    } catch {
      toast.error("Gagal memuat API key");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const handleCreate = async () => {
    if (!createName.trim()) {
      toast.error("Nama API key wajib diisi");
      return;
    }
    try {
      setCreating(true);
      const res = await fetch("/api/admin/settings/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: createName.trim(), expiresAt: createExpiry || undefined }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const data = await res.json();
      setNewRawKey(data.rawKey);
      setCreateName("");
      setCreateExpiry("");
      fetchKeys();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal membuat API key");
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = () => {
    if (!newRawKey) return;
    navigator.clipboard.writeText(newRawKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggle = async (key: ApiKeyItem) => {
    try {
      const res = await fetch("/api/admin/settings/api-keys", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: key.id, action: "toggle" }),
      });
      if (!res.ok) throw new Error();
      fetchKeys();
    } catch {
      toast.error("Gagal mengubah status API key");
    }
  };

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    try {
      setRevoking(true);
      const res = await fetch("/api/admin/settings/api-keys", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: revokeTarget.id, action: "revoke" }),
      });
      if (!res.ok) throw new Error();
      toast.success("API key berhasil direvoke");
      setRevokeTarget(null);
      fetchKeys();
    } catch {
      toast.error("Gagal merevoke API key");
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">API Key</h3>
          <p className="text-sm text-muted-foreground">
            Generate dan kelola API key untuk integrasi sistem eksternal
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Buat API Key
        </Button>
      </div>

      {/* Raw key banner — shown after creation */}
      {newRawKey && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-amber-800">Simpan API key ini sekarang!</p>
              <p className="text-sm text-amber-700">
                API key hanya ditampilkan sekali. Setelah menutup pesan ini, key tidak dapat dilihat lagi.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white rounded border px-3 py-2">
            <code className="flex-1 text-sm font-mono break-all">{newRawKey}</code>
            <Button variant="ghost" size="icon" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={() => setNewRawKey(null)}>
            Saya sudah menyimpan key ini
          </Button>
        </div>
      )}

      {/* Key list */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : keys.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Key className="h-10 w-10 mb-3 opacity-30" />
            <p>Belum ada API key</p>
            <p className="text-xs mt-1">Buat API key untuk mengintegrasikan sistem eksternal</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {keys.map((key) => (
            <Card key={key.id} className={!key.is_active ? "opacity-60" : ""}>
              <CardContent className="flex items-center gap-4 py-4">
                <Key className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{key.name}</span>
                    <Badge variant={key.is_active ? "default" : "secondary"}>
                      {key.is_active ? "Aktif" : "Nonaktif"}
                    </Badge>
                    {key.expires_at && new Date(key.expires_at) < new Date() && (
                      <Badge variant="destructive">Kedaluwarsa</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1 flex-wrap">
                    <code className="text-xs text-muted-foreground">{key.key_prefix}••••••••••••••••</code>
                    <span className="text-xs text-muted-foreground">
                      Dibuat {formatDistanceToNow(new Date(key.created_at), { addSuffix: true, locale: localeId })}
                    </span>
                    {key.last_used_at && (
                      <span className="text-xs text-muted-foreground">
                        Terakhir digunakan {formatDistanceToNow(new Date(key.last_used_at), { addSuffix: true, locale: localeId })}
                      </span>
                    )}
                    {key.expires_at && (
                      <span className="text-xs text-muted-foreground">
                        Kedaluwarsa {new Date(key.expires_at).toLocaleDateString("id-ID")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Switch checked={key.is_active} onCheckedChange={() => handleToggle(key)} />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setRevokeTarget(key)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={(o) => { setCreateOpen(o); if (!o) { setCreateName(""); setCreateExpiry(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buat API Key Baru</DialogTitle>
            <DialogDescription>
              API key digunakan untuk autentikasi sistem eksternal
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nama / Label <span className="text-destructive">*</span></Label>
              <Input
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="Contoh: Integrasi DAPODIK, Sistem Keuangan..."
              />
            </div>
            <div className="space-y-2">
              <Label>Kedaluwarsa (opsional)</Label>
              <Input
                type="date"
                value={createExpiry}
                onChange={(e) => setCreateExpiry(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
              />
              <p className="text-xs text-muted-foreground">Kosongkan untuk tidak pernah kedaluwarsa</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>Batal</Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Key className="h-4 w-4 mr-2" />}
              Generate Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Confirm */}
      <AlertDialog open={!!revokeTarget} onOpenChange={(o) => !o && setRevokeTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              API key <strong>{revokeTarget?.name}</strong> akan dihapus permanen dan tidak dapat digunakan lagi.
              Integrasi yang menggunakan key ini akan langsung gagal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revoking}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevoke}
              disabled={revoking}
              className="bg-destructive hover:bg-destructive/90"
            >
              {revoking ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Webhooks Tab ─────────────────────────────────────────────────────────────

function WebhooksTab() {
  const [configs, setConfigs] = useState<WebhookConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [testing, setTesting] = useState<Record<string, boolean>>({});
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});
  const [localEdits, setLocalEdits] = useState<Record<string, { url: string; secret: string }>>({});

  const fetchConfigs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/settings/webhooks");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setConfigs(data.configs);
      const edits: Record<string, { url: string; secret: string }> = {};
      for (const c of data.configs) {
        edits[c.event] = { url: c.url ?? "", secret: c.secret ?? "" };
      }
      setLocalEdits(edits);
    } catch {
      toast.error("Gagal memuat konfigurasi webhook");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchConfigs(); }, [fetchConfigs]);

  const handleSave = async (config: WebhookConfigItem) => {
    const edit = localEdits[config.event] ?? { url: "", secret: "" };
    try {
      setSaving((p) => ({ ...p, [config.event]: true }));
      const res = await fetch("/api/admin/settings/webhooks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: config.event,
          url: edit.url,
          secret: edit.secret,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Webhook disimpan");
      fetchConfigs();
    } catch {
      toast.error("Gagal menyimpan webhook");
    } finally {
      setSaving((p) => ({ ...p, [config.event]: false }));
    }
  };

  const handleToggle = async (config: WebhookConfigItem, value: boolean) => {
    try {
      const res = await fetch("/api/admin/settings/webhooks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: config.event, is_active: value }),
      });
      if (!res.ok) throw new Error();
      fetchConfigs();
    } catch {
      toast.error("Gagal mengubah status webhook");
    }
  };

  const handleTest = async (config: WebhookConfigItem) => {
    try {
      setTesting((p) => ({ ...p, [config.event]: true }));
      const res = await fetch("/api/admin/settings/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: config.event }),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success(`Test berhasil — HTTP ${data.status}`);
      } else {
        toast.warning(data.error || `Test gagal — HTTP ${data.status}`);
      }
      fetchConfigs();
    } catch {
      toast.error("Gagal mengirim test webhook");
    } finally {
      setTesting((p) => ({ ...p, [config.event]: false }));
    }
  };

  const statusColor = (status: number | null) => {
    if (!status) return "text-muted-foreground";
    if (status >= 200 && status < 300) return "text-green-600";
    if (status >= 400) return "text-destructive";
    return "text-amber-600";
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold">Konfigurasi Webhook</h3>
        <p className="text-sm text-muted-foreground">
          Kirim notifikasi HTTP POST ke endpoint eksternal saat event tertentu terjadi
        </p>
      </div>

      <div className="space-y-4">
        {configs.map((config) => {
          const edit = localEdits[config.event] ?? { url: config.url ?? "", secret: config.secret ?? "" };
          const isDirty = edit.url !== (config.url ?? "") || edit.secret !== (config.secret ?? "");

          return (
            <Card key={config.event}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{config.label}</CardTitle>
                    <CardDescription className="font-mono text-xs">{config.event}</CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    {config.last_status && (
                      <span className={`text-xs font-mono ${statusColor(config.last_status)}`}>
                        HTTP {config.last_status}
                      </span>
                    )}
                    <Switch
                      checked={config.is_active}
                      onCheckedChange={(v) => handleToggle(config, v)}
                      disabled={!config.url}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">URL Endpoint</Label>
                  <Input
                    value={edit.url}
                    onChange={(e) =>
                      setLocalEdits((p) => ({
                        ...p,
                        [config.event]: { ...edit, url: e.target.value },
                      }))
                    }
                    placeholder="https://yourapp.com/webhook/event"
                    className="font-mono text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Secret (opsional — untuk HMAC signature)</Label>
                  <div className="relative">
                    <Input
                      type={showSecret[config.event] ? "text" : "password"}
                      value={edit.secret}
                      onChange={(e) =>
                        setLocalEdits((p) => ({
                          ...p,
                          [config.event]: { ...edit, secret: e.target.value },
                        }))
                      }
                      placeholder="Webhook secret"
                      className="font-mono text-sm pr-10"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => setShowSecret((p) => ({ ...p, [config.event]: !p[config.event] }))}
                    >
                      {showSecret[config.event] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </div>
                {config.last_triggered_at && (
                  <p className="text-xs text-muted-foreground">
                    Terakhir dikirim:{" "}
                    {formatDistanceToNow(new Date(config.last_triggered_at), {
                      addSuffix: true,
                      locale: localeId,
                    })}
                  </p>
                )}
                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    onClick={() => handleSave(config)}
                    disabled={saving[config.event] || !isDirty}
                    variant={isDirty ? "default" : "outline"}
                  >
                    {saving[config.event] ? (
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    Simpan
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTest(config)}
                    disabled={testing[config.event] || !config.url}
                  >
                    {testing[config.event] ? (
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    Test Kirim
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function IntegrasiApiPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integrasi &amp; API</h1>
        <p className="text-muted-foreground">
          Kelola API key dan konfigurasi webhook untuk integrasi sistem eksternal
        </p>
      </div>

      <Tabs defaultValue="api-keys">
        <div className="border-b border-border">
          <TabsList className="h-auto bg-transparent p-0 rounded-none gap-0">
            <TabsTrigger value="api-keys" className="flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-none border-b-2 border-transparent bg-transparent shadow-none text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none hover:text-foreground">
              <Key className="h-4 w-4" />
              API Key
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-none border-b-2 border-transparent bg-transparent shadow-none text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none hover:text-foreground">
              <Webhook className="h-4 w-4" />
              Webhook
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="api-keys" className="mt-6">
          <ApiKeysTab />
        </TabsContent>

        <TabsContent value="webhooks" className="mt-6">
          <WebhooksTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
