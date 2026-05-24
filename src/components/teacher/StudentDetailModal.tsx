"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  MapPin,
  Phone,
  Users,
  GraduationCap,
  TrendingUp,
  FileText,
  Ruler,
} from "lucide-react";

interface StudentDetailProps {
  rombelId: string;
  studentId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface StudentDetail {
  id: string;
  fullName: string;
  nik: string;
  nisn: string | null;
  registrationCode: string | null;
  gender: string | null;
  placeOfBirth: string | null;
  dateOfBirth: Date | null;
  nationality: string | null;
  religion: string | null;
  motherTongue: string | null;
  address: string | null;
  village: string | null;
  district: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  phone: string;
  mobile: string | null;
  email: string | null;
  program: string | null;
  programCode: string | null;
  entryYear: string | null;
  rombelName: string;
  className: string;
  tahunAjaran: string | null;
  fatherName: string | null;
  fatherNik: string | null;
  fatherBirthYear: number | null;
  fatherEducation: string | null;
  fatherOccupation: string | null;
  fatherIncome: string | null;
  motherName: string | null;
  motherNik: string | null;
  motherBirthYear: number | null;
  motherEducation: string | null;
  motherOccupation: string | null;
  motherIncome: string | null;
  guardianName: string | null;
  guardianNik: string | null;
  guardianBirthYear: number | null;
  guardianEducation: string | null;
  guardianOccupation: string | null;
  guardianIncome: string | null;
  livesWith: string | null;
  weight: number | null;
  height: number | null;
  distanceToSchool: number | null;
  transportationMode: string | null;
  anakKe: number | null;
  jumlahSaudara: number | null;
  schoolOrigin: string | null;
  achievements: string | null;
  notes: string | null;
  averageGrade: number | null;
  totalGrades: number;
  recentGrades: Array<{
    id: number;
    score: number;
    assessmentTitle: string;
    assessmentType: string;
    maxScore: number | null;
    subjectName: string;
  }>;
}

export function StudentDetailModal({
  rombelId,
  studentId,
  isOpen,
  onClose,
}: StudentDetailProps) {
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudentDetail = useCallback(async () => {
    if (!studentId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/teacher/kelas/${rombelId}/siswa/${studentId}`
      );

      if (!response.ok) {
        throw new Error("Gagal mengambil detail siswa");
      }

      const result = await response.json();
      if (result.success) {
        setStudent(result.data);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      console.error("Error fetching student detail:", err);
    } finally {
      setLoading(false);
    }
  }, [rombelId, studentId]);

  useEffect(() => {
    if (isOpen && studentId) {
      fetchStudentDetail();
    }
  }, [isOpen, studentId, fetchStudentDetail]);

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const calculateAge = (dateOfBirth: Date | null) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Detail Siswa</DialogTitle>
          <DialogDescription>
            Informasi lengkap data siswa
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-destructive">{error}</p>
          </div>
        ) : student ? (
          <div className="space-y-6">
            {/* Header Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
                    {student.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold">{student.fullName}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant="outline">
                        {student.className} - {student.rombelName}
                      </Badge>
                      {student.program && <Badge>{student.program}</Badge>}
                      {student.gender && (
                        <Badge
                          variant={
                            student.gender === "Laki-laki"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {student.gender}
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">NIK:</span>{" "}
                        <span className="font-mono">{student.nik}</span>
                      </div>
                      {student.nisn && (
                        <div>
                          <span className="text-muted-foreground">NISN:</span>{" "}
                          <span className="font-mono">{student.nisn}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="personal">Data Pribadi</TabsTrigger>
                <TabsTrigger value="family">Keluarga</TabsTrigger>
                <TabsTrigger value="academic">Akademik</TabsTrigger>
                <TabsTrigger value="notes">Catatan</TabsTrigger>
              </TabsList>

              {/* Personal Data Tab */}
              <TabsContent value="personal" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Informasi Pribadi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Tempat Lahir
                      </label>
                      <p className="font-medium">
                        {student.placeOfBirth || "-"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Tanggal Lahir
                      </label>
                      <p className="font-medium">
                        {formatDate(student.dateOfBirth)}
                        {student.dateOfBirth && (
                          <span className="text-sm text-muted-foreground ml-2">
                            ({calculateAge(student.dateOfBirth)} tahun)
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Kewarganegaraan
                      </label>
                      <p className="font-medium">{student.nationality || "-"}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Agama
                      </label>
                      <p className="font-medium">{student.religion || "-"}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Bahasa Ibu
                      </label>
                      <p className="font-medium">{student.motherTongue || "-"}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Tinggal Bersama
                      </label>
                      <p className="font-medium">{student.livesWith || "-"}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Alamat
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Alamat Lengkap
                      </label>
                      <p className="font-medium">{student.address || "-"}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground">
                          Desa/Kelurahan
                        </label>
                        <p className="font-medium">{student.village || "-"}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">
                          Kecamatan
                        </label>
                        <p className="font-medium">{student.district || "-"}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">
                          Kota/Kabupaten
                        </label>
                        <p className="font-medium">{student.city || "-"}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">
                          Provinsi
                        </label>
                        <p className="font-medium">{student.province || "-"}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">
                          Kode Pos
                        </label>
                        <p className="font-medium">{student.postalCode || "-"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Kontak
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Telepon
                      </label>
                      <p className="font-medium">{student.phone}</p>
                    </div>
                    {student.mobile && (
                      <div>
                        <label className="text-sm text-muted-foreground">
                          HP/WA
                        </label>
                        <p className="font-medium">{student.mobile}</p>
                      </div>
                    )}
                    {student.email && (
                      <div className="col-span-2">
                        <label className="text-sm text-muted-foreground">
                          Email
                        </label>
                        <p className="font-medium">{student.email}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Ruler className="h-5 w-5" />
                      Data Fisik & Transportasi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Tinggi Badan
                      </label>
                      <p className="font-medium">
                        {student.height ? `${student.height} cm` : "-"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Berat Badan
                      </label>
                      <p className="font-medium">
                        {student.weight ? `${student.weight} kg` : "-"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Jarak ke Sekolah
                      </label>
                      <p className="font-medium">
                        {student.distanceToSchool
                          ? `${student.distanceToSchool} km`
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Moda Transportasi
                      </label>
                      <p className="font-medium">
                        {student.transportationMode || "-"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Family Data Tab */}
              <TabsContent value="family" className="space-y-4">
                {/* Father */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Data Ayah
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Nama</label>
                      <p className="font-medium">{student.fatherName || "-"}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">NIK</label>
                      <p className="font-medium font-mono">
                        {student.fatherNik || "-"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Tahun Lahir
                      </label>
                      <p className="font-medium">
                        {student.fatherBirthYear || "-"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Pendidikan
                      </label>
                      <p className="font-medium">
                        {student.fatherEducation || "-"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Pekerjaan
                      </label>
                      <p className="font-medium">
                        {student.fatherOccupation || "-"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Penghasilan
                      </label>
                      <p className="font-medium">{student.fatherIncome || "-"}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Mother */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Data Ibu
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Nama</label>
                      <p className="font-medium">{student.motherName || "-"}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">NIK</label>
                      <p className="font-medium font-mono">
                        {student.motherNik || "-"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Tahun Lahir
                      </label>
                      <p className="font-medium">
                        {student.motherBirthYear || "-"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Pendidikan
                      </label>
                      <p className="font-medium">
                        {student.motherEducation || "-"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Pekerjaan
                      </label>
                      <p className="font-medium">
                        {student.motherOccupation || "-"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Penghasilan
                      </label>
                      <p className="font-medium">{student.motherIncome || "-"}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Guardian (if exists) */}
                {student.guardianName && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Data Wali
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground">
                          Nama
                        </label>
                        <p className="font-medium">{student.guardianName}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">NIK</label>
                        <p className="font-medium font-mono">
                          {student.guardianNik || "-"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">
                          Tahun Lahir
                        </label>
                        <p className="font-medium">
                          {student.guardianBirthYear || "-"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">
                          Pendidikan
                        </label>
                        <p className="font-medium">
                          {student.guardianEducation || "-"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">
                          Pekerjaan
                        </label>
                        <p className="font-medium">
                          {student.guardianOccupation || "-"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">
                          Penghasilan
                        </label>
                        <p className="font-medium">
                          {student.guardianIncome || "-"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Sibling Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Informasi Keluarga
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Anak Ke-
                      </label>
                      <p className="font-medium">{student.anakKe || "-"}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Jumlah Saudara
                      </label>
                      <p className="font-medium">{student.jumlahSaudara || "-"}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Academic Tab */}
              <TabsContent value="academic" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Informasi Akademik
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Asal Sekolah
                      </label>
                      <p className="font-medium">{student.schoolOrigin || "-"}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Tahun Masuk
                      </label>
                      <p className="font-medium">{student.entryYear || "-"}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Program
                      </label>
                      <p className="font-medium">{student.program || "-"}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Kelas/Rombel
                      </label>
                      <p className="font-medium">
                        {student.className} - {student.rombelName}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Statistik Nilai
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">
                          Rata-rata Nilai
                        </p>
                        <p className="text-3xl font-bold text-blue-600">
                          {student.averageGrade?.toFixed(2) || "-"}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">
                          Total Penilaian
                        </p>
                        <p className="text-3xl font-bold text-green-600">
                          {student.totalGrades}
                        </p>
                      </div>
                    </div>

                    {student.recentGrades.length > 0 ? (
                      <div>
                        <h4 className="font-semibold mb-3">Nilai Terbaru</h4>
                        <div className="space-y-2">
                          {student.recentGrades.map((grade) => (
                            <div
                              key={grade.id}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div>
                                <p className="font-medium">{grade.subjectName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {grade.assessmentTitle} ({grade.assessmentType})
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold">
                                  {grade.score}
                                  {grade.maxScore && (
                                    <span className="text-sm text-muted-foreground">
                                      /{grade.maxScore}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-4">
                        Belum ada data nilai
                      </p>
                    )}
                  </CardContent>
                </Card>

                {student.achievements && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Prestasi
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap">{student.achievements}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Notes Tab */}
              <TabsContent value="notes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Catatan Guru
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {student.notes ? (
                      <p className="whitespace-pre-wrap">{student.notes}</p>
                    ) : (
                      <p className="text-muted-foreground">
                        Belum ada catatan untuk siswa ini
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
