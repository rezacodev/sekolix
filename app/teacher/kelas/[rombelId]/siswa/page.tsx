"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Users,
  Download,
  ArrowLeft,
  Mail,
  Phone,
  Eye,
} from "lucide-react";
import { StudentDetailModal } from "@/components/teacher/StudentDetailModal";

interface Student {
  id: string;
  fullName: string;
  nik: string;
  nisn: string | null;
  gender: string | null;
  placeOfBirth: string | null;
  dateOfBirth: Date | null;
  phone: string;
  email: string | null;
  address: string | null;
  program: string | null;
  rombelName: string | null;
  className: string | null;
  age: number | null;
  attendancePercentage: number | null;
  averageGrade: number | null;
}

interface RombelInfo {
  id: number;
  name: string;
  className: string;
  program: string | null;
  capacity: number | null;
  studentCount: number;
  tahunAjaran: string | null;
  isActive: boolean;
}

interface ApiResponse {
  success: boolean;
  data: {
    students: Student[];
    rombel: RombelInfo;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export default function SiswaKelasPage() {
  const params = useParams();
  const router = useRouter();
  const rombelId = params.rombelId as string;

  const [students, setStudents] = useState<Student[]>([]);
  const [rombelInfo, setRombelInfo] = useState<RombelInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });

  // Modal state
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "50",
      });

      if (searchQuery) params.append("search", searchQuery);
      if (genderFilter !== "all") params.append("gender", genderFilter);

      const response = await fetch(
        `/api/teacher/kelas/${rombelId}/siswa?${params}`
      );


      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Anda tidak memiliki akses ke kelas ini");
        }
        if (response.status === 404) {
          throw new Error("Kelas tidak ditemukan");
        }
        throw new Error("Gagal mengambil data siswa");
      }

      const result: ApiResponse = await response.json();
      
      if (result.success) {
        setStudents(result.data.students);
        setRombelInfo(result.data.rombel);
        setPagination(result.data.pagination);
        setError(null);
      }
    } catch (err) {
      console.error("[Siswa] Error:", err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, [rombelId, searchQuery, genderFilter, page]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    alert("Export functionality will be implemented");
  };

  if (error) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <Users className="h-16 w-16 text-muted-foreground" />
            <div className="text-center">
              <h3 className="text-lg font-semibold">Gagal Memuat Data</h3>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
              <Button onClick={fetchStudents} className="mt-4">
                Coba Lagi
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          {rombelInfo && (
            <>
              <h1 className="text-3xl font-bold">
                Data Siswa - {rombelInfo.name}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>Kelas {rombelInfo.className}</span>
                {rombelInfo.program && (
                  <>
                    <span>•</span>
                    <span>{rombelInfo.program}</span>
                  </>
                )}
                {rombelInfo.tahunAjaran && (
                  <>
                    <span>•</span>
                    <Badge variant="outline">{rombelInfo.tahunAjaran}</Badge>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {rombelInfo && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Siswa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pagination.total}
                {rombelInfo.capacity && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    / {rombelInfo.capacity}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Laki-laki
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {students.filter((s) => s.gender === "Laki-laki").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Perempuan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {students.filter((s) => s.gender === "Perempuan").length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama, NIK, atau NISN..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1); // Reset to first page on search
                }}
                className="pl-10"
              />
            </div>

            <Select
              value={genderFilter}
              onValueChange={(value) => {
                setGenderFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter Jenis Kelamin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                <SelectItem value="Perempuan">Perempuan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
              <Users className="h-16 w-16 text-muted-foreground" />
              <div className="text-center">
                <h3 className="text-lg font-semibold">Tidak Ada Siswa</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchQuery || genderFilter !== "all"
                    ? "Tidak ada siswa yang sesuai dengan filter"
                    : "Belum ada siswa terdaftar di kelas ini"}
                </p>
              </div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Nama Lengkap</TableHead>
                    <TableHead>NIK</TableHead>
                    <TableHead>NISN</TableHead>
                    <TableHead>Jenis Kelamin</TableHead>
                    <TableHead>Tempat, Tanggal Lahir</TableHead>
                    <TableHead>Kontak</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student, index) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {(page - 1) * pagination.limit + index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                            {student.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium">{student.fullName}</div>
                            {student.age && (
                              <div className="text-xs text-muted-foreground">
                                {student.age} tahun
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {student.nik}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {student.nisn || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={student.gender === "Laki-laki" ? "default" : "secondary"}>
                          {student.gender || "-"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {student.placeOfBirth || "-"}
                          {student.dateOfBirth && (
                            <div className="text-xs text-muted-foreground">
                              {formatDate(student.dateOfBirth)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {student.phone && (
                            <div className="flex items-center gap-1 text-xs">
                              <Phone className="h-3 w-3" />
                              <span>{student.phone}</span>
                            </div>
                          )}
                          {student.email && (
                            <div className="flex items-center gap-1 text-xs">
                              <Mail className="h-3 w-3" />
                              <span className="truncate max-w-[150px]">
                                {student.email}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedStudentId(student.id);
                            setIsModalOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Menampilkan {(page - 1) * pagination.limit + 1} -{" "}
                    {Math.min(page * pagination.limit, pagination.total)} dari{" "}
                    {pagination.total} siswa
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      Sebelumnya
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === pagination.totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      Selanjutnya
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Student Detail Modal */}
      <StudentDetailModal
        rombelId={rombelId}
        studentId={selectedStudentId}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedStudentId(null);
        }}
      />
    </div>
  );
}
