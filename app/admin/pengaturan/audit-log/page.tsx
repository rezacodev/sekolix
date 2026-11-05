"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Activity, Database, Loader2, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBreadcrumb } from "@/hooks/useBreadcrumb";

type ActivityLog = {
  id: string;
  actor_name?: string | null;
  module: string;
  action: string;
  entity_type?: string | null;
  entity_id?: string | null;
  created_at: string;
};

type AuditTrail = {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  reason?: string | null;
  created_at: string;
};

const MODULES = [
  { value: "all", label: "Semua modul" },
  { value: "pengaturan.permissions", label: "Permission" },
  { value: "pengaturan.approval", label: "Approval" },
  { value: "keuangan", label: "Keuangan" },
  { value: "bk", label: "BK" },
  { value: "pegawai", label: "Pegawai" },
];

export default function AuditLogPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const breadcrumbContext = useBreadcrumb();
  const [tab, setTab] = useState("activity");
  const [module, setModule] = useState("all");
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [auditTrails, setAuditTrails] = useState<AuditTrail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!["SUPERADMIN", "ADMIN"].includes(session?.user?.role ?? "")) router.replace("/unauthorized");
  }, [status, session, router]);

  useEffect(() => {
    breadcrumbContext?.setBreadcrumbs?.([
      { label: "Pengaturan", href: "/admin/pengaturan" },
      { label: "Audit Log", href: "/admin/pengaturan/audit-log" },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const query = new URLSearchParams({ type: tab, take: "50" });
    if (module !== "all") query.set("module", module);
    const res = await fetch(`/api/admin/settings/audit-log?${query.toString()}`);
    const data = await res.json();
    setActivityLogs(data.activityLogs ?? []);
    setAuditTrails(data.auditTrails ?? []);
    setLoading(false);
  }, [tab, module]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  if (status === "loading" || !["SUPERADMIN", "ADMIN"].includes(session?.user?.role ?? "")) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Log</h1>
          <p className="text-muted-foreground">Pantau aktivitas sistem dan perubahan data sensitif.</p>
        </div>
        <Button variant="outline" onClick={fetchLogs} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
          <span className="ml-2">Refresh</span>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filter</CardTitle>
          <CardDescription>Audit log Sprint 0 membaca 50 data terbaru.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full max-w-xs">
            <Select value={module} onValueChange={setModule}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODULES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="activity">
            <Activity className="mr-2 h-4 w-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="audit">
            <Database className="mr-2 h-4 w-4" />
            Audit Trail
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : activityLogs.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">Belum ada activity log.</p>
              ) : (
                <div className="space-y-2">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="rounded-lg border px-3 py-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge>{log.action}</Badge>
                        <span className="font-medium text-sm">{log.module}</span>
                        <span className="text-sm text-muted-foreground">{log.entity_type ?? "-"}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {log.actor_name ?? "System"} • {new Date(log.created_at).toLocaleString("id-ID")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : auditTrails.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">Belum ada audit trail.</p>
              ) : (
                <div className="space-y-2">
                  {auditTrails.map((trail) => (
                    <div key={trail.id} className="rounded-lg border px-3 py-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{trail.action}</Badge>
                        <span className="font-medium text-sm">{trail.entity_type}</span>
                        <span className="text-sm text-muted-foreground">{trail.entity_id}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {trail.reason ?? "Tanpa catatan"} • {new Date(trail.created_at).toLocaleString("id-ID")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
