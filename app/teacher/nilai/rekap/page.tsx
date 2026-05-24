"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, TrendingUp, Users, Target, Award, Download, Filter } from "lucide-react";
import { toast } from "sonner";
import { useBreadcrumb } from "@/app/teacher/BreadcrumbContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from "recharts";

interface GradeStats {
  className: string;
  subjectName: string;
  kkm: number;
  totalStudents: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
  standardDeviation: number;
  gradeDistribution: {
    "90-100": number;
    "80-89": number;
    "70-79": number;
    "60-69": number;
    "0-59": number;
  };
}

interface StudentPerformance {
  id: string;
  fullName: string;
  nisn: string;
  finalScore: number;
  grade: string;
  status: "TUNTAS" | "REMEDIAL";
  assessments: Array<{
    name: string;
    score: number;
    maxScore: number;
    weight: number;
  }>;
}

interface ClassOption {
  id: string;
  name: string;
  subjectName: string;
}

interface ApiClass {
  rombelId: number;
  classId: number;
  name: string;
  className: string;
  rombelName: string;
  subjects: Array<{
    id: number;
    name: string;
    teacherSubjectId: number;
  }>;
}

export default function RekapNilaiPage() {
  const router = useRouter();
  const breadcrumbContext = useBreadcrumb();
  const { setBreadcrumbs } = breadcrumbContext || {};

  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);
  const [classOptions, setClassOptions] = useState<ClassOption[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [gradeStats, setGradeStats] = useState<GradeStats | null>(null);
  const [studentsBelowKKM, setStudentsBelowKKM] = useState<StudentPerformance[]>([]);
  const [topPerformers, setTopPerformers] = useState<StudentPerformance[]>([]);

  // Set breadcrumb
  useEffect(() => {
    if (setBreadcrumbs) {
      setBreadcrumbs([
        { label: "Input Nilai Akademik", href: "/teacher/nilai/input" },
        { label: "Rekap & Analisis Nilai", href: "/teacher/nilai/rekap" },
      ]);
    }
  }, [setBreadcrumbs]);

  // Fetch class options
  useEffect(() => {
    fetchClassOptions();
  }, []);

  const fetchClassOptions = async () => {
    try {
      const response = await fetch("/api/teacher/my-classes");
      if (!response.ok) throw new Error("Failed to fetch classes");

      const data = await response.json();
      const options: ClassOption[] = [];

      // Process each rombel and its subjects
      data.data.forEach((cls: ApiClass) => {
        cls.subjects.forEach((subject) => {
          options.push({
            id: `${cls.rombelId}-${subject.id}`,
            name: `${cls.rombelName} - ${cls.className}`,
            subjectName: subject.name,
          });
        });
      });

      setClassOptions(options);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch class options:", error);
      toast.error("Gagal memuat data kelas");
      setLoading(false);
    }
  };

  const fetchGradeAnalysis = async (classId: string) => {
    if (!classId) return;

    setLoadingStats(true);
    try {
      const [rombelId, subjectId] = classId.split("-");
      const response = await fetch(`/api/teacher/nilai/rekap?rombelId=${rombelId}&subjectId=${subjectId}`);

      if (!response.ok) throw new Error("Failed to fetch grade analysis");

      const data = await response.json();
      setGradeStats(data.stats);
      setStudentsBelowKKM(data.studentsBelowKKM);
      setTopPerformers(data.topPerformers);
    } catch (error) {
      console.error("Failed to fetch grade analysis:", error);
      toast.error("Gagal memuat analisis nilai");
    } finally {
      setLoadingStats(false);
    }
  };

  const handleClassChange = (classId: string) => {
    setSelectedClass(classId);
    if (classId) {
      fetchGradeAnalysis(classId);
    } else {
      setGradeStats(null);
      setStudentsBelowKKM([]);
      setTopPerformers([]);
    }
  };

  const exportReport = async (format: "pdf" | "excel") => {
    if (!selectedClass || !gradeStats) return;

    try {
      const [rombelId, subjectId] = selectedClass.split("-");
      const response = await fetch(`/api/teacher/nilai/rekap/export?rombelId=${rombelId}&subjectId=${subjectId}&format=${format}`);

      if (!response.ok) throw new Error("Failed to export report");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rekap-nilai-${gradeStats.className}-${gradeStats.subjectName}.${format === "pdf" ? "pdf" : "xlsx"}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Laporan berhasil diekspor sebagai ${format.toUpperCase()}`);
    } catch (error) {
      console.error("Failed to export report:", error);
      toast.error("Gagal mengekspor laporan");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rekap & Analisis Nilai"
        description="Pantau performa siswa dan analisis hasil belajar secara menyeluruh"
      />

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Pilih Kelas & Mata Pelajaran</label>
              <Select value={selectedClass} onValueChange={handleClassChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kelas..." />
                </SelectTrigger>
                <SelectContent>
                  {classOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name} - {option.subjectName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {!selectedClass ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Pilih kelas dan mata pelajaran untuk melihat analisis nilai
            </p>
          </CardContent>
        </Card>
      ) : loadingStats ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mr-2" />
            <span className="text-muted-foreground">Menganalisis data nilai...</span>
          </CardContent>
        </Card>
      ) : gradeStats ? (
        <>
          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Rata-rata Kelas</p>
                    <p className="text-2xl font-bold">{gradeStats.averageScore.toFixed(1)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tingkat Kelulusan</p>
                    <p className="text-2xl font-bold">{gradeStats.passRate.toFixed(1)}%</p>
                  </div>
                  <Target className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nilai Tertinggi</p>
                    <p className="text-2xl font-bold">{gradeStats.highestScore.toFixed(1)}</p>
                  </div>
                  <Award className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Siswa</p>
                    <p className="text-2xl font-bold">{gradeStats.totalStudents}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Export Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ekspor Laporan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button onClick={() => exportReport("pdf")} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button onClick={() => exportReport("excel")} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Excel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Analysis Tabs */}
          <Tabs defaultValue="analisis-nilai" className="space-y-4">
            <TabsList>
              <TabsTrigger value="analisis-nilai">Analisis Nilai</TabsTrigger>
              <TabsTrigger value="siswa-khusus">Analisis Siswa ({studentsBelowKKM.length + topPerformers.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="analisis-nilai">
              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Bar Chart - Distribusi Nilai */}
                <Card>
                  <CardHeader>
                    <CardTitle>Distribusi Nilai</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={Object.entries(gradeStats.gradeDistribution).map(([range, count]) => ({
                        grade: `${range}`,
                        count,
                        percentage: ((count / gradeStats.totalStudents) * 100).toFixed(1)
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="grade" />
                        <YAxis />
                        <Tooltip
                          formatter={(value, name) => [
                            name === 'count' ? `${value} siswa` : `${value}%`,
                            name === 'count' ? 'Jumlah Siswa' : 'Persentase'
                          ]}
                        />
                        <Bar dataKey="count" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Pie Chart - Persentase */}
                <Card>
                  <CardHeader>
                    <CardTitle>Persentase Nilai</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={Object.entries(gradeStats.gradeDistribution).map(([range, count]) => ({
                            name: `${range}`,
                            value: count,
                            percentage: ((count / gradeStats.totalStudents) * 100).toFixed(1)
                          }))}
                          cx="35%"
                          cy="50%"
                          labelLine={false}
                          label={({ value, percent }) => percent && percent > 0 ? `${(percent * 100).toFixed(1)}%` : ''}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {Object.entries(gradeStats.gradeDistribution).map(([range], index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                range === '90-100' ? '#10b981' :
                                range === '80-89' ? '#3b82f6' :
                                range === '70-79' ? '#f59e0b' :
                                range === '60-69' ? '#ef4444' : '#6b7280'
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend
                          verticalAlign="middle"
                          align="right"
                          layout="vertical"
                          iconType="circle"
                          formatter={(value, entry, index) => {
                            const data = Object.entries(gradeStats.gradeDistribution).find(([range]) => range === value);
                            const count = data ? data[1] : 0;
                            const percentage = ((count / gradeStats.totalStudents) * 100).toFixed(1);
                            return (
                              <span style={{ color: entry.color }}>
                                {value}: {percentage}%
                              </span>
                            );
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Statistics Cards */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Statistik Nilai</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-4">
                    {Object.entries(gradeStats.gradeDistribution).map(([range, count]) => (
                      <div key={range} className="text-center">
                        <div className="text-2xl font-bold mb-2">{count}</div>
                        <Badge variant={range === "90-100" ? "default" : range === "80-89" ? "secondary" : "outline"}>
                          {range}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {((count / gradeStats.totalStudents) * 100).toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Analysis Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Performance Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Ringkasan Performa Kelas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{gradeStats.passRate.toFixed(1)}%</div>
                        <div className="text-sm text-green-700">Tuntas</div>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{(100 - gradeStats.passRate).toFixed(1)}%</div>
                        <div className="text-sm text-red-700">Remedial</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Rata-rata Kelas:</span>
                        <span className="font-semibold">{gradeStats.averageScore.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Nilai Tertinggi:</span>
                        <span className="font-semibold text-green-600">{gradeStats.highestScore.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Nilai Terendah:</span>
                        <span className="font-semibold text-red-600">{gradeStats.lowestScore.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Standar Deviasi:</span>
                        <span className="font-semibold">{gradeStats.standardDeviation.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">KKM:</span>
                        <span className="font-semibold">{gradeStats.kkm}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Grade Distribution Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tren Distribusi Nilai</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={[
                        { name: '90-100', value: gradeStats.gradeDistribution["90-100"], color: '#10b981' },
                        { name: '80-89', value: gradeStats.gradeDistribution["80-89"], color: '#3b82f6' },
                        { name: '70-79', value: gradeStats.gradeDistribution["70-79"], color: '#f59e0b' },
                        { name: '60-69', value: gradeStats.gradeDistribution["60-69"], color: '#ef4444' },
                        { name: '0-59', value: gradeStats.gradeDistribution["0-59"], color: '#6b7280' }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value} siswa`, 'Jumlah']} />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Insights */}
              <Card>
                <CardHeader>
                  <CardTitle>Wawasan Performa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-5 w-5 text-blue-500" />
                        <span className="font-semibold">Target Pencapaian</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {gradeStats.passRate >= 80
                          ? "🎯 Target tercapai! Tingkat ketuntasan di atas 80%"
                          : gradeStats.passRate >= 70
                          ? "⚠️ Perlu perbaikan. Target ketuntasan 80%"
                          : "❌ Perlu intervensi segera. Ketuntasan di bawah 70%"
                        }
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        <span className="font-semibold">Konsistensi</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {gradeStats.standardDeviation <= 10
                          ? "📊 Nilai cukup konsisten antar siswa"
                          : gradeStats.standardDeviation <= 15
                          ? "📈 Variasi nilai sedang, perlu perhatian"
                          : "📉 Variasi nilai tinggi, perlu analisis lebih lanjut"
                        }
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="h-5 w-5 text-yellow-500" />
                        <span className="font-semibold">Potensi</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {gradeStats.gradeDistribution["90-100"] > gradeStats.totalStudents * 0.3
                          ? "🌟 Kelas berprestasi tinggi!"
                          : gradeStats.gradeDistribution["0-59"] > gradeStats.totalStudents * 0.2
                          ? "💪 Perlu program pengayaan"
                          : "📚 Kelas dengan potensi yang baik"
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="siswa-khusus">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Siswa Remedial */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-red-500" />
                      Siswa Perlu Remedial (Di Bawah KKM: {gradeStats.kkm})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {studentsBelowKKM.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-2">🎉</div>
                        <p className="text-muted-foreground">
                          Tidak ada siswa yang perlu remedial!
                        </p>
                        <p className="text-sm text-green-600 mt-2">
                          Semua siswa telah mencapai KKM
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between mb-4 p-3 bg-red-50 rounded-lg">
                          <span className="text-sm font-medium">Total Siswa Remedial:</span>
                          <Badge variant="destructive" className="text-lg px-3 py-1">
                            {studentsBelowKKM.length} siswa
                          </Badge>
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {studentsBelowKKM
                            .sort((a, b) => a.finalScore - b.finalScore) // Sort by lowest score first
                            .map((student, index) => (
                            <div key={student.id} className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50/50">
                              <div className="flex items-center gap-3 flex-1">
                                <Badge variant="outline" className="min-w-[2rem] justify-center text-red-600">
                                  #{topPerformers.length + index + 1}
                                </Badge>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">{student.fullName}</p>
                                  <p className="text-sm text-muted-foreground">NISN: {student.nisn}</p>
                                  <div className="flex items-center gap-4 mt-1">
                                    <div className="flex items-center gap-1">
                                      <span className="text-xs text-gray-500">Nilai Akhir:</span>
                                      <span className="text-sm font-semibold text-red-600">{student.finalScore.toFixed(1)}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-xs text-gray-500">Total:</span>
                                      <span className="text-sm font-semibold text-orange-600">
                                        {student.assessments ? student.assessments.reduce((sum, a) => sum + a.score, 0).toFixed(1) : '0.0'}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-xs text-gray-500">KKM:</span>
                                      <span className="text-sm font-semibold">{gradeStats.kkm}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-xs text-gray-500">Peringkat:</span>
                                      <span className="text-sm font-semibold text-blue-600">#{topPerformers.length + index + 1}</span>
                                    </div>
                                  </div>
                                  {student.assessments && student.assessments.length > 0 && (
                                    <div className="mt-2 text-xs text-gray-600">
                                      <span className="font-medium">Detail:</span>
                                      {student.assessments.map((assessment, idx) => (
                                        <span key={idx} className="ml-1">
                                          {assessment.name}: {assessment.score.toFixed(1)}/{assessment.maxScore}
                                          {idx < student.assessments.length - 1 ? ', ' : ''}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge variant="destructive" className="mb-1">Remedial</Badge>
                                <p className="text-xs text-muted-foreground">
                                  Selisih: {(gradeStats.kkm - student.finalScore).toFixed(1)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Siswa Berprestasi */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-yellow-500" />
                      Siswa Berprestasi (Top Performer)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {topPerformers.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-2">📊</div>
                        <p className="text-muted-foreground">
                          Belum ada data siswa berprestasi
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Siswa dengan nilai tertinggi akan muncul di sini
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between mb-4 p-3 bg-yellow-50 rounded-lg">
                          <span className="text-sm font-medium">Total Siswa Berprestasi:</span>
                          <Badge variant="default" className="text-lg px-3 py-1">
                            {topPerformers.length} siswa
                          </Badge>
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {topPerformers.map((student, index) => (
                            <div key={student.id} className="flex items-center justify-between p-3 border border-yellow-200 rounded-lg bg-yellow-50/50">
                              <div className="flex items-center gap-3 flex-1">
                                <Badge variant="outline" className="min-w-[2rem] justify-center">
                                  {index + 1}
                                </Badge>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">{student.fullName}</p>
                                  <p className="text-sm text-muted-foreground">NISN: {student.nisn}</p>
                                  <div className="flex items-center gap-4 mt-1">
                                    <div className="flex items-center gap-1">
                                      <span className="text-xs text-gray-500">Nilai Akhir:</span>
                                      <span className="text-sm font-semibold text-green-600">{student.finalScore.toFixed(1)}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-xs text-gray-500">Total:</span>
                                      <span className="text-sm font-semibold text-orange-600">
                                        {student.assessments ? student.assessments.reduce((sum, a) => sum + a.score, 0).toFixed(1) : '0.0'}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-xs text-gray-500">Peringkat:</span>
                                      <span className="text-sm font-semibold text-blue-600">#{index + 1}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-xs text-gray-500">Status:</span>
                                      <span className="text-sm font-semibold text-green-600">
                                        {student.status === "TUNTAS" ? "Tuntas" : "Remedial"}
                                      </span>
                                    </div>
                                  </div>
                                  {student.assessments && student.assessments.length > 0 && (
                                    <div className="mt-2 text-xs text-gray-600">
                                      <span className="font-medium">Detail:</span>
                                      {student.assessments.map((assessment, idx) => (
                                        <span key={idx} className="ml-1">
                                          {assessment.name}: {assessment.score.toFixed(1)}/{assessment.maxScore}
                                          {idx < student.assessments.length - 1 ? ', ' : ''}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge variant="default" className="mb-1">Berprestasi</Badge>
                                <p className="text-xs text-muted-foreground">
                                  Top {Math.round((index + 1) / gradeStats.totalStudents * 100)}%
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Rekomendasi Intervensi */}
              {(studentsBelowKKM.length > 0 || topPerformers.length > 0) && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Rekomendasi Intervensi & Pengembangan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {studentsBelowKKM.length > 0 && (
                        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                          <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Program Remedial
                          </h4>
                          <ul className="text-sm text-red-700 space-y-1">
                            <li>• {studentsBelowKKM.length} siswa perlu bimbingan intensif</li>
                            <li>• Fokus pada materi yang belum dikuasai</li>
                            <li>• Jadwalkan remedial 2-3 kali per minggu</li>
                            <li>• Berikan materi tambahan dan latihan soal</li>
                          </ul>
                        </div>
                      )}

                      {topPerformers.length > 0 && (
                        <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                          <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                            <Award className="h-4 w-4" />
                            Program Pengayaan
                          </h4>
                          <ul className="text-sm text-yellow-700 space-y-1">
                            <li>• {topPerformers.length} siswa siap untuk tantangan lebih</li>
                            <li>• Berikan materi advanced atau project khusus</li>
                            <li>• Dorong partisipasi dalam kompetisi akademik</li>
                            <li>• Jadikan sebagai tutor sebaya</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </>
      ) : null}
    </div>
  );
}