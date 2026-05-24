"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Users,
  ClipboardList,
  FileText,
  GraduationCap,
  Clock,
  Calendar,
  MapPin,
} from "lucide-react";

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

interface ClassCardProps {
  rombelId: string;
  classId: string;
  className: string;
  rombelName: string;
  subjects: Subject[];
  studentCount: number;
  program?: string;
}

export function ClassCard({
  rombelId,
  classId,
  className,
  rombelName,
  subjects,
  studentCount,
  program,
}: ClassCardProps) {
  const dayMap: Record<string, string> = {
    MONDAY: "Senin",
    TUESDAY: "Selasa",
    WEDNESDAY: "Rabu",
    THURSDAY: "Kamis",
    FRIDAY: "Jumat",
    SATURDAY: "Sabtu",
    SUNDAY: "Minggu",
  };

  const formatTime = (time: string) => {
    try {
      const date = new Date(time);
      return date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return time;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-0">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 flex-1 min-w-0">
            <CardTitle className="text-lg font-bold">{className}</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">{rombelName}</Badge>
              {program && (
                <Badge variant="outline" className="text-xs">
                  {program}
                </Badge>
              )}
            </div>
          </div>

          {/* Right: Student data button with count */}
          <Link href={`/teacher/kelas/${rombelId}/siswa`} className="shrink-0">
            <Button variant="outline" size="sm" className="h-7 text-xs whitespace-nowrap">
              <Users className="h-3 w-3 mr-1" />
              Data Siswa ({studentCount})
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Subjects with Schedules and Actions */}
        <div className="space-y-2">
          {subjects.length > 0 ? (
            <div className="space-y-2">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="border rounded-lg p-2.5 space-y-2 bg-muted/20"
                >
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="default" className="text-xs shrink-0">
                      {subject.name}
                    </Badge>
                    
                    {/* Compact schedule display - right aligned */}
                    {subject.schedules && subject.schedules.length > 0 && (
                      <div className="text-right min-w-0">
                        <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                          {subject.schedules.slice(0, 2).map((schedule) => (
                            <div key={schedule.id} className="flex items-center justify-end gap-1.5">
                              <Clock className="h-3 w-3 shrink-0" />
                              <span className="font-medium">
                                {dayMap[schedule.day] || schedule.day}
                              </span>
                              <span>{formatTime(schedule.timeStart)}</span>
                              {schedule.room && (
                                <>
                                  <MapPin className="h-3 w-3 shrink-0" />
                                  <span className="truncate max-w-[100px]">{schedule.room}</span>
                                </>
                              )}
                            </div>
                          ))}
                          {subject.schedules.length > 2 && (
                            <span className="text-xs italic">+{subject.schedules.length - 2} lainnya</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Subject-specific Actions - more compact */}
                  <div className="grid grid-cols-3 gap-1">
                    <Link href={`/teacher/kelas/${rombelId}/absensi?subjectId=${subject.id}`}>
                      <Button variant="outline" size="sm" className="w-full h-7 text-xs px-2">
                        <ClipboardList className="h-3 w-3 mr-1" />
                        Absensi
                      </Button>
                    </Link>
                    <Link href={`/teacher/pembelajaran/materi?subjectId=${subject.id}&classId=${classId}`}>
                      <Button variant="outline" size="sm" className="w-full h-7 text-xs px-2">
                        <BookOpen className="h-3 w-3 mr-1" />
                        Materi
                      </Button>
                    </Link>
                    <Link href={`/teacher/kelas/${rombelId}/tugas?subjectId=${subject.id}`}>
                      <Button variant="outline" size="sm" className="w-full h-7 text-xs px-2">
                        <FileText className="h-3 w-3 mr-1" />
                        Tugas
                      </Button>
                    </Link>
                    <Link href={`/teacher/kelas/${rombelId}/jurnal?subjectId=${subject.id}`}>
                      <Button variant="outline" size="sm" className="w-full h-7 text-xs px-2">
                        <Calendar className="h-3 w-3 mr-1" />
                        Jurnal
                      </Button>
                    </Link>
                    <Link href={`/teacher/kelas/${rombelId}/nilai?subjectId=${subject.id}`} className="col-span-2">
                      <Button variant="default" size="sm" className="w-full h-7 text-xs px-2">
                        <GraduationCap className="h-3 w-3 mr-1" />
                        Kelola Nilai
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground italic">
              Belum ada mata pelajaran
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
