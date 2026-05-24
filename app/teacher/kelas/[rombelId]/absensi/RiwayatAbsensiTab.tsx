"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

type AttendanceStatus = "HADIR" | "SAKIT" | "IZIN" | "ALPHA";

interface Student {
  id: string;
  fullName: string;
  nisn: string | null;
}

interface AttendanceRecord {
  id: number;
  studentId: string;
  date: string;
  meetingNumber: number;
  status: AttendanceStatus;
}

interface AttendanceData {
  students: Student[];
  attendances: AttendanceRecord[];
}

const statusColors = {
  HADIR: "bg-green-100 text-green-800",
  SAKIT: "bg-yellow-100 text-yellow-800",
  IZIN: "bg-blue-100 text-blue-800",
  ALPHA: "bg-red-100 text-red-800",
};

interface RiwayatAbsensiTabProps {
  data: AttendanceData;
}

export function RiwayatAbsensiTab({ data }: RiwayatAbsensiTabProps) {
  const [historySortBy, setHistorySortBy] = useState<"name" | "nisn">("name");
  const [historySortOrder, setHistorySortOrder] = useState<"asc" | "desc">("asc");
  const [historyStartDate, setHistoryStartDate] = useState("");
  const [historyEndDate, setHistoryEndDate] = useState("");
  const [historyMeetingFilter, setHistoryMeetingFilter] = useState<string>("");

  const filteredAttendances = data.attendances.filter((att) => {
    let match = true;
    if (historyStartDate && att.date < historyStartDate) match = false;
    if (historyEndDate && att.date > historyEndDate) match = false;
    if (historyMeetingFilter && att.meetingNumber.toString() !== historyMeetingFilter) match = false;
    return match;
  });

  const studentAttendanceMap = new Map<string, Map<number, AttendanceRecord>>();
  filteredAttendances.forEach((att) => {
    if (!studentAttendanceMap.has(att.studentId)) {
      studentAttendanceMap.set(att.studentId, new Map());
    }
    studentAttendanceMap.get(att.studentId)!.set(att.meetingNumber, att);
  });

  const students = data.students.filter((student) => studentAttendanceMap.has(student.id));

  const meetingsMap = new Map<number, string>();
  filteredAttendances.forEach((att) => {
    if (!meetingsMap.has(att.meetingNumber)) {
      meetingsMap.set(att.meetingNumber, att.date);
    }
  });

  const meetings = Array.from(meetingsMap.entries()).sort((a, b) => a[1].localeCompare(b[1]));

  const sortedStudents = students.sort((a, b) => {
    let comparison = 0;
    if (historySortBy === "name") {
      comparison = a.fullName.localeCompare(b.fullName);
    } else if (historySortBy === "nisn") {
      comparison = (a.nisn || "").localeCompare(b.nisn || "");
    }
    return historySortOrder === "asc" ? comparison : -comparison;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Riwayat Absensi</CardTitle>
        <CardDescription>Lihat riwayat kehadiran siswa</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Tanggal Mulai</Label>
            <Input
              type="date"
              value={historyStartDate}
              onChange={(e) => setHistoryStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Tanggal Akhir</Label>
            <Input
              type="date"
              value={historyEndDate}
              onChange={(e) => setHistoryEndDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Pertemuan</Label>
            <Input
              type="number"
              placeholder="Filter sequence #"
              value={historyMeetingFilter}
              onChange={(e) => setHistoryMeetingFilter(e.target.value)}
            />
          </div>
        </div>

        {meetings.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Tidak ada data riwayat absensi</p>
            <p className="text-sm mt-2">Mulai input absensi pada tab Input Absensi</p>
          </div>
        ) : (
          <div className="border rounded-lg">
            <div className="relative max-h-[500px] overflow-auto">
              <table className="w-full">
                <thead className="sticky top-0 z-20 bg-white border-b">
                  <tr className="border-b">
                    <th
                      className="sticky left-0 z-30 bg-white px-4 py-3 text-left text-sm font-medium border-r min-w-[200px] cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        if (historySortBy === "name") {
                          setHistorySortOrder(historySortOrder === "asc" ? "desc" : "asc");
                        } else {
                          setHistorySortBy("name");
                          setHistorySortOrder("asc");
                        }
                      }}
                    >
                      <div className="flex items-center gap-1">
                        Nama Siswa
                        {historySortBy === "name" ? (
                          historySortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        ) : (
                          <ArrowUpDown className="h-4 w-4 opacity-30" />
                        )}
                      </div>
                    </th>
                    <th
                      className="sticky left-[200px] z-30 bg-white px-4 py-3 text-left text-sm font-medium border-r min-w-[120px] cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        if (historySortBy === "nisn") {
                          setHistorySortOrder(historySortOrder === "asc" ? "desc" : "asc");
                        } else {
                          setHistorySortBy("nisn");
                          setHistorySortOrder("asc");
                        }
                      }}
                    >
                      <div className="flex items-center gap-1">
                        NISN
                        {historySortBy === "nisn" ? (
                          historySortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        ) : (
                          <ArrowUpDown className="h-4 w-4 opacity-30" />
                        )}
                      </div>
                    </th>
                    {meetings.map(([meetingNum, date], index) => (
                      <th key={meetingNum} className="px-4 py-3 text-center text-sm font-medium bg-white min-w-[140px]">
                        <div className="font-semibold">P-{index + 1}</div>
                        <div className="text-xs font-normal text-muted-foreground">
                          {new Date(date).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground/60">Seq #{meetingNum}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedStudents.map((student) => {
                    const attendanceMap = studentAttendanceMap.get(student.id)!;
                    return (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="sticky left-0 z-10 bg-white px-4 py-3 font-medium border-r">
                          {student.fullName}
                        </td>
                        <td className="sticky left-[200px] z-10 bg-white px-4 py-3 text-sm text-muted-foreground border-r">
                          {student.nisn || "-"}
                        </td>
                        {meetings.map(([meetingNum]) => {
                          const attendance = attendanceMap.get(meetingNum);
                          return (
                            <td key={meetingNum} className="px-4 py-3 text-center">
                              {attendance ? (
                                <Badge className={statusColors[attendance.status]} variant="outline">
                                  {attendance.status}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
