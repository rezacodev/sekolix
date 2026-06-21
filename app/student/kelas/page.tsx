"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, BarChart3 } from "lucide-react";

interface ClassData {
  id: string;
  name: string;
  grade: string;
  year: string;
  subjects: {
    name: string;
    teacher: string;
    color: string;
  }[];
  progress: number;
}

export default function StudentKelasPage() {
  const router = useRouter();

  const classes: ClassData[] = [
    {
      id: "1",
      name: "X-A",
      grade: "Kelas 10",
      year: "2025/2026",
      subjects: [
        { name: "Matematika", teacher: "Budi Santoso", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200" },
        { name: "Fisika", teacher: "Ahmad Rizki", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200" },
        { name: "Kimia", teacher: "Eka Kusuma", color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200" },
      ],
      progress: 65,
    },
    {
      id: "2",
      name: "X-B",
      grade: "Kelas 10",
      year: "2025/2026",
      subjects: [
        { name: "Bahasa Indonesia", teacher: "Siti Nurhaliza", color: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200" },
        { name: "Bahasa Inggris", teacher: "John Doe", color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200" },
      ],
      progress: 75,
    },
    {
      id: "3",
      name: "X-C",
      grade: "Kelas 10",
      year: "2025/2026",
      subjects: [
        { name: "Sejarah", teacher: "Rinto Harahap", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200" },
        { name: "Geografi", teacher: "Dina Wijaya", color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-200" },
      ],
      progress: 55,
    },
  ];

  const handleNavigate = (classId: string, page: "materi" | "tugas" | "forum") => {
    router.push(`/student/kelas/${classId}/${page}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Kelas Saya</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Daftar kelas dan rombel yang sedang kamu ikuti
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem) => (
          <Card key={classItem.id} className="hover:shadow-lg transition-shadow overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{classItem.name}</CardTitle>
                  <CardDescription>{classItem.grade} • {classItem.year}</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{classItem.progress}%</div>
                  <p className="text-xs text-gray-500">Progress</p>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${classItem.progress}%` }}
                ></div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Subjects */}
              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Mata Pelajaran</p>
                <div className="flex flex-wrap gap-2">
                  {classItem.subjects.map((subject, idx) => (
                    <div key={idx} className="flex flex-col">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${subject.color}`}>
                        {subject.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {subject.teacher}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Access Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleNavigate(classItem.id, "materi")}
                >
                  <BookOpen className="w-3 h-3 mr-1" />
                  Materi
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleNavigate(classItem.id, "tugas")}
                >
                  <BarChart3 className="w-3 h-3 mr-1" />
                  Tugas
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleNavigate(classItem.id, "forum")}
                >
                  💬
                  Forum
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Card */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900 dark:text-blue-200">
            💡 Klik pada kelas untuk mengakses materi, tugas, dan forum diskusi. Pantau progress kamu dan jangan lewatkan deadline tugas!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
