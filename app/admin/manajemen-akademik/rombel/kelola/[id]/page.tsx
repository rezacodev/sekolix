"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useBreadcrumb } from "@/hooks/useBreadcrumb";
import { toast } from "sonner";
import { ArrowLeft, RefreshCw, Info } from "lucide-react";

interface Rombel {
  id: number;
  name: string;
  class: {
    id: number;
    name: string;
  };
  program: {
    id: string;
    name: string;
  };
  tahunAjaran?: {
    id: string;
    label: string;
  };
}

interface Teacher {
  id: string;
  name: string;
}

interface Room {
  id: number;
  code: string | null;
  name: string;
  type: string;
  floor: string | null;
  building: string | null;
  capacity: number | null;
}

interface SubjectMapping {
  subjectId: number;
  subjectCode?: string;
  subjectName: string;
  teacherId?: string;
  teacherName?: string;
  day?: string;
  period?: number;
  room?: string;
}

interface LessonSession {
  session: number;
  startTime: string;
  endTime: string;
  isBreak: boolean;
  breakLabel?: string;
}

type LessonTimesByDay = Record<string, LessonSession[]>;

const DAYS = [
  { value: 'MONDAY', label: 'Senin' },
  { value: 'TUESDAY', label: 'Selasa' },
  { value: 'WEDNESDAY', label: 'Rabu' },
  { value: 'THURSDAY', label: 'Kamis' },
  { value: 'FRIDAY', label: 'Jumat' },
  { value: 'SATURDAY', label: 'Sabtu' },
];

const getDayLabel = (dayValue: string) => {
  return DAYS.find(d => d.value === dayValue)?.label || dayValue;
};

