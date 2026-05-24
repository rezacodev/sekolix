import { prisma } from "@/lib/prisma";

export interface GradeScaleEntry {
  grade: string;
  min_score: number;
  max_score: number;
  label: string | null;
}

// Default scales used as fallback when DB has no rows
export const DEFAULT_SCALES: GradeScaleEntry[] = [
  { grade: "A", min_score: 90, max_score: 100, label: "Sangat Baik" },
  { grade: "B", min_score: 80, max_score: 89,  label: "Baik" },
  { grade: "C", min_score: 70, max_score: 79,  label: "Cukup" },
  { grade: "D", min_score: 60, max_score: 69,  label: "Kurang" },
  { grade: "E", min_score: 0,  max_score: 59,  label: "Sangat Kurang" },
];

// Fetch scales from DB, falling back to defaults if table is empty
export async function fetchGradeScales(): Promise<GradeScaleEntry[]> {
  const rows = await prisma.gradeScale.findMany({ orderBy: { min_score: "desc" } });
  if (rows.length === 0) return DEFAULT_SCALES;
  return rows.map(r => ({
    grade: r.grade,
    min_score: r.min_score,
    max_score: r.max_score,
    label: r.label,
  }));
}

// Convert a numeric score to a letter grade using the provided scale
export function scoreToGrade(score: number, scales: GradeScaleEntry[]): string {
  const sorted = [...scales].sort((a, b) => b.min_score - a.min_score);
  for (const s of sorted) {
    if (score >= s.min_score) return s.grade;
  }
  return sorted[sorted.length - 1]?.grade ?? "E";
}
