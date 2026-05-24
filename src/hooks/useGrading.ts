"use client";

import { useState, useCallback } from "react";

export interface GradeEntry {
  studentId: string;
  rubricId?: string;
  score: number | null;
}

export interface RubricDef {
  id: string;
  name: string;
  type: string;
  weight: number;
  kkm?: number;
}

interface UseGradingOptions {
  rombelId?: string;
  subjectId?: string;
  kkm?: number;
  /** PUT/POST endpoint for saving grades */
  saveEndpoint?: string;
}

interface UseGradingResult {
  /** grades[studentId][rubricId] = score */
  grades: Record<string, Record<string, number | null>>;
  dirty: boolean;
  saving: boolean;
  error: string | null;
  setGrade: (studentId: string, rubricId: string, value: number | null) => void;
  setGrades: (newGrades: Record<string, Record<string, number | null>>) => void;
  resetGrades: () => void;
  saveGrades: () => Promise<boolean>;
  computeWeightedAvg: (studentId: string, rubrics: RubricDef[]) => number | null;
  isTuntas: (score: number | null) => boolean;
}

export function useGrading({
  rombelId,
  subjectId,
  kkm = 75,
  saveEndpoint,
}: UseGradingOptions = {}): UseGradingResult {
  const [grades, setGradesState] = useState<Record<string, Record<string, number | null>>>({});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setGrade = useCallback((studentId: string, rubricId: string, value: number | null) => {
    setGradesState((prev) => ({
      ...prev,
      [studentId]: { ...(prev[studentId] ?? {}), [rubricId]: value },
    }));
    setDirty(true);
  }, []);

  const setGrades = useCallback((newGrades: Record<string, Record<string, number | null>>) => {
    setGradesState(newGrades);
    setDirty(false);
  }, []);

  const resetGrades = useCallback(() => {
    setGradesState({});
    setDirty(false);
  }, []);

  const saveGrades = useCallback(async (): Promise<boolean> => {
    if (!saveEndpoint) return false;
    setSaving(true);
    setError(null);
    try {
      const payload = Object.entries(grades).flatMap(([studentId, rubricScores]) =>
        Object.entries(rubricScores).map(([rubricId, score]) => ({
          studentId,
          rubricId,
          score,
          rombelId,
          subjectId,
        }))
      );
      const res = await fetch(saveEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grades: payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save grades");
      setDirty(false);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      return false;
    } finally {
      setSaving(false);
    }
  }, [grades, saveEndpoint, rombelId, subjectId]);

  const computeWeightedAvg = useCallback(
    (studentId: string, rubrics: RubricDef[]): number | null => {
      const studentGrades = grades[studentId] ?? {};
      const totalWeight = rubrics.reduce((s, r) => s + r.weight, 0);
      if (totalWeight === 0) return null;
      let weightedSum = 0;
      let coveredWeight = 0;
      for (const rubric of rubrics) {
        const score = studentGrades[rubric.id];
        if (score != null) {
          weightedSum += score * rubric.weight;
          coveredWeight += rubric.weight;
        }
      }
      if (coveredWeight === 0) return null;
      return weightedSum / coveredWeight;
    },
    [grades]
  );

  const isTuntas = useCallback(
    (score: number | null): boolean => score != null && score >= kkm,
    [kkm]
  );

  return {
    grades,
    dirty,
    saving,
    error,
    setGrade,
    setGrades,
    resetGrades,
    saveGrades,
    computeWeightedAvg,
    isTuntas,
  };
}
