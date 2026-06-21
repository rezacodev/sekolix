"use client";

import { useEffect, useState, useCallback } from "react";
import { useBreadcrumb } from "../BreadcrumbContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClassCard } from "@/components/teacher/ClassCard";
import { Search, SlidersHorizontal, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Schedule {
  id: number;
  day: string;
  timeStart: string;
  timeEnd: string;
  room: string | null;
  period: number | null;
}

interface Subject {
  id: string;
  name: string;
  schedules?: Schedule[];
}

interface TahunAjaranInfo {
  id: string;
  label: string;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
}

interface ClassData {
  classId: string;
  className: string;
  rombelId: string;
  rombelName: string;
  program: string;
  subjects: Subject[];
  studentCount: number;
  tahunAjaranInfo?: TahunAjaranInfo | null;
}

export default function KelasPage() {
  const breadcrumbContext = useBreadcrumb();
  const { setBreadcrumbs } = breadcrumbContext || {};
  
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTahunAjaran, setActiveTahunAjaran] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDay, setFilterDay] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");

  useEffect(() => {
    // Set breadcrumbs
    if (setBreadcrumbs) {
      setBreadcrumbs([
        { label: "Kelas Saya", href: "/teacher/kelas" },
      ]);
    }
    fetchClasses();
  }, [setBreadcrumbs]);

  const applyFilters = useCallback(() => {
    let filtered = [...classes];

    // Search filter (class name, rombel name, or subject name)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (cls) =>
          cls.className.toLowerCase().includes(query) ||
          cls.rombelName.toLowerCase().includes(query) ||
          cls.subjects.some((subj) =>
            subj.name.toLowerCase().includes(query)
          ) ||
          cls.program.toLowerCase().includes(query)
      );
    }

    // Day filter
    if (filterDay !== "all") {
      filtered = filtered.filter((cls) =>
        cls.subjects.some((subject) =>
          subject.schedules?.some((schedule) => schedule.day === filterDay)
        )
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.className.localeCompare(b.className);
        case "students":
          return b.studentCount - a.studentCount;
        case "subjects":
          return b.subjects.length - a.subjects.length;
        default:
          return 0;
      }
    });

    setFilteredClasses(filtered);
  }, [classes, searchQuery, filterDay, sortBy]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const dayOptions = [
    { value: "all", label: "Semua Hari" },
    { value: "MONDAY", label: "Senin" },
    { value: "TUESDAY", label: "Selasa" },
    { value: "WEDNESDAY", label: "Rabu" },
    { value: "THURSDAY", label: "Kamis" },
    { value: "FRIDAY", label: "Jumat" },
    { value: "SATURDAY", label: "Sabtu" },
  ];

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/teacher/my-classes");

      if (!response.ok) {
        throw new Error("Gagal mengambil data kelas");
      }

      const result = await response.json();
      setClasses(result.data || []);
      
      // Set active tahun ajaran from first class
      if (result.data && result.data.length > 0 && result.data[0].tahunAjaranInfo) {
        setActiveTahunAjaran(result.data[0].tahunAjaranInfo.label);
      }
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      console.error("Error fetching classes:", err);
    } finally {
      setLoading(false);
    }
  };

  const sortOptions = [
    { value: "name", label: "Nama Kelas" },
    { value: "students", label: "Jumlah Siswa" },
    { value: "subjects", label: "Jumlah Mata Pelajaran" },
  ];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <BookOpen className="h-16 w-16 text-muted-foreground" />
        <div className="text-center">
          <h3 className="text-lg font-semibold">Gagal Memuat Data</h3>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
          <Button onClick={fetchClasses} className="mt-4">
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Kelas Saya</h1>
          <p className="text-muted-foreground">
            Kelola dan pantau semua kelas yang Anda ajar
          </p>
        </div>
        {activeTahunAjaran && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 min-w-[200px]">
            <p className="text-xs text-gray-600 mb-1">Tahun Ajaran Aktif</p>
            <p className="text-base font-semibold text-blue-900">{activeTahunAjaran}</p>
          </div>
        )}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari kelas, rombel, atau mata pelajaran..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Day Filter */}
        <Select value={filterDay} onValueChange={setFilterDay}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {dayOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                Urutkan: {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            Menampilkan <strong>{filteredClasses.length}</strong> dari{" "}
            <strong>{classes.length}</strong> kelas
          </span>
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="h-auto p-0 text-primary hover:text-primary/80"
            >
              Reset pencarian
            </Button>
          )}
        </div>
      )}

      {/* Classes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[400px] rounded-lg" />
          ))}
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4 border-2 border-dashed rounded-lg">
          <BookOpen className="h-16 w-16 text-muted-foreground" />
          <div className="text-center">
            <h3 className="text-lg font-semibold">Tidak Ada Kelas</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery || filterDay !== "all"
                ? "Tidak ada kelas yang sesuai dengan filter"
                : "Anda belum memiliki kelas yang diajar"}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredClasses.map((classData) => (
            <ClassCard
              key={classData.classId + classData.rombelId}
              rombelId={classData.rombelId}
              classId={classData.classId}
              className={classData.className}
              rombelName={classData.rombelName}
              subjects={classData.subjects}
              studentCount={classData.studentCount}
              program={classData.program}
            />
          ))}
        </div>
      )}
    </div>
  );
}
