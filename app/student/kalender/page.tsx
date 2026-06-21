"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function StudentKalenderPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 5)); // Juni 2026

  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const calendarDays = [];
  for (let i = 0; i < firstDay(currentMonth); i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth(currentMonth); i++) {
    calendarDays.push(i);
  }

  const events = {
    2: "PTS Matematika",
    3: "PTS Fisika",
    10: "Libur Nasional",
    15: "Pengumuman Nilai"
  };

  const monthName = currentMonth.toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Kalender</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Kalender akademik dan tanggal penting
        </p>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{monthName}</CardTitle>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 text-center mb-4">
            {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((day) => (
              <div key={day} className="font-semibold text-gray-600 dark:text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, idx) => (
              <div
                key={idx}
                className={`p-2 text-center rounded aspect-square flex flex-col items-center justify-center ${
                  day === null
                    ? "bg-gray-50 dark:bg-gray-800"
                    : day === new Date().getDate()
                    ? "bg-blue-500 text-white font-bold"
                    : events[day as keyof typeof events]
                    ? "bg-yellow-100 dark:bg-yellow-900 border-2 border-yellow-400 dark:border-yellow-600"
                    : "bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                }`}
              >
                {day && <span className="text-sm font-medium">{day}</span>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <Card>
        <CardHeader>
          <CardTitle>Acara Penting</CardTitle>
          <CardDescription>Bulan {monthName}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(events).map(([date, event]) => (
              <div key={date} className="flex items-start gap-4 pb-3 border-b last:pb-0 last:border-b-0">
                <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                  <span className="font-bold text-yellow-700 dark:text-yellow-300">{date}</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">{event}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Juni 2026</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
