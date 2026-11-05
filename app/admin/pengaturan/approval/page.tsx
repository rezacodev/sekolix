"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, RotateCcw, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useBreadcrumb } from "@/hooks/useBreadcrumb";

type ApprovalRequest = {
  id: string;
  module: string;
  action: string;
  title: string;
  description?: string | null;
  status: string;
  requested_by_name?: string | null;
  created_at: string;
};

export default function ApprovalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const breadcrumbContext = useBreadcrumb();
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    module: "pengaturan.permissions",
    action: "update",
    title: "",
    description: "",
  });

  useEffect(() => {
    if (status === "loading") return;
    if (!["SUPERADMIN", "ADMIN"].includes(session?.user?.role ?? "")) router.replace("/unauthorized");
  }, [status, session, router]);

  useEffect(() => {
    breadcrumbContext?.setBreadcrumbs?.([
      { label: "Pengaturan", href: "/admin/pengaturan" },
      { label: "Approval Workflow", href: "/admin/pengaturan/approval" },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/settings/approval?take=50");
    const data = await res.json();
    setRequests(data.requests ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  async function createRequest() {
    if (!form.title.trim()) {
      toast.error("Judul approval wajib diisi");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings/approval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Gagal membuat approval request");
      toast.success("Approval request dibuat");
      setForm({ module: "pengaturan.permissions", action: "update", title: "", description: "" });
      await fetchRequests();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal membuat approval");
    } finally {
      setSaving(false);
    }
  }

  async function decide(id: string, decision: "APPROVED" | "REJECTED") {
    const res = await fetch("/api/admin/settings/approval", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, decision }),
    });
    if (!res.ok) {
      toast.error("Gagal memproses approval");
      return;
    }
    toast.success(decision === "APPROVED" ? "Approval disetujui" : "Approval ditolak");
    await fetchRequests();
  }

  if (status === "loading" || !["SUPERADMIN", "ADMIN"].includes(session?.user?.role ?? "")) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Approval Workflow</h1>
          <p className="text-muted-foreground">Workflow dasar untuk perubahan data atau aksi sensitif.</p>
        </div>
        <Button variant="outline" onClick={fetchRequests} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
          <span className="ml-2">Refresh</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Buat Approval Request</CardTitle>
          <CardDescription>Form sederhana untuk menguji fondasi approval Sprint 0.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <Input
            value={form.module}
            onChange={(event) => setForm((prev) => ({ ...prev, module: event.target.value }))}
            placeholder="Modul"
          />
          <Input
            value={form.action}
            onChange={(event) => setForm((prev) => ({ ...prev, action: event.target.value }))}
            placeholder="Aksi"
          />
          <Input
            className="md:col-span-2"
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            placeholder="Judul approval"
          />
          <Textarea
            className="md:col-span-2"
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            placeholder="Deskripsi"
          />
          <div className="md:col-span-2">
            <Button onClick={createRequest} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Buat Request
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daftar Approval</CardTitle>
          <CardDescription>{requests.length} request terbaru</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : requests.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Belum ada approval request.</p>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <div key={request.id} className="rounded-lg border px-3 py-3">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={request.status === "PENDING" ? "outline" : "default"}>{request.status}</Badge>
                        <span className="font-medium">{request.title}</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {request.module} • {request.action} • {request.requested_by_name ?? "System"}
                      </p>
                      {request.description && <p className="mt-1 text-sm">{request.description}</p>}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(request.created_at).toLocaleString("id-ID")}
                      </p>
                    </div>
                    {request.status === "PENDING" && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => decide(request.id, "APPROVED")}>
                          <CheckCircle2 className="mr-1 h-4 w-4" />
                          Setujui
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => decide(request.id, "REJECTED")}>
                          <XCircle className="mr-1 h-4 w-4" />
                          Tolak
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
