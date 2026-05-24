"use client";

import { useState, useEffect, useCallback } from "react";

export type AssignmentStatus = "upcoming" | "overdue" | "all";

export interface Assignment {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  subjectId: string | null;
  subjectName: string | null;
  rombelId: string | null;
  rombelName: string | null;
  submissionCount: number;
  totalStudents: number;
  status: "upcoming" | "overdue" | "active";
}

interface UseAssignmentsOptions {
  status?: AssignmentStatus;
  rombelId?: string;
  subjectId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  autoFetch?: boolean;
}

interface UseAssignmentsResult {
  assignments: Assignment[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAssignments({
  status = "all",
  rombelId,
  subjectId,
  search = "",
  page = 0,
  pageSize = 10,
  autoFetch = true,
}: UseAssignmentsOptions = {}): UseAssignmentsResult {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (status !== "all") params.set("status", status);
    if (rombelId) params.set("rombelId", rombelId);
    if (subjectId) params.set("subjectId", subjectId);
    if (search) params.set("search", search);
    try {
      const res = await fetch(`/api/teacher/tugas?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to fetch assignments");
      // Support { data: [], total: 0 } or { assignments: [], total: 0 }
      setAssignments(data.data ?? data.assignments ?? []);
      setTotal(data.total ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [status, rombelId, subjectId, search, page, pageSize]);

  useEffect(() => {
    if (autoFetch) fetchAssignments();
  }, [fetchAssignments, autoFetch]);

  return { assignments, total, loading, error, refetch: fetchAssignments };
}

// Derived: count upcoming and overdue
export function useAssignmentsSummary() {
  const { assignments, loading, error, refetch } = useAssignments({ autoFetch: true, pageSize: 100 });
  const upcoming = assignments.filter((a) => a.status === "upcoming").length;
  const overdue = assignments.filter((a) => a.status === "overdue").length;
  return { upcoming, overdue, total: assignments.length, loading, error, refetch };
}
