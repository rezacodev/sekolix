"use client";

import { useEffect, useState } from "react";
import { useBreadcrumb } from "./BreadcrumbContext";
import StatCard from "@/components/teacher/StatCard";
import QuickActionButton from "@/components/teacher/QuickActionButton";
import TodaySchedule from "@/components/teacher/TodaySchedule";
import PendingTasks from "@/components/teacher/PendingTasks";
import AnnouncementList from "@/components/teacher/AnnouncementList";
import { 
  Users, 
  BookOpen, 
  ClipboardCheck, 
  FileText,
  Upload,
  FilePlus,
  PenTool,
  UserCheck,
  Calendar,
  TrendingUp
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardData {
  stats: {
    totalClasses: number;
    totalStudents: number;
    totalMaterials: number;
    pendingGrading: number;
  };
  schedules: Array<{
    id: string;
    subject: string;
    class: string;
    time: string;
    room: string;
    status: "upcoming" | "ongoing" | "completed";
  }>;
  pendingTasks: Array<{
    id: string;
    type: "koreksi" | "absensi" | "nilai";
    title: string;
    class: string;
    deadline?: string;
    count: number;
  }>;
  averageGrade: number;
}

interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: "high" | "normal" | "low";
  date: string;
  from: string;
}

export default function TeacherDashboard() {
  const { setBreadcrumbs } = useBreadcrumb();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    setBreadcrumbs([{ label: "Dashboard" }]);
  }, [setBreadcrumbs]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError(null);

        const [summaryRes, announcementsRes] = await Promise.all([
          fetch("/api/teacher/dashboard-summary"),
          fetch("/api/teacher/announcements"),
        ]);

        if (!summaryRes.ok || !announcementsRes.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const summaryData = await summaryRes.json();
        const announcementsData = await announcementsRes.json();

        if (summaryData.success) {
          setDashboardData(summaryData.data);
        }

        if (announcementsData.success) {
          setAnnouncements(announcementsData.data);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Gagal memuat data dashboard. Silakan refresh halaman.");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Dashboard Guru</h1>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard Guru</h1>
        <p className="text-muted-foreground mt-1">
          Selamat datang kembali! Berikut ringkasan aktivitas Anda hari ini.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </>
        ) : (
          <>
            <StatCard
              title="Total Kelas"
              value={dashboardData?.stats.totalClasses || 0}
              icon={BookOpen}
              iconColor="text-emerald-600"
              iconBgColor="bg-emerald-50 dark:bg-emerald-900/20"
            />
            <StatCard
              title="Total Siswa"
              value={dashboardData?.stats.totalStudents || 0}
              icon={Users}
              iconColor="text-blue-600"
              iconBgColor="bg-blue-50 dark:bg-blue-900/20"
            />
            <StatCard
              title="Tugas Pending"
              value={dashboardData?.stats.pendingGrading || 0}
              icon={ClipboardCheck}
              iconColor="text-orange-600"
              iconBgColor="bg-orange-50 dark:bg-orange-900/20"
            />
            <StatCard
              title="Materi Tersedia"
              value={dashboardData?.stats.totalMaterials || 0}
              icon={FileText}
              iconColor="text-purple-600"
              iconBgColor="bg-purple-50 dark:bg-purple-900/20"
            />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickActionButton
          label="Upload Materi"
          icon={Upload}
          href="/teacher/pembelajaran/materi"
          colorClass="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
        />
        <QuickActionButton
          label="Buat Tugas Online"
          icon={FilePlus}
          href="/teacher/tugas"
          colorClass="text-blue-600 border-blue-200 hover:bg-blue-50"
        />
        <QuickActionButton
          label="Input Nilai"
          icon={PenTool}
          href="/teacher/nilai/input"
          colorClass="text-purple-600 border-purple-200 hover:bg-purple-50"
        />
        <QuickActionButton
          label="Isi Absensi"
          icon={UserCheck}
          href="/teacher/pembelajaran/absensi"
          colorClass="text-orange-600 border-orange-200 hover:bg-orange-50"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Schedules & Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule */}
          {loading ? (
            <Skeleton className="h-64" />
          ) : (
            <TodaySchedule schedules={dashboardData?.schedules || []} />
          )}

          {/* Pending Tasks */}
          {loading ? (
            <Skeleton className="h-48" />
          ) : (
            <PendingTasks tasks={dashboardData?.pendingTasks || []} />
          )}
        </div>

        {/* Right Column - Announcements & Calendar */}
        <div className="space-y-6">
          {/* Announcements */}
          {loading ? (
            <Skeleton className="h-96" />
          ) : (
            <AnnouncementList announcements={announcements} />
          )}

          {/* Mini Stats - Additional Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <Calendar className="h-5 w-5 text-emerald-600 mb-2" />
              <p className="text-xs text-muted-foreground">Jadwal Hari Ini</p>
              <p className="text-2xl font-bold text-emerald-600">
                {loading ? "-" : dashboardData?.schedules.length || 0}
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <TrendingUp className="h-5 w-5 text-blue-600 mb-2" />
              <p className="text-xs text-muted-foreground">Rata-rata Nilai</p>
              <p className="text-2xl font-bold text-blue-600">
                {loading ? "-" : dashboardData?.averageGrade || "-"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
