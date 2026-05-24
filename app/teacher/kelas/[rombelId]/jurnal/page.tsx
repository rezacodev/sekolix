"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, FileText, History, Download } from "lucide-react";
import { toast } from "sonner";
import ExcelJS from "exceljs";
import Link from "next/link";
import { useBreadcrumb } from "../../../BreadcrumbContext";
import { InputJurnalTab } from "./InputJurnalTab";
import { RiwayatJurnalTab } from "./RiwayatJurnalTab";

interface JournalData {
  subject: {
    id: number;
    name: string;
  };
  rombel: {
    id: number;
    name: string;
    className: string;
    program: string;
  };
  journals: Journal[];
}

interface Journal {
  id: number;
  date: string;
  timeStart?: string;
  timeEnd?: string;
  period?: number;
  topic: string;
  teachingMethod?: string;
  mediaUsed?: string;
  obstacles?: string;
  followUp?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  date: string;
  timeStart: string;
  timeEnd: string;
  period: string;
  topic: string;
  teachingMethod: string;
  mediaUsed: string;
  obstacles: string;
  followUp: string;
  notes: string;
}

export default function JurnalKelasPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setBreadcrumbs } = useBreadcrumb();

  const rombelId = params?.rombelId as string;
  const subjectId = searchParams.get("subjectId");

  const [data, setData] = useState<JournalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("input");

  // Form state
  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split("T")[0],
    timeStart: "",
    timeEnd: "",
    period: "",
    topic: "",
    teachingMethod: "",
    mediaUsed: "",
    obstacles: "",
    followUp: "",
    notes: "",
  });

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!subjectId) {
      toast.error("Subject ID tidak ditemukan");
      router.push(`/teacher/kelas`);
      return;
    }

    setLoading(true);
    try {
      const url = `/api/teacher/kelas/${rombelId}/jurnal?subjectId=${subjectId}`;

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        console.error("Journal API error:", response.status, errorData);
        toast.error(errorData.error || "Failed to fetch journals");
        return;
      }

      const result = await response.json();
      setData(result);

      // Set breadcrumbs
      setBreadcrumbs([
        { label: "Kelas Saya", href: "/teacher/kelas" },
        { label: "Jurnal Kelas" },
      ]);
    } catch (error) {
      console.error("Error fetching journals:", error);
      toast.error("Failed to load journals");
    } finally {
      setLoading(false);
    }
  }, [rombelId, subjectId, setBreadcrumbs, router]);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle form submit (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.topic.trim()) {
      toast.error("Materi/topik harus diisi");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        date: formData.date,
        timeStart: formData.timeStart || undefined,
        timeEnd: formData.timeEnd || undefined,
        period: formData.period ? parseInt(formData.period) : undefined,
        topic: formData.topic,
        teachingMethod: formData.teachingMethod || undefined,
        mediaUsed: formData.mediaUsed || undefined,
        obstacles: formData.obstacles || undefined,
        followUp: formData.followUp || undefined,
        notes: formData.notes || undefined,
        subjectId: subjectId,
      };

      let response;
      if (editingId) {
        // Update
        response = await fetch(
          `/api/teacher/kelas/${rombelId}/jurnal?id=${editingId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
      } else {
        // Create
        response = await fetch(`/api/teacher/kelas/${rombelId}/jurnal`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save journal");
      }

      toast.success(
        editingId
          ? "Jurnal berhasil diperbarui"
          : "Jurnal berhasil disimpan"
      );

      // Reset form
      setFormData({
        date: new Date().toISOString().split("T")[0],
        timeStart: "",
        timeEnd: "",
        period: "",
        topic: "",
        teachingMethod: "",
        mediaUsed: "",
        obstacles: "",
        followUp: "",
        notes: "",
      });
      setEditingId(null);

      // Refresh list
      fetchData();

      // Switch to history tab
      setActiveTab("history");
    } catch (error) {
      console.error("Error saving journal:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save journal"
      );
    } finally {
      setSaving(false);
    }
  };

  // Handle edit
  const handleEdit = (journal: Journal) => {
    setFormData({
      date: journal.date,
      timeStart: journal.timeStart || "",
      timeEnd: journal.timeEnd || "",
      period: journal.period ? journal.period.toString() : "",
      topic: journal.topic,
      teachingMethod: journal.teachingMethod || "",
      mediaUsed: journal.mediaUsed || "",
      obstacles: journal.obstacles || "",
      followUp: journal.followUp || "",
      notes: journal.notes || "",
    });
    setEditingId(journal.id);
    setActiveTab("input");
  };

  // Handle delete
  const handleDelete = async (journalId: number) => {
    if (!confirm("Yakin ingin menghapus jurnal ini?")) return;

    try {
      const response = await fetch(
        `/api/teacher/kelas/${rombelId}/jurnal?id=${journalId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete journal");
      }

      toast.success("Jurnal berhasil dihapus");

      // Refresh list
      fetchData();
    } catch (error) {
      console.error("Error deleting journal:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete journal"
      );
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      timeStart: "",
      timeEnd: "",
      period: "",
      topic: "",
      teachingMethod: "",
      mediaUsed: "",
      obstacles: "",
      followUp: "",
      notes: "",
    });
    setEditingId(null);
  };

  // Export to Excel
  const exportToExcel = useCallback(async () => {
    if (!data || data.journals.length === 0) {
      toast.error("Tidak ada data untuk diekspor");
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Jurnal Mengajar");

      // Set column widths
      worksheet.columns = [
        { key: "no", width: 5 },
        { key: "date", width: 15 },
        { key: "time", width: 15 },
        { key: "period", width: 10 },
        { key: "topic", width: 40 },
        { key: "method", width: 25 },
        { key: "media", width: 25 },
        { key: "obstacles", width: 30 },
        { key: "followUp", width: 30 },
        { key: "notes", width: 30 },
      ];

      // Title - Row 1
      worksheet.mergeCells("A1:J1");
      const titleCell = worksheet.getCell("A1");
      titleCell.value = "JURNAL MENGAJAR";
      titleCell.font = { size: 16, bold: true };
      titleCell.alignment = { horizontal: "center", vertical: "middle" };

      // Info - Row 2 (Kelas dan Mata Pelajaran)
      worksheet.mergeCells("A2:J2");
      const infoCell = worksheet.getCell("A2");
      infoCell.value = `Kelas: ${data.rombel.className} ${data.rombel.name} | Mata Pelajaran: ${data.subject.name}`;
      infoCell.font = { size: 11 };
      infoCell.alignment = { horizontal: "center", vertical: "middle" };

      // Info - Row 3 (Total Entries)
      worksheet.mergeCells("A3:J3");
      const dateInfoCell = worksheet.getCell("A3");
      dateInfoCell.value = `Total Jurnal: ${data.journals.length} entri`;
      dateInfoCell.font = { size: 11 };
      dateInfoCell.alignment = { horizontal: "center", vertical: "middle" };

      // Empty row
      worksheet.addRow([]);

      // Header row - Row 5 (Blue background like absensi)
      const headerRow = worksheet.addRow([
        "No",
        "Tanggal",
        "Jam",
        "Jam Ke-",
        "Materi/Topik",
        "Metode",
        "Media",
        "Kendala",
        "Tindak Lanjut",
        "Catatan",
      ]);

      // Apply header styling only to data columns (1-10)
      for (let col = 1; col <= 10; col++) {
        const cell = headerRow.getCell(col);
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF4A90E2" },
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
      }

      // Data rows
      data.journals.forEach((journal, index) => {
        const row = worksheet.addRow([
          index + 1,
          new Date(journal.date).toLocaleDateString("id-ID"),
          journal.timeStart && journal.timeEnd
            ? `${journal.timeStart} - ${journal.timeEnd}`
            : "-",
          journal.period || "-",
          journal.topic,
          journal.teachingMethod || "-",
          journal.mediaUsed || "-",
          journal.obstacles || "-",
          journal.followUp || "-",
          journal.notes || "-",
        ]);

        // Apply styling only to data columns (1-10)
        for (let col = 1; col <= 10; col++) {
          const cell = row.getCell(col);
          
          // Alternate row colors
          if (index % 2 === 0) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFF5F5F5" },
            };
          }
          
          // Alignment
          if (col === 1 || col === 4) {
            // No and Period columns
            cell.alignment = { horizontal: "center", vertical: "top", wrapText: true };
          } else {
            cell.alignment = { vertical: "top", wrapText: true };
          }
        }
      });

      // Add borders to header and data cells only (row 5 is header, then data rows)
      const headerRowNum = 5;
      const endDataRow = 5 + data.journals.length;
      const numColumns = 10; // A-J columns
      
      // Apply borders to header and all data rows
      for (let row = headerRowNum; row <= endDataRow; row++) {
        for (let col = 1; col <= numColumns; col++) {
          const cell = worksheet.getCell(row, col);
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        }
      }

      // Generate file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Download file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const dateStr = new Date().toISOString().split("T")[0];
      a.download = `Jurnal_Mengajar_${data.rombel.className}_${data.subject.name}_${dateStr}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success("Jurnal berhasil diekspor");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Gagal mengekspor jurnal");
    }
  }, [data]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/teacher/kelas")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-lg font-medium text-red-600">Gagal memuat data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Jurnal Mengajar</h1>
          <p className="text-muted-foreground">
            {data.subject.name} - {data.rombel.name} ({data.rombel.className})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={exportToExcel}
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={!data || data.journals.length === 0}
          >
            <Download className="h-4 w-4" />
            Export Excel
          </Button>
          <Link href={`/teacher/kelas`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </Link>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList variant="underline" className="gap-4">
          <TabsTrigger value="input" variant="underline">
            <FileText className="h-4 w-4" />
            Input Jurnal
          </TabsTrigger>
          <TabsTrigger value="history" variant="underline">
            <History className="h-4 w-4" />
            Riwayat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="input">
          <InputJurnalTab
            formData={formData}
            setFormData={setFormData}
            editingId={editingId}
            saving={saving}
            handleSubmit={handleSubmit}
            handleCancelEdit={handleCancelEdit}
          />
        </TabsContent>

        <TabsContent value="history">
          <RiwayatJurnalTab
            journals={data.journals}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