export default function KelolaRombelPage() {
  const params = useParams();
  const router = useRouter();
  const rombelId = params.id as string;
  
  const breadcrumbContext = useBreadcrumb();
  const { setBreadcrumbs } = breadcrumbContext || {};

  const [rombel, setRombel] = useState<Rombel | null>(null);
  const [subjects, setSubjects] = useState<SubjectMapping[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [lessonTimes, setLessonTimes] = useState<LessonTimesByDay>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [canRegenerate, setCanRegenerate] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState<Record<number, string>>({});

  useEffect(() => {
    if (setBreadcrumbs && rombel) {
      setBreadcrumbs([
        { label: "Manajemen Akademik", href: "/admin/manajemen-akademik" },
        { label: "Rombel, Pengampu & Jadwal", href: "/admin/manajemen-akademik/rombel" },
        { label: `${rombel.name} - Kelola Guru & Jadwal`, href: `/admin/manajemen-akademik/rombel/kelola/${rombelId}` }
      ]);
    }
  }, [setBreadcrumbs, rombelId, rombel]);

  const handleGenerateSubjects = async () => {
    try {
      setIsGenerating(true);
      const response = await fetch(`/api/admin/manajemen-akademik/rombel/${rombelId}/generate-subjects`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate subjects');
      }

      const data = await response.json();
      
      // Refresh data after successful generation
      await fetchData();
      
      toast.success(`Berhasil generate ${data.count} mata pelajaran`);
    } catch (error) {
      console.error('Error generating subjects:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal generate mata pelajaran');
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch rombel data
      const rombelResponse = await fetch(`/api/admin/manajemen-akademik/rombel/${rombelId}`);
      if (!rombelResponse.ok) {
        toast.error("Gagal memuat data rombel");
        return;
      }
      const rombelData = await rombelResponse.json();
      setRombel(rombelData);

      // Fetch teachers
      const teachersResponse = await fetch("/api/admin/manajemen-akademik/gtk");
      if (teachersResponse.ok) {
        const teachersData = await teachersResponse.json();
        setTeachers(Array.isArray(teachersData) ? teachersData : []);
      }

      // Fetch rooms
      const roomsResponse = await fetch("/api/admin/manajemen-akademik/rooms");
      if (roomsResponse.ok) {
        const roomsData = await roomsResponse.json();
        setRooms(Array.isArray(roomsData) ? roomsData : []);
      }

      // Fetch lesson times
      const lessonTimesResponse = await fetch("/api/admin/manajemen-akademik/lesson-times");
      if (lessonTimesResponse.ok) {
        const lessonTimesData = await lessonTimesResponse.json();
        setLessonTimes(lessonTimesData);
      }

      // Fetch subjects from curriculum and existing mappings
      const subjectsResponse = await fetch(`/api/admin/manajemen-akademik/rombel/${rombelId}/subjects-mapping`);
      if (subjectsResponse.ok) {
        const subjectsData = await subjectsResponse.json();
        setSubjects(subjectsData);
      }

      // Check if re-generation is available
      const statusResponse = await fetch(`/api/admin/manajemen-akademik/rombel/${rombelId}/generate-status`);
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setCanRegenerate(statusData.canRegenerate);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Terjadi kesalahan saat memuat data");
    } finally {
      setIsLoading(false);
    }
  }, [rombelId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTeacherChange = (subjectId: number, teacherId: string) => {
    const updatedSubjects = subjects.map(s => 
      s.subjectId === subjectId 
        ? { ...s, teacherId, teacherName: teachers.find(t => t.id === teacherId)?.name }
        : s
    );
    setSubjects(updatedSubjects);
    setHasChanges(true);
    
    // Clear error for this subject
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[subjectId];
      return newErrors;
    });
  };

  const handleDayChange = (subjectId: number, day: string) => {
    const updatedSubjects = subjects.map(s => 
      s.subjectId === subjectId 
        ? { ...s, day, period: undefined } // Reset period when day changes
        : s
    );
    setSubjects(updatedSubjects);
    setHasChanges(true);
  };

  const handlePeriodChange = (subjectId: number, period: number | undefined) => {
    const updatedSubjects = subjects.map(s => 
      s.subjectId === subjectId 
        ? { ...s, period }
        : s
    );
    setSubjects(updatedSubjects);
    setHasChanges(true);
  };

  const handleRoomChange = (subjectId: number, room: string) => {
    const updatedSubjects = subjects.map(s => 
      s.subjectId === subjectId 
        ? { ...s, room }
        : s
    );
    setSubjects(updatedSubjects);
    setHasChanges(true);
  };

  const validateSubjects = () => {
    const newErrors: Record<number, string> = {};
    
    // Track used schedule combinations
    const scheduleMap = new Map<string, number>();
    const teacherScheduleMap = new Map<string, number>();
    
    subjects.forEach(subject => {
      // Only validate if any field is filled
      const hasTeacher = !!subject.teacherId;
      const hasDay = !!subject.day;
      const hasPeriod = !!subject.period;
      const hasRoom = !!subject.room;
      
      // If teacher is assigned, then day and period must also be assigned
      if (hasTeacher && !hasDay) {
        newErrors[subject.subjectId] = "Hari harus dipilih jika guru sudah ditentukan";
      }
      if (hasTeacher && hasDay && !hasPeriod) {
        newErrors[subject.subjectId] = "Jam pelajaran harus dipilih";
      }
      if (hasTeacher && hasDay && hasPeriod && !hasRoom) {
        newErrors[subject.subjectId] = "Ruangan harus dipilih";
      }
      
      // If period is assigned, day must be assigned
      if (hasPeriod && !hasDay) {
        newErrors[subject.subjectId] = "Hari harus dipilih terlebih dahulu";
      }
      
      // Check for room scheduling conflicts (same day + period + room)
      if (hasDay && hasPeriod && hasRoom) {
        const scheduleKey = `${subject.day}-${subject.period}-${subject.room}`;
        if (scheduleMap.has(scheduleKey)) {
          const conflictSubjectId = scheduleMap.get(scheduleKey);
          const conflictSubject = subjects.find(s => s.subjectId === conflictSubjectId);
          const dayLabel = getDayLabel(subject.day!);
          newErrors[subject.subjectId] = `Bentrok ruangan dengan ${conflictSubject?.subjectName || 'mata pelajaran lain'} pada ${dayLabel} jam ke-${subject.period}`;
        } else {
          scheduleMap.set(scheduleKey, subject.subjectId);
        }
      }
      
      // Check for teacher scheduling conflicts (same teacher + day + period)
      if (hasTeacher && hasDay && hasPeriod) {
        const teacherKey = `${subject.teacherId}-${subject.day}-${subject.period}`;
        if (teacherScheduleMap.has(teacherKey)) {
          const conflictSubjectId = teacherScheduleMap.get(teacherKey);
          const conflictSubject = subjects.find(s => s.subjectId === conflictSubjectId);
          const dayLabel = getDayLabel(subject.day!);
          newErrors[subject.subjectId] = `Bentrok jadwal guru dengan ${conflictSubject?.subjectName || 'mata pelajaran lain'} pada ${dayLabel} jam ke-${subject.period}`;
        } else {
          teacherScheduleMap.set(teacherKey, subject.subjectId);
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    // Validate before saving
    if (!validateSubjects()) {
      toast.error("Terdapat kesalahan validasi. Silakan periksa kembali.");
      return;
    }
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/manajemen-akademik/rombel/${rombelId}/subjects-mapping`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjects })
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || "Gagal menyimpan data");
        return;
      }
      
      toast.success("Data berhasil disimpan");
      setHasChanges(false);
      
      // Refresh data to ensure consistency
      await fetchData();
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Terjadi kesalahan saat menyimpan data");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">Memuat data...</div>
      </div>
    );
  }

  if (!rombel) {
    return (
      <div className="p-6">
        <div className="text-center">Rombel tidak ditemukan</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kelola Guru & Jadwal</h1>
          <p className="text-muted-foreground mt-1">
            {rombel.name} • {rombel.class.name} • {rombel.program.name}
          </p>
        </div>
        <div className="flex gap-2">
          {subjects.length === 0 ? (
            <Button onClick={handleGenerateSubjects} disabled={isGenerating} variant="default">
              <RefreshCw className="h-4 w-4 mr-2" />
              {isGenerating ? "Generating..." : "Generate Mata Pelajaran"}
            </Button>
          ) : canRegenerate && (
            <Button onClick={handleGenerateSubjects} disabled={isGenerating} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              {isGenerating ? "Regenerating..." : "Re-generate (Ada Mapel Baru)"}
            </Button>
          )}
          <Button variant="outline" onClick={() => router.push("/admin/manajemen-akademik/rombel")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-foreground mb-1">Keterangan:</p>
              <ul className="space-y-1">
                <li>• Mata pelajaran diambil dari kurikulum yang dipetakan ke kelas ini</li>
                <li>• Pilih guru pengampu untuk setiap mata pelajaran</li>
                <li>• Tentukan hari, jam pelajaran, dan ruangan sesuai dengan jadwal yang telah dikonfigurasi</li>
                <li>• Jika guru sudah ditentukan, hari, jam pelajaran, dan ruangan wajib diisi</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Mata Pelajaran & Pengampu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Kode</th>
                  <th className="text-left p-3 font-medium">Mata Pelajaran</th>
                  <th className="text-left p-3 font-medium w-64">Guru Pengampu</th>
                  <th className="text-left p-3 font-medium w-40">Hari</th>
                  <th className="text-left p-3 font-medium w-32">Jam Ke-</th>
                  <th className="text-left p-3 font-medium w-48">Ruangan</th>
                </tr>
              </thead>
              <tbody>
                {subjects.length > 0 ? (
                  subjects.map((subject) => {
                    const hasError = errors[subject.subjectId];
                    return (
                    <>
                    <tr key={subject.subjectId} className={`border-b hover:bg-muted/50 ${
                      hasError ? 'bg-destructive/5' : ''
                    }`}>
                      <td className="p-3 text-sm">{subject.subjectCode || "-"}</td>
                      <td className="p-3 font-medium">{subject.subjectName}</td>
                      <td className="p-3">
                        <Select
                          value={subject.teacherId || ""}
                          onValueChange={(value) => handleTeacherChange(subject.subjectId, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih guru" />
                          </SelectTrigger>
                          <SelectContent>
                            {teachers.map((teacher) => (
                              <SelectItem key={teacher.id} value={teacher.id}>
                                {teacher.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-3">
                        <Select
                          value={subject.day || ""}
                          onValueChange={(value) => handleDayChange(subject.subjectId, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih hari" />
                          </SelectTrigger>
                          <SelectContent>
                            {DAYS.map((day) => (
                              <SelectItem key={day.value} value={day.value}>
                                {day.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-3">
                        <Select
                          value={subject.period?.toString() || ""}
                          onValueChange={(value) => handlePeriodChange(subject.subjectId, value ? parseInt(value) : undefined)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih jam" />
                          </SelectTrigger>
                          <SelectContent>
                            {subject.day && lessonTimes[subject.day] ? (
                              lessonTimes[subject.day]
                                .filter(lt => !lt.isBreak)
                                .map((lessonTime) => (
                                  <SelectItem key={lessonTime.session} value={lessonTime.session.toString()}>
                                    Jam {lessonTime.session} ({lessonTime.startTime} - {lessonTime.endTime})
                                  </SelectItem>
                                ))
                            ) : (
                              <SelectItem value="0" disabled>
                                Pilih hari terlebih dahulu
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-3">
                        <Select
                          value={subject.room || ""}
                          onValueChange={(value) => handleRoomChange(subject.subjectId, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih ruangan" />
                          </SelectTrigger>
                          <SelectContent>
                            {rooms.map((room) => (
                              <SelectItem key={room.id} value={room.name}>
                                {room.code ? `${room.code} - ` : ""}{room.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                    {hasError && (
                      <tr>
                        <td colSpan={6} className="p-2 text-sm text-destructive bg-destructive/5">
                          ⚠️ {errors[subject.subjectId]}
                        </td>
                      </tr>
                    )}
                    </>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      Belum ada mata pelajaran untuk rombel ini
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      {subjects.length > 0 && (
        <div className="flex justify-end gap-2">
          <Button 
            onClick={handleSave} 
            disabled={isSaving || !hasChanges}
            variant="default"
            size="lg"
          >
            {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      )}
    </div>
  );
}
