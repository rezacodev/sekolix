"use client";

import { useState, useCallback } from "react";

export type AttendanceStatus = "HADIR" | "SAKIT" | "IZIN" | "ALPHA";

export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  status: AttendanceStatus | null;
  note?: string | null;
}

export interface AttendanceSession {
  id?: string;
  date: string;
  rombelId: string;
  subjectId?: string;
  teacherSubjectId?: string;
  records: AttendanceRecord[];
}

interface UseAttendanceOptions {
  /** POST endpoint to save attendance */
  saveEndpoint?: string;
}

interface UseAttendanceResult {
  session: AttendanceSession | null;
  saving: boolean;
  error: string | null;
  initSession: (params: Omit<AttendanceSession, "records">, students: { id: string; name: string }[]) => void;
  setStatus: (studentId: string, status: AttendanceStatus) => void;
  setNote: (studentId: string, note: string) => void;
  markAll: (status: AttendanceStatus) => void;
  saveAttendance: () => Promise<boolean>;
  stats: AttendanceStats | null;
}

interface AttendanceStats {
  total: number;
  hadir: number;
  sakit: number;
  izin: number;
  alpha: number;
  hadirRate: number;
}

function computeStats(records: AttendanceRecord[]): AttendanceStats {
  const total = records.length;
  const hadir = records.filter((r) => r.status === "HADIR").length;
  const sakit = records.filter((r) => r.status === "SAKIT").length;
  const izin = records.filter((r) => r.status === "IZIN").length;
  const alpha = records.filter((r) => r.status === "ALPHA").length;
  return { total, hadir, sakit, izin, alpha, hadirRate: total > 0 ? (hadir / total) * 100 : 0 };
}

export function useAttendance({ saveEndpoint }: UseAttendanceOptions = {}): UseAttendanceResult {
  const [session, setSession] = useState<AttendanceSession | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initSession = useCallback(
    (params: Omit<AttendanceSession, "records">, students: { id: string; name: string }[]) => {
      setSession({
        ...params,
        records: students.map((s) => ({ studentId: s.id, studentName: s.name, status: null })),
      });
      setError(null);
    },
    []
  );

  const setStatus = useCallback((studentId: string, status: AttendanceStatus) => {
    setSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        records: prev.records.map((r) => (r.studentId === studentId ? { ...r, status } : r)),
      };
    });
  }, []);

  const setNote = useCallback((studentId: string, note: string) => {
    setSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        records: prev.records.map((r) => (r.studentId === studentId ? { ...r, note } : r)),
      };
    });
  }, []);

  const markAll = useCallback((status: AttendanceStatus) => {
    setSession((prev) => {
      if (!prev) return prev;
      return { ...prev, records: prev.records.map((r) => ({ ...r, status })) };
    });
  }, []);

  const saveAttendance = useCallback(async (): Promise<boolean> => {
    if (!session || !saveEndpoint) return false;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(saveEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: session.date,
          rombelId: session.rombelId,
          subjectId: session.subjectId,
          teacherSubjectId: session.teacherSubjectId,
          records: session.records.map((r) => ({
            studentId: r.studentId,
            status: r.status ?? "HADIR",
            note: r.note ?? null,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save attendance");
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      return false;
    } finally {
      setSaving(false);
    }
  }, [session, saveEndpoint]);

  const stats = session ? computeStats(session.records) : null;

  return { session, saving, error, initSession, setStatus, setNote, markAll, saveAttendance, stats };
}

// Constant for UI rendering
export const ATTENDANCE_OPTIONS: { value: AttendanceStatus; label: string; color: string }[] = [
  { value: "HADIR", label: "Hadir", color: "bg-green-100 text-green-700 border-green-300" },
  { value: "SAKIT", label: "Sakit", color: "bg-blue-100 text-blue-700 border-blue-300" },
  { value: "IZIN", label: "Izin", color: "bg-amber-100 text-amber-700 border-amber-300" },
  { value: "ALPHA", label: "Alpha", color: "bg-red-100 text-red-700 border-red-300" },
];
