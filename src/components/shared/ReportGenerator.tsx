"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ReportOption {
  id: string;
  label: string;
  description?: string;
  exportUrl: string;
  /** Extra query params to append (e.g. { rombelId: "12" }) */
  params?: Record<string, string>;
  icon?: React.ReactNode;
  badge?: string;
}

interface ReportGeneratorProps {
  title?: string;
  reports: ReportOption[];
  className?: string;
  /** Triggered after a successful download */
  onDownloaded?: (reportId: string) => void;
}

async function downloadFile(url: string, filename?: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const blob = await res.blob();
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = filename ?? deriveFilename(url);
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(href);
}

function deriveFilename(url: string): string {
  try {
    const path = new URL(url, "http://x").pathname;
    const parts = path.split("/");
    return parts[parts.length - 1] || "export.xlsx";
  } catch {
    return "export.xlsx";
  }
}

function buildUrl(base: string, params?: Record<string, string>): string {
  if (!params || Object.keys(params).length === 0) return base;
  const qs = new URLSearchParams(params).toString();
  return base.includes("?") ? `${base}&${qs}` : `${base}?${qs}`;
}

export function ReportGenerator({ title = "Ekspor Laporan", reports, className, onDownloaded }: ReportGeneratorProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleDownload(report: ReportOption) {
    setDownloading(report.id);
    setErrors((e) => ({ ...e, [report.id]: "" }));
    try {
      await downloadFile(buildUrl(report.exportUrl, report.params));
      onDownloaded?.(report.id);
    } catch (err) {
      setErrors((e) => ({ ...e, [report.id]: err instanceof Error ? err.message : "Gagal mengunduh" }));
    } finally {
      setDownloading(null);
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {reports.map((report) => (
          <div key={report.id} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{report.label}</span>
                {report.badge && (
                  <Badge variant="secondary" className="text-xs">{report.badge}</Badge>
                )}
              </div>
              {report.description && (
                <p className="text-xs text-muted-foreground mt-0.5">{report.description}</p>
              )}
              {errors[report.id] && (
                <p className="text-xs text-destructive mt-0.5">{errors[report.id]}</p>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={downloading === report.id}
              onClick={() => handleDownload(report)}
              className="shrink-0"
            >
              {downloading === report.id ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span className="ml-1.5 hidden sm:inline">Unduh</span>
            </Button>
          </div>
        ))}
        {reports.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">Tidak ada laporan tersedia.</p>
        )}
      </CardContent>
    </Card>
  );
}

// ── Inline download button ──────────────────────────────────────────────────

interface DownloadButtonProps {
  url: string;
  filename?: string;
  label?: string;
  params?: Record<string, string>;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function DownloadButton({
  url,
  filename,
  label = "Unduh Excel",
  params,
  variant = "outline",
  size = "sm",
  className,
}: DownloadButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handle() {
    setLoading(true);
    setError("");
    try {
      await downloadFile(buildUrl(url, params), filename);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengunduh");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("inline-flex flex-col gap-1", className)}>
      <Button size={size} variant={variant} disabled={loading} onClick={handle}>
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        {size !== "icon" && <span className="ml-2">{label}</span>}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
