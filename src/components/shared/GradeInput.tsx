"use client";

import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface GradeInputProps {
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  kkm?: number;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  /** Show TUNTAS / REMEDIAL badge next to input */
  showBadge?: boolean;
  /** Show colored border based on KKM */
  showColor?: boolean;
}

function gradeColor(value: number | null | undefined, kkm: number): string {
  if (value == null) return "";
  if (value >= kkm) return "border-green-400 focus-visible:ring-green-400";
  return "border-red-400 focus-visible:ring-red-400";
}

export function GradeInput({
  value,
  onChange,
  min = 0,
  max = 100,
  kkm = 75,
  disabled = false,
  placeholder = "0–100",
  className,
  showBadge = true,
  showColor = true,
}: GradeInputProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw === "") { onChange(null); return; }
      const num = parseFloat(raw);
      if (isNaN(num)) return;
      onChange(Math.max(min, Math.min(max, num)));
    },
    [onChange, min, max]
  );

  const isTuntas = value != null && value >= kkm;
  const colorClass = showColor ? gradeColor(value, kkm) : "";

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={0.1}
        value={value ?? ""}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        className={cn("w-20 text-center", colorClass, className)}
      />
      {showBadge && value != null && (
        <Badge
          variant="outline"
          className={cn(
            "text-xs shrink-0",
            isTuntas
              ? "border-green-400 text-green-700 bg-green-50"
              : "border-red-400 text-red-700 bg-red-50"
          )}
        >
          {isTuntas ? "TUNTAS" : "REMEDIAL"}
        </Badge>
      )}
    </div>
  );
}

// ── Bulk grade table ────────────────────────────────────────────────────────

export interface GradeRow {
  id: string;
  name: string;
  [key: string]: unknown;
}

interface GradeTableProps<T extends GradeRow> {
  rows: T[];
  columns: { key: string; label: string; kkm?: number }[];
  grades: Record<string, Record<string, number | null>>;
  onGradeChange: (studentId: string, columnKey: string, value: number | null) => void;
  disabled?: boolean;
  kkm?: number;
}

export function GradeTable<T extends GradeRow>({
  rows,
  columns,
  grades,
  onGradeChange,
  disabled = false,
  kkm = 75,
}: GradeTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left p-3 font-medium min-w-[180px]">Nama Siswa</th>
            {columns.map((col) => (
              <th key={col.key} className="text-center p-3 font-medium min-w-[120px]">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.id} className={idx % 2 === 1 ? "bg-muted/20" : ""}>
              <td className="p-3 font-medium">{row.name}</td>
              {columns.map((col) => (
                <td key={col.key} className="p-2 text-center">
                  <GradeInput
                    value={grades[row.id]?.[col.key] ?? null}
                    onChange={(v) => onGradeChange(row.id, col.key, v)}
                    kkm={col.kkm ?? kkm}
                    disabled={disabled}
                    showBadge={false}
                    showColor
                    className="mx-auto"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
