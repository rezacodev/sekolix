"use client";

import { useState, useEffect, useCallback } from "react";

export interface TeacherClassSchedule {
  id: number;
  day: string;
  timeStart: string;
  timeEnd: string;
  room: string | null;
  period: string | null;
}

export interface TeacherClassSubject {
  id: number;
  name: string;
  teacherSubjectId: number;
  schedules: TeacherClassSchedule[];
}

export interface TeacherClass {
  id: number;
  rombelId: number;
  classId: number;
  name: string;
  className: string;
  rombelName: string;
  program: string | null;
  tahunAjaran: string | null;
  studentCount: number;
  capacity: number | null;
  subjects: TeacherClassSubject[];
}

interface UseTeacherClassesResult {
  classes: TeacherClass[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTeacherClasses(): UseTeacherClassesResult {
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/teacher/my-classes");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to fetch classes");
      setClasses(data.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchClasses(); }, [fetchClasses]);

  return { classes, loading, error, refetch: fetchClasses };
}

// Derived helper: flat list of unique rombels
export function useTeacherRombels() {
  const { classes, loading, error, refetch } = useTeacherClasses();
  const rombels = classes.map((c) => ({
    id: String(c.rombelId),
    name: c.rombelName,
    className: c.className,
    studentCount: c.studentCount,
  }));
  return { rombels, loading, error, refetch };
}

// Derived helper: all subjects the teacher teaches (deduplicated by id)
export function useTeacherSubjects() {
  const { classes, loading, error, refetch } = useTeacherClasses();
  const subjectMap = new Map<number, { id: number; name: string }>();
  for (const cls of classes) {
    for (const sub of cls.subjects) {
      if (!subjectMap.has(sub.id)) subjectMap.set(sub.id, { id: sub.id, name: sub.name });
    }
  }
  const subjects = Array.from(subjectMap.values());
  return { subjects, loading, error, refetch };
}
