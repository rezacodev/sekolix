"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface StudentCardStudent {
  id: string;
  fullName: string;
  nisn?: string | null;
  className?: string;
  rombelName?: string;
  attendanceRate?: number | null;
  avgScore?: number | null;
  status?: "active" | "inactive" | "transferred";
}

interface StudentCardProps {
  student: StudentCardStudent;
  /** Extra info shown as right-column badges/text */
  extra?: React.ReactNode;
  selected?: boolean;
  selectable?: boolean;
  onClick?: () => void;
  className?: string;
  compact?: boolean;
}

export function StudentCard({
  student,
  extra,
  selected = false,
  selectable = false,
  onClick,
  className,
  compact = false,
}: StudentCardProps) {
  const initials = student.fullName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const attendanceColor =
    student.attendanceRate == null
      ? ""
      : student.attendanceRate >= 90
      ? "text-green-600"
      : student.attendanceRate >= 75
      ? "text-amber-600"
      : "text-red-600";

  return (
    <Card
      className={cn(
        "transition-all",
        selectable && "cursor-pointer",
        selected && "border-primary ring-1 ring-primary",
        !selected && selectable && "hover:shadow-md",
        className
      )}
      onClick={onClick}
    >
      <CardContent className={cn("flex items-center gap-3", compact ? "p-3" : "p-4")}>
        {/* Avatar */}
        <div
          className={cn(
            "rounded-full flex items-center justify-center font-bold shrink-0 transition-colors text-sm",
            compact ? "w-8 h-8" : "w-10 h-10",
            selected
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          {initials}
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <p className={cn("font-medium truncate", compact ? "text-sm" : "")}>{student.fullName}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
            {student.nisn && (
              <span className="text-xs text-muted-foreground">NISN: {student.nisn}</span>
            )}
            {(student.className || student.rombelName) && (
              <span className="text-xs text-muted-foreground">
                {[student.className, student.rombelName].filter(Boolean).join(" - ")}
              </span>
            )}
          </div>
          {!compact && (
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              {student.attendanceRate != null && (
                <span className={cn("text-xs font-medium", attendanceColor)}>
                  Kehadiran: {student.attendanceRate.toFixed(0)}%
                </span>
              )}
              {student.avgScore != null && (
                <span className="text-xs text-muted-foreground">
                  Rata-rata: {student.avgScore.toFixed(1)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Extra slot */}
        {extra && <div className="shrink-0">{extra}</div>}
      </CardContent>
    </Card>
  );
}
