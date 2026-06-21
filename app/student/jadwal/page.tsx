"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, MapPin, User } from "lucide-react";

export default function StudentJadwalPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Jadwal Pelajaran</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Jadwal pelajaran kamu minggu ini
        </p>
      </div>

      {/* Hari Buttons */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].map((hari) => (
          <button
            key={hari}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
              hari === "Senin"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            {hari}
          </button>
        ))}
      </div>

      {/* Schedule for selected day */}
      <div className="space-y-4">
        {[
          { jam: "07.00 - 07.45", mapel: "Upacara", guru: "-", ruang: "Lapangan" },
          { jam: "07.45 - 08.30", mapel: "Matematika", guru: "Budi Santoso", ruang: "Ruang 101" },
          { jam: "08.30 - 08.45", mapel: "Istirahat", guru: "-", ruang: "-" },
          { jam: "08.45 - 09.30", mapel: "Bahasa Indonesia", guru: "Siti Nurhaliza", ruang: "Ruang 101" },
          { jam: "09.30 - 10.15", mapel: "Bahasa Inggris", guru: "John Doe", ruang: "Ruang 101" },
          { jam: "10.15 - 10.30", mapel: "Istirahat", guru: "-", ruang: "-" },
          { jam: "10.30 - 11.15", mapel: "Fisika", guru: "Ahmad Rizki", ruang: "Lab 1" },
          { jam: "11.15 - 12.00", mapel: "Olahraga", guru: "Rinto Harahap", ruang: "Lapangan" },
          { jam: "12.00 - 12.30", mapel: "Ishoma", guru: "-", ruang: "Kantin" },
          { jam: "12.30 - 13.15", mapel: "Seni Rupa", guru: "Eka Kusuma", ruang: "Ruang Seni" }
        ].map((schedule, idx) => (
          <Card key={idx} className={schedule.guru === "-" ? "bg-gray-50 dark:bg-gray-800" : ""}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-16 text-center">
                  <p className="font-bold text-blue-600 dark:text-blue-400">{schedule.jam}</p>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{schedule.mapel}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                    {schedule.guru !== "-" && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{schedule.guru}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{schedule.ruang}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
