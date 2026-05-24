"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type WeekDay = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";

export interface ScheduleEntry {
  id: string | number;
  day: WeekDay;
  startTime: string;
  endTime: string;
  subject?: string;
  room?: string | null;
  rombel?: string;
  color?: string;
}

interface ScheduleCalendarProps {
  entries: ScheduleEntry[];
  /** Days to display. Defaults to Mon-Fri */
  days?: WeekDay[];
  className?: string;
  onEntryClick?: (entry: ScheduleEntry) => void;
}

const DAY_LABELS: Record<WeekDay, string> = {
  MONDAY: "Senin",
  TUESDAY: "Selasa",
  WEDNESDAY: "Rabu",
  THURSDAY: "Kamis",
  FRIDAY: "Jumat",
  SATURDAY: "Sabtu",
  SUNDAY: "Minggu",
};

const DEFAULT_DAYS: WeekDay[] = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

const SLOT_COLORS = [
  "bg-blue-100 border-blue-300 text-blue-800",
  "bg-green-100 border-green-300 text-green-800",
  "bg-purple-100 border-purple-300 text-purple-800",
  "bg-amber-100 border-amber-300 text-amber-800",
  "bg-rose-100 border-rose-300 text-rose-800",
  "bg-cyan-100 border-cyan-300 text-cyan-800",
];

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });
  } catch {
    return iso;
  }
}

export function ScheduleCalendar({
  entries,
  days = DEFAULT_DAYS,
  className,
  onEntryClick,
}: ScheduleCalendarProps) {
  const byDay = Object.fromEntries(
    days.map((d) => [d, entries.filter((e) => e.day === d).sort((a, b) => a.startTime.localeCompare(b.startTime))])
  ) as Record<WeekDay, ScheduleEntry[]>;

  const subjectColors = new Map<string, string>();
  let colorIdx = 0;
  for (const entry of entries) {
    const key = entry.subject ?? String(entry.id);
    if (!subjectColors.has(key)) {
      subjectColors.set(key, entry.color ?? SLOT_COLORS[colorIdx % SLOT_COLORS.length]);
      colorIdx++;
    }
  }

  return (
    <div className={cn("overflow-x-auto rounded-lg border", className)}>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-muted/50">
            {days.map((day) => (
              <th key={day} className="text-center p-3 font-medium border-b min-w-[130px]">
                {DAY_LABELS[day]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="align-top">
            {days.map((day) => (
              <td key={day} className="p-2 border-r last:border-r-0 align-top">
                <div className="space-y-2 min-h-[80px]">
                  {byDay[day].length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center pt-3">—</p>
                  ) : (
                    byDay[day].map((entry) => {
                      const key = entry.subject ?? String(entry.id);
                      const color = subjectColors.get(key) ?? SLOT_COLORS[0];
                      return (
                        <div
                          key={entry.id}
                          className={cn(
                            "rounded border p-2 text-xs cursor-default transition-opacity",
                            color,
                            onEntryClick && "cursor-pointer hover:opacity-80"
                          )}
                          onClick={() => onEntryClick?.(entry)}
                        >
                          {entry.subject && (
                            <p className="font-semibold leading-tight truncate">{entry.subject}</p>
                          )}
                          <p className="mt-0.5 opacity-80">
                            {formatTime(entry.startTime)} – {formatTime(entry.endTime)}
                          </p>
                          {entry.rombel && (
                            <Badge variant="outline" className="mt-1 text-xs border-current py-0 px-1">{entry.rombel}</Badge>
                          )}
                          {entry.room && (
                            <p className="opacity-70 truncate">{entry.room}</p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ── Compact list variant ────────────────────────────────────────────────────

interface ScheduleListProps {
  entries: ScheduleEntry[];
  className?: string;
  onEntryClick?: (entry: ScheduleEntry) => void;
}

export function ScheduleList({ entries, className, onEntryClick }: ScheduleListProps) {
  const sorted = [...entries].sort((a, b) => {
    const dayOrder: WeekDay[] = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
    const di = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
    if (di !== 0) return di;
    return a.startTime.localeCompare(b.startTime);
  });

  return (
    <div className={cn("space-y-2", className)}>
      {sorted.map((entry) => (
        <div
          key={entry.id}
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg border bg-muted/30 text-sm",
            onEntryClick && "cursor-pointer hover:bg-muted/60 transition-colors"
          )}
          onClick={() => onEntryClick?.(entry)}
        >
          <div className="shrink-0 text-center min-w-[52px]">
            <p className="font-semibold text-xs text-muted-foreground uppercase">{DAY_LABELS[entry.day]}</p>
            <p className="font-medium text-xs">{formatTime(entry.startTime)}</p>
            <p className="text-xs text-muted-foreground">{formatTime(entry.endTime)}</p>
          </div>
          <div className="flex-1 min-w-0">
            {entry.subject && <p className="font-medium truncate">{entry.subject}</p>}
            {entry.rombel && <p className="text-xs text-muted-foreground">{entry.rombel}</p>}
            {entry.room && <p className="text-xs text-muted-foreground">{entry.room}</p>}
          </div>
        </div>
      ))}
      {sorted.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">Tidak ada jadwal.</p>
      )}
    </div>
  );
}
