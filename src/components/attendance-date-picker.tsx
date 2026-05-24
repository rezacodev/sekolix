"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface AttendanceDatePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  existingDates: string[]; // Array of dates in YYYY-MM-DD format that have attendance data
  disabled?: boolean;
}

export function AttendanceDatePicker({
  date,
  onDateChange,
  existingDates,
  disabled,
}: AttendanceDatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Convert string dates to Date objects for comparison
  const existingDateObjects = React.useMemo(() => {
    return existingDates.map((dateStr) => {
      const [year, month, day] = dateStr.split("-").map(Number);
      return new Date(year, month - 1, day);
    });
  }, [existingDates]);

  // Check if a date has existing attendance
  const hasAttendance = React.useCallback(
    (checkDate: Date) => {
      return existingDateObjects.some(
        (existingDate) =>
          existingDate.getFullYear() === checkDate.getFullYear() &&
          existingDate.getMonth() === checkDate.getMonth() &&
          existingDate.getDate() === checkDate.getDate()
      );
    },
    [existingDateObjects]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            date && hasAttendance(date) && "border-green-500 bg-green-50"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            <span className="flex items-center gap-2">
              {format(date, "PPP", { locale: id })}
              {hasAttendance(date) && (
                <span className="text-xs text-green-600 font-semibold">
                  ● Ada Data
                </span>
              )}
            </span>
          ) : (
            <span>Pilih tanggal</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            onDateChange(selectedDate);
            setOpen(false);
          }}
          initialFocus
          modifiers={{
            hasData: existingDateObjects,
          }}
          modifiersClassNames={{
            hasData: "bg-green-100 text-green-900 font-bold hover:bg-green-200 border border-green-400",
          }}
        />
        <div className="border-t p-3 bg-gray-50">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-green-100 border border-green-400"></div>
              <span className="text-muted-foreground">Sudah ada presensi</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded border"></div>
              <span className="text-muted-foreground">Tanggal baru</span>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
