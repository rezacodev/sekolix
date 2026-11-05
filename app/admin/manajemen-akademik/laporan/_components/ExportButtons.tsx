"use client";

import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ExportButtonsProps {
  excelUrl: string;
  pdfUrl: string;
  excelLabel?: string;
  pdfLabel?: string;
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
    return parts[parts.length - 1] || "export";
  } catch {
    return "export";
  }
}

export function ExportButtons({ excelUrl, pdfUrl, excelLabel = "Excel", pdfLabel = "PDF" }: ExportButtonsProps) {
  const [loading, setLoading] = useState<"excel" | "pdf" | null>(null);

  async function handleDownload(url: string, type: "excel" | "pdf") {
    setLoading(type);
    try {
      await downloadFile(url);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={loading !== null}
        onClick={() => handleDownload(excelUrl, "excel")}
      >
        {loading === "excel" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="h-4 w-4" />
        )}
        <span className="ml-1.5">{excelLabel}</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={loading !== null}
        onClick={() => handleDownload(pdfUrl, "pdf")}
      >
        {loading === "pdf" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
        <span className="ml-1.5">{pdfLabel}</span>
      </Button>
    </div>
  );
}
