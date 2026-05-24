"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  AlertCircle,
  FileText,
  Save,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { AttendanceDatePicker } from "@/components/attendance-date-picker";
import { Input } from "@/components/ui/input";

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

interface InputAbsensiTabProps {
  data: AttendanceData;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  attendanceRecords: Record<string, { status: AttendanceStatus; notes: string }>;
  setAttendanceRecords: (records: Record<string, { status: AttendanceStatus; notes: string }>) => void;
  isSaved: boolean;
  setIsSaved: (saved: boolean) => void;
  hasChanges: boolean;
  setHasChanges: (changed: boolean) => void;
  saving: boolean;
  handleSave: () => void;
  loadAttendance: (date: string) => void;
}

export function InputAbsensiTab({
  data,
  selectedDate,
  setSelectedDate,
  attendanceRecords,
  setAttendanceRecords,
  isSaved,
  setIsSaved,
  hasChanges,
  setHasChanges,
  saving,
  handleSave,
  loadAttendance,
}: InputAbsensiTabProps) {
  const [inputSortBy, setInputSortBy] = useState<"name" | "nisn">("name");
  const [inputSortOrder, setInputSortOrder] = useState<"asc" | "desc">("asc");

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceRecords({
      ...attendanceRecords,
      [studentId]: {
        ...attendanceRecords[studentId],
        status,
      },
    });
    setHasChanges(true);
    setIsSaved(false);
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendanceRecords({
      ...attendanceRecords,
      [studentId]: {
        ...attendanceRecords[studentId],
        notes,
      },
    });
    setHasChanges(true);
    setIsSaved(false);
  };

  const handleBulkAction = (status: AttendanceStatus) => {
    const updated: Record<string, { status: AttendanceStatus; notes: string }> = {};
    data.students.forEach((student) => {
      updated[student.id] = {
        status,
        notes: attendanceRecords[student.id]?.notes || "",
      };
    });
    setAttendanceRecords(updated);
    setHasChanges(true);
    setIsSaved(false);
  };

  const sortedStudents = [...data.students].sort((a, b) => {
    let comparison = 0;
    if (inputSortBy === "name") {
      comparison = a.fullName.localeCompare(b.fullName);
    } else if (inputSortBy === "nisn") {
      const nisnA = a.nisn || "";
      const nisnB = b.nisn || "";
      comparison = nisnA.localeCompare(nisnB);
    }
    return inputSortOrder === "asc" ? comparison : -comparison;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Input Absensi</CardTitle>
            <CardDescription>
              Masukkan kehadiran siswa untuk pertemuan ini
            </CardDescription>
          </div>
          {isSaved && !hasChanges && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Data Tersimpan
            </Badge>
          )}
          {hasChanges && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              <AlertCircle className="h-3 w-3 mr-1" />
              Ada Perubahan
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Form Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Tanggal</Label>
            <AttendanceDatePicker
              date={selectedDate ? new Date(selectedDate + "T00:00:00") : undefined}
              onDateChange={(date) => {
                if (!date) return;
                
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");
                const dateStr = `${year}-${month}-${day}`;
                
                setSelectedDate(dateStr);
                
                const existing = data.attendances.find(att => att.date === dateStr);
                if (existing) {
                  loadAttendance(dateStr);
                } else {
                  const initial: Record<string, { status: AttendanceStatus; notes: string }> = {};
                  data.students.forEach((student) => {
                    initial[student.id] = { status: "HADIR", notes: "" };
                  });
                  setAttendanceRecords(initial);
                  setIsSaved(false);
                  setHasChanges(false);
                }
              }}
              existingDates={[...new Set(data.attendances.map(att => att.date))]}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Pertemuan Ke</Label>
            <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
              <span className="text-sm font-medium">
                {(() => {
                  const existing = data.attendances.find(att => att.date === selectedDate);
                  if (existing) {
                    const sortedDates = [...new Set(data.attendances.map(att => att.date))].sort();
                    const chronologicalPosition = sortedDates.indexOf(selectedDate) + 1;
                    return `Pertemuan ${chronologicalPosition} (Edit) - Sequence #${existing.meetingNumber}`;
                  }
                  const allDates = [...new Set(data.attendances.map(att => att.date)), selectedDate].sort();
                  const chronologicalPosition = allDates.indexOf(selectedDate) + 1;
                  const sequenceNumber = new Set(data.attendances.map(att => att.date)).size + 1;
                  return `Pertemuan ${chronologicalPosition} (Baru) - Sequence #${sequenceNumber}`;
                })()}
              </span>
              <Badge variant="outline" className="text-xs">
                Otomatis
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Urutan ditampilkan berdasarkan tanggal, sequence untuk tracking
            </p>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium">Aksi Cepat:</span>
          <Button size="sm" variant="outline" onClick={() => handleBulkAction("HADIR")}>
            <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
            Semua Hadir
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleBulkAction("SAKIT")}>
            <AlertCircle className="h-3 w-3 mr-1 text-yellow-600" />
            Semua Sakit
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleBulkAction("IZIN")}>
            <FileText className="h-3 w-3 mr-1 text-blue-600" />
            Semua Izin
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleBulkAction("ALPHA")}>
            <FileText className="h-3 w-3 mr-1 text-red-600" />
            Semua Alpha
          </Button>
        </div>

        {/* Student List */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">No</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    if (inputSortBy === "name") {
                      setInputSortOrder(inputSortOrder === "asc" ? "desc" : "asc");
                    } else {
                      setInputSortBy("name");
                      setInputSortOrder("asc");
                    }
                  }}
                >
                  <div className="flex items-center gap-1">
                    Nama Siswa
                    {inputSortBy === "name" ? (
                      inputSortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                    ) : (
                      <ArrowUpDown className="h-4 w-4 opacity-30" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    if (inputSortBy === "nisn") {
                      setInputSortOrder(inputSortOrder === "asc" ? "desc" : "asc");
                    } else {
                      setInputSortBy("nisn");
                      setInputSortOrder("asc");
                    }
                  }}
                >
                  <div className="flex items-center gap-1">
                    NISN
                    {inputSortBy === "nisn" ? (
                      inputSortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                    ) : (
                      <ArrowUpDown className="h-4 w-4 opacity-30" />
                    )}
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Keterangan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedStudents.map((student, index) => {
                const record = attendanceRecords[student.id] || {
                  status: "HADIR" as AttendanceStatus,
                  notes: "",
                };

                return (
                  <TableRow key={student.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{student.fullName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{student.nisn || "-"}</TableCell>
                    <TableCell>
                      <Select
                        value={record.status}
                        onValueChange={(value) =>
                          handleStatusChange(student.id, value as AttendanceStatus)
                        }
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HADIR">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-green-500" />
                              Hadir
                            </div>
                          </SelectItem>
                          <SelectItem value="SAKIT">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-yellow-500" />
                              Sakit
                            </div>
                          </SelectItem>
                          <SelectItem value="IZIN">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-blue-500" />
                              Izin
                            </div>
                          </SelectItem>
                          <SelectItem value="ALPHA">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-red-500" />
                              Alpha
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={record.notes}
                        onChange={(e) =>
                          handleNotesChange(student.id, e.target.value)
                        }
                        placeholder="Keterangan (opsional)"
                        className="w-full"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Save Button */}
        <div className="flex justify-start gap-2">
          <Button onClick={handleSave} disabled={saving || (!hasChanges && isSaved)}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Menyimpan..." : "Simpan Absensi"}
          </Button>
          {hasChanges && (
            <p className="text-sm text-muted-foreground flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              Ada perubahan yang belum disimpan
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
