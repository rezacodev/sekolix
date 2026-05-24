"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useBreadcrumb } from "../../../BreadcrumbContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar as CalendarIcon, TrendingUp, FileText, Download } from "lucide-react";
import { toast } from "sonner";
import ExcelJS from "exceljs";
import Link from "next/link";
import { InputAbsensiTab } from "./InputAbsensiTab";
import { RiwayatAbsensiTab } from "./RiwayatAbsensiTab";
import { StatistikAbsensiTab } from "./StatistikAbsensiTab";

type AttendanceStatus = "HADIR" | "SAKIT" | "IZIN" | "ALPHA";

interface Student {
  id: string;
  fullName: string;
  nisn: string | null;
  gender: string | null;
}

interface AttendanceRecord {
  id: number;
  studentId: string;
  studentName: string;
  date: string;
  meetingNumber: number;
  status: "HADIR" | "SAKIT" | "IZIN" | "ALPHA";
  notes: string | null;
}

interface AttendanceData {
  subject: { id: number; name: string };
  rombel: { id: number; name: string; className: string; program: string };
  students: Student[];
  attendances: AttendanceRecord[];
  totalMeetings: number;
}

interface StudentStats {
  studentId: string;
  studentName: string;
  nisn: string | null;
  hadir: number;
  sakit: number;
  izin: number;
  alpha: number;
  totalRecorded: number;
  totalMeetings: number;
  attendancePercentage: number;
}

interface StatisticsData {
  subject: { id: number; name: string };
  rombel: { id: number; name: string };
  totalMeetings: number;
  totalStudents: number;
  classStats: {
    hadir: number;
    sakit: number;
    izin: number;
    alpha: number;
    attendancePercentage: number;
  };
  studentStats: StudentStats[];
}

