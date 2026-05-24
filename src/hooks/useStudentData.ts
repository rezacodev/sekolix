"use client";

import { useState, useEffect, useCallback } from "react";

export interface StudentBasic {
  id: string;
  fullName: string;
  nisn: string | null;
  nis: string | null;
  mobile: string | null;
  rombelId: string;
  rombelName: string;
  className: string;
  attendanceRate?: number | null;
  avgScore?: number | null;
}

interface UseStudentDataOptions {
  rombelId?: string | null;
  search?: string;
  /** Fetch from this endpoint (defaults to /api/teacher/absensi with studentList mode) */
  endpoint?: string;
  /** Skip fetch until a rombelId is provided */
  requireRombel?: boolean;
}

interface UseStudentDataResult {
  students: StudentBasic[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useStudentData({
  rombelId,
  search = "",
  endpoint,
  requireRombel = true,
}: UseStudentDataOptions = {}): UseStudentDataResult {
  const [students, setStudents] = useState<StudentBasic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildUrl = useCallback(() => {
    if (endpoint) {
      const params = new URLSearchParams();
      if (rombelId) params.set("rombelId", rombelId);
      if (search) params.set("search", search);
      return `${endpoint}?${params}`;
    }
    // Default: use komunikasi/orang-tua which returns students from teacher's rombels
    const params = new URLSearchParams();
    if (rombelId) params.set("rombelId", rombelId);
    if (search) params.set("search", search);
    return `/api/teacher/komunikasi/orang-tua?${params}`;
  }, [endpoint, rombelId, search]);

  const fetchStudents = useCallback(async () => {
    if (requireRombel && !rombelId) { setStudents([]); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(buildUrl());
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to fetch students");
      // Support both { students: [] } and { data: [] } shapes
      const raw: StudentBasic[] = data.students ?? data.data ?? [];
      setStudents(raw);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [buildUrl, requireRombel, rombelId]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  return { students, loading, error, refetch: fetchStudents };
}

// Derived: students filtered/sorted client-side
export function useFilteredStudents(
  students: StudentBasic[],
  search: string
): StudentBasic[] {
  const q = search.toLowerCase();
  if (!q) return students;
  return students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(q) ||
      (s.nisn ?? "").toLowerCase().includes(q) ||
      (s.nis ?? "").toLowerCase().includes(q)
  );
}
