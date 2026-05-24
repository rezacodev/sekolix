"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

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

interface StatistikAbsensiTabProps {
  statistics: StatisticsData | null;
  totalMeetings: number;
}

export function StatistikAbsensiTab({ statistics, totalMeetings }: StatistikAbsensiTabProps) {
  const [sortBy, setSortBy] = useState<"name" | "nisn" | "attendance">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  if (!statistics) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <p>Loading statistik...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sortedStats = [...statistics.studentStats].sort((a, b) => {
    let comparison = 0;
    if (sortBy === "name") {
      comparison = a.studentName.localeCompare(b.studentName);
    } else if (sortBy === "nisn") {
      comparison = (a.nisn || "").localeCompare(b.nisn || "");
    } else if (sortBy === "attendance") {
      comparison = a.attendancePercentage - b.attendancePercentage;
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  return (
    <div className="space-y-4">
      {/* Class Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Statistik Kelas</CardTitle>
          <CardDescription>
            Ringkasan kehadiran seluruh kelas. Pertemuan ditampilkan urut chronological, data sequence untuk tracking internal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center p-4 border rounded-lg bg-blue-50">
              <div className="text-3xl font-bold text-blue-900">{totalMeetings}</div>
              <div className="text-sm text-muted-foreground">Total Pertemuan</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-green-600">{statistics.classStats.hadir}</div>
              <div className="text-sm text-muted-foreground">Hadir</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-yellow-600">{statistics.classStats.sakit}</div>
              <div className="text-sm text-muted-foreground">Sakit</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{statistics.classStats.izin}</div>
              <div className="text-sm text-muted-foreground">Izin</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-red-600">{statistics.classStats.alpha}</div>
              <div className="text-sm text-muted-foreground">Alpha</div>
            </div>
            <div className="text-center p-4 border rounded-lg bg-blue-50">
              <div className="text-3xl font-bold text-blue-900">
                {statistics.classStats.attendancePercentage}%
              </div>
              <div className="text-sm text-muted-foreground">% Kehadiran</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Statistik Per Siswa</CardTitle>
          <CardDescription>
            Detail kehadiran setiap siswa (klik header untuk sorting)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    if (sortBy === "name") {
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    } else {
                      setSortBy("name");
                      setSortOrder("asc");
                    }
                  }}
                >
                  <div className="flex items-center gap-1">
                    Nama Siswa
                    {sortBy === "name" ? (
                      sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                    ) : (
                      <ArrowUpDown className="h-4 w-4 opacity-30" />
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    if (sortBy === "nisn") {
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    } else {
                      setSortBy("nisn");
                      setSortOrder("asc");
                    }
                  }}
                >
                  <div className="flex items-center gap-1">
                    NISN
                    {sortBy === "nisn" ? (
                      sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                    ) : (
                      <ArrowUpDown className="h-4 w-4 opacity-30" />
                    )}
                  </div>
                </TableHead>
                <TableHead className="text-center">Hadir</TableHead>
                <TableHead className="text-center">Sakit</TableHead>
                <TableHead className="text-center">Izin</TableHead>
                <TableHead className="text-center">Alpha</TableHead>
                <TableHead
                  className="text-center cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    if (sortBy === "attendance") {
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    } else {
                      setSortBy("attendance");
                      setSortOrder("desc");
                    }
                  }}
                >
                  <div className="flex items-center justify-center gap-1">
                    % Hadir
                    {sortBy === "attendance" ? (
                      sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                    ) : (
                      <ArrowUpDown className="h-4 w-4 opacity-30" />
                    )}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedStats.map((stat, index) => (
                <TableRow key={stat.studentId}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{stat.studentName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{stat.nisn || "-"}</TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-green-100 text-green-800" variant="outline">
                      {stat.hadir}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-yellow-100 text-yellow-800" variant="outline">
                      {stat.sakit}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-blue-100 text-blue-800" variant="outline">
                      {stat.izin}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-red-100 text-red-800" variant="outline">
                      {stat.alpha}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-semibold">{stat.attendancePercentage}%</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