export default function AbsensiPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectId = searchParams.get("subjectId");
  const rombelId = params.rombelId as string;
  const breadcrumbContext = useBreadcrumb();
  const { setBreadcrumbs } = breadcrumbContext || {};

  const [data, setData] = useState<AttendanceData | null>(null);
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<
    Record<string, { status: AttendanceStatus; notes: string }>
  >({});

  const fetchData = useCallback(async () => {
    if (!subjectId) {
      toast.error("Subject ID tidak ditemukan");
      router.push(`/teacher/kelas`);
      return;
    }

    try {
      setLoading(true);
      const url = `/api/teacher/kelas/${rombelId}/absensi?subjectId=${subjectId}`;
      
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("Attendance API error:", response.status, errorData);
        throw new Error(`Failed to fetch attendance data: ${response.status}`);
      }

      const result = await response.json();
      setData(result);

      if (setBreadcrumbs) {
        setBreadcrumbs([
          { label: "Kelas Saya", href: "/teacher/kelas" },
          { label: "Absensi" },
        ]);
      }

      const initial: Record<string, { status: AttendanceStatus; notes: string }> = {};
      result.students.forEach((student: Student) => {
        initial[student.id] = { status: "HADIR", notes: "" };
      });
      setAttendanceRecords(initial);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Gagal memuat data absensi");
    } finally {
      setLoading(false);
    }
  }, [rombelId, subjectId, router, setBreadcrumbs]);

  const fetchStatistics = useCallback(async () => {
    if (!subjectId) return;

    try {
      const url = `/api/teacher/kelas/${rombelId}/absensi/statistik?subjectId=${subjectId}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("Statistics API error:", response.status, errorData);
        throw new Error(`Failed to fetch statistics: ${response.status}`);
      }
      
      const result = await response.json();
      setStatistics(result);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      toast.error("Gagal memuat statistik absensi");
    }
  }, [rombelId, subjectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  const loadAttendance = useCallback(
    async (date: string) => {
      if (!data || !subjectId) return;

      const existing = data.attendances.find((att) => att.date === date);
      const meetingNum = existing?.meetingNumber;

      if (!meetingNum) {
        toast.info("Belum ada data absensi untuk tanggal ini");
        return;
      }

      try {
        const response = await fetch(
          `/api/teacher/kelas/${rombelId}/absensi?subjectId=${subjectId}&date=${date}&meetingNumber=${meetingNum}`
        );
        if (!response.ok) throw new Error("Failed to load attendance");

        const result = await response.json();

        if (result.attendances && result.attendances.length > 0) {
          const loaded: Record<string, { status: AttendanceStatus; notes: string }> = {};
          result.attendances.forEach((att: AttendanceRecord) => {
            loaded[att.studentId] = { status: att.status, notes: att.notes || "" };
          });
          result.students.forEach((student: Student) => {
            if (!loaded[student.id]) {
              loaded[student.id] = { status: "HADIR", notes: "" };
            }
          });
          setAttendanceRecords(loaded);
          setIsSaved(true);
          setHasChanges(false);
          toast.success("Data absensi dimuat");
        }
      } catch (error) {
        console.error("Error loading attendance:", error);
        toast.error("Gagal memuat data absensi");
      }
    },
    [data, rombelId, subjectId]
  );

  const handleSave = useCallback(async () => {
    if (!data || !selectedDate || !subjectId) return;

    if (!hasChanges && isSaved) {
      toast.info("Tidak ada perubahan untuk disimpan");
      return;
    }

    const existing = data.attendances.find((att) => att.date === selectedDate);
    let meetingNumber: number;

    if (existing) {
      meetingNumber = existing.meetingNumber;
    } else {
      const uniqueDates = new Set(data.attendances.map((att) => att.date));
      meetingNumber = uniqueDates.size + 1;
    }

    const attendanceData = data.students.map((student) => ({
      studentId: student.id,
      status: attendanceRecords[student.id]?.status || "HADIR",
      notes: attendanceRecords[student.id]?.notes || "",
    }));

    try {
      setSaving(true);
      const response = await fetch(`/api/teacher/kelas/${rombelId}/absensi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: subjectId.toString(),
          date: selectedDate,
          meetingNumber,
          records: attendanceData,
        }),
      });

      if (!response.ok) throw new Error("Failed to save attendance");

      setIsSaved(true);
      setHasChanges(false);
      toast.success("Absensi berhasil disimpan");
      await fetchData();
      await fetchStatistics();
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast.error("Gagal menyimpan absensi");
    } finally {
      setSaving(false);
    }
  }, [data, selectedDate, subjectId, hasChanges, isSaved, attendanceRecords, rombelId, fetchData, fetchStatistics]);

  const exportToExcel = useCallback(async () => {
    if (!data || !statistics) {
      toast.error("Tidak ada data untuk diexport");
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Rekap Absensi");

      worksheet.columns = [
        { key: "no", width: 5 },
        { key: "nama", width: 30 },
        { key: "nisn", width: 15 },
        { key: "hadir", width: 10 },
        { key: "sakit", width: 10 },
        { key: "izin", width: 10 },
        { key: "alpha", width: 10 },
        { key: "persentase", width: 12 },
      ];

      worksheet.mergeCells("A1:H1");
      const titleCell = worksheet.getCell("A1");
      titleCell.value = "REKAP ABSENSI";
      titleCell.font = { size: 16, bold: true };
      titleCell.alignment = { horizontal: "center", vertical: "middle" };

      worksheet.mergeCells("A2:H2");
      const infoCell = worksheet.getCell("A2");
      infoCell.value = `Kelas: ${data.rombel.className} ${data.rombel.name} | Mata Pelajaran: ${data.subject.name}`;
      infoCell.alignment = { horizontal: "center" };

      worksheet.mergeCells("A3:H3");
      const dateCell = worksheet.getCell("A3");
      dateCell.value = `Tanggal Export: ${new Date().toLocaleDateString("id-ID")} | Total Pertemuan: ${data.totalMeetings}`;
      dateCell.alignment = { horizontal: "center" };

      worksheet.addRow([]);

      worksheet.mergeCells("A5:H5");
      const statsTitleCell = worksheet.getCell("A5");
      statsTitleCell.value = "STATISTIK KELAS";
      statsTitleCell.font = { bold: true, size: 12 };
      statsTitleCell.alignment = { horizontal: "center" };
      statsTitleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E0E0" },
      };

      const statsRow = worksheet.addRow([
        "",
        `Hadir: ${statistics.classStats.hadir}`,
        `Sakit: ${statistics.classStats.sakit}`,
        `Izin: ${statistics.classStats.izin}`,
        `Alpha: ${statistics.classStats.alpha}`,
        "",
        "",
        `Kehadiran: ${statistics.classStats.attendancePercentage}%`,
      ]);
      statsRow.font = { bold: true };

      worksheet.addRow([]);

      const headerRow = worksheet.addRow(["No", "Nama Siswa", "NISN", "Hadir", "Sakit", "Izin", "Alpha", "% Hadir"]);
      
      // Apply header styling only to data columns (1-8)
      for (let col = 1; col <= 8; col++) {
        const cell = headerRow.getCell(col);
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4A90E2" } };
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.alignment = { horizontal: "center", vertical: "middle" };
      }

      statistics.studentStats.forEach((stat, index) => {
        const row = worksheet.addRow([
          index + 1,
          stat.studentName,
          stat.nisn || "-",
          stat.hadir,
          stat.sakit,
          stat.izin,
          stat.alpha,
          `${stat.attendancePercentage}%`,
        ]);

        // Apply styling only to data columns (1-8)
        for (let col = 1; col <= 8; col++) {
          const cell = row.getCell(col);
          
          // Alternate row colors
          if (index % 2 === 0) {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF5F5F5" } };
          }
          
          // Center alignment for specific columns
          if (col === 1 || col >= 4) {
            cell.alignment = { horizontal: "center" };
          }
        }
      });

      // Add borders only to header and data rows with actual data (8 columns: A-H)
      const headerRowNum = 8;
      const endDataRow = 8 + statistics.studentStats.length;
      const numColumns = 8; // A-H columns
      
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

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const className = `${data.rombel.className}_${data.rombel.name}`.replace(/\s+/g, "_");
      const subjectName = data.subject.name.replace(/\s+/g, "_");
      const dateStr = new Date().toISOString().slice(0, 10);
      a.download = `Rekap_Absensi_${className}_${subjectName}_${dateStr}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Rekap absensi berhasil diexport");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Gagal export rekap absensi");
    }
  }, [data, statistics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-lg font-medium">Memuat data absensi...</p>
        </div>
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
          <h1 className="text-3xl font-bold">Absensi Kelas</h1>
          <p className="text-muted-foreground">
            {data.subject.name} - {data.rombel.name} ({data.rombel.className})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={exportToExcel} variant="outline" size="sm" className="gap-2" disabled={!statistics}>
            <Download className="h-4 w-4" />
            Export Rekap
          </Button>
          <Link href={`/teacher/kelas`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="input" className="space-y-4">
        <TabsList variant="underline" className="gap-4">
          <TabsTrigger value="input" variant="underline">
            <FileText className="h-4 w-4" />
            Input Absensi
          </TabsTrigger>
          <TabsTrigger value="history" variant="underline">
            <CalendarIcon className="h-4 w-4" />
            Riwayat
          </TabsTrigger>
          <TabsTrigger value="statistics" variant="underline">
            <TrendingUp className="h-4 w-4" />
            Statistik
          </TabsTrigger>
        </TabsList>

        <TabsContent value="input">
          <InputAbsensiTab
            data={data}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            attendanceRecords={attendanceRecords}
            setAttendanceRecords={setAttendanceRecords}
            isSaved={isSaved}
            setIsSaved={setIsSaved}
            hasChanges={hasChanges}
            setHasChanges={setHasChanges}
            saving={saving}
            handleSave={handleSave}
            loadAttendance={loadAttendance}
          />
        </TabsContent>

        <TabsContent value="history">
          <RiwayatAbsensiTab data={data} />
        </TabsContent>

        <TabsContent value="statistics">
          <StatistikAbsensiTab statistics={statistics} totalMeetings={data.totalMeetings} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
