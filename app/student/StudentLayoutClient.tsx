"use client";

import Image from "next/image";

import { useSession } from "next-auth/react";
import type { Session } from "next-auth";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Settings,
  LogOut,
  Palette,
  Menu,
  Home,
  BookOpen,
  FileText,
  BarChart3,
  Calendar,
  Megaphone,
  User,
  ChevronDown,
  GraduationCap
} from "lucide-react";
import { signOut } from "next-auth/react";
import { BreadcrumbProvider, useBreadcrumb as useBreadcrumbContext } from "@/contexts/admin";
import { BreadcrumbDisplay } from "../admin/BreadcrumbDisplay";
import { NotificationProvider } from "@/contexts/student/NotificationProvider";
import { NotificationCenter } from "@/components/student/NotificationCenter";

const BREADCRUMB_MAP: Record<string, Array<{ label: string; href?: string }>> = {
  "/student": [{ label: "Dasbor" }],
  "/student/kelas": [{ label: "Kelas Saya" }],
  "/student/ujian": [{ label: "Ujian" }],
  "/student/nilai": [{ label: "Nilai" }],
  "/student/rapor": [{ label: "Rapor" }],
  "/student/jadwal": [{ label: "Jadwal" }],
  "/student/kalender": [{ label: "Kalender Akademik" }],
  "/student/pengumuman": [{ label: "Pengumuman" }],
  "/student/profil": [{ label: "Profil" }]
};

interface StudentLayoutClientProps {
  children: React.ReactNode;
}

export const StudentLayoutClient = ({ children }: StudentLayoutClientProps) => {
  const { data: session } = useSession() as { data: Session | null };
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCompactMode, setIsCompactMode] = useState(false);
  const [theme, setTheme] = useState<string>("blue");
  const breadcrumbContext = useBreadcrumbContext();
  const setBreadcrumbs = breadcrumbContext?.setBreadcrumbs;

  // Set breadcrumbs based on pathname
  useEffect(() => {
    if (!setBreadcrumbs) return;
    const crumbs = BREADCRUMB_MAP[pathname] || [{ label: "Halaman" }];
    setBreadcrumbs(crumbs);
  }, [pathname, setBreadcrumbs]);

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("student-theme") || "blue";
    setTheme(savedTheme);
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("student-theme", newTheme);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dasbor", href: "/student", badge: null },
    { icon: Home, label: "Kelas Saya", href: "/student/kelas", badge: null },
    { icon: BookOpen, label: "Ujian", href: "/student/ujian", badge: null },
    { icon: BarChart3, label: "Nilai", href: "/student/nilai", badge: null },
    { icon: FileText, label: "Rapor", href: "/student/rapor", badge: null },
    { icon: Calendar, label: "Jadwal", href: "/student/jadwal", badge: null },
    { icon: Calendar, label: "Kalender", href: "/student/kalender", badge: null },
    { icon: Megaphone, label: "Pengumuman", href: "/student/pengumuman", badge: null },
    { icon: User, label: "Profil", href: "/student/profil", badge: null }
  ];

  const isMenuActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <NotificationProvider>
      <BreadcrumbProvider>
        <div className={`flex h-screen bg-gray-100 dark:bg-gray-900 theme-${theme}`}>
        {/* Sidebar */}
        <div
          className={`${
            isSidebarOpen ? "w-64" : "w-20"
          } bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 flex flex-col`}
        >
          {/* Logo */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <Link href="/student" className={`flex items-center gap-3 ${!isSidebarOpen && "hidden"}`}>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">Sekolix</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Siswa</span>
                </div>
              </Link>
              {!isSidebarOpen && (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Menu Items */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = isMenuActive(item.href);
                return (
                  <Link key={item.href} href={item.href}>
                    <button
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors relative group ${
                        isActive
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                          : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span
                        className={`text-sm font-medium transition-all duration-300 ${
                          isSidebarOpen ? "opacity-100" : "opacity-0 w-0"
                        }`}
                      >
                        {item.label}
                      </span>
                      {!isSidebarOpen && (
                        <div className="absolute left-full ml-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap dark:bg-gray-700">
                          {item.label}
                        </div>
                      )}
                    </button>
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCompactMode(!isCompactMode)}
              className={`w-full flex items-center justify-start gap-2 ${!isSidebarOpen && "w-auto justify-center"}`}
              title="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
              {isSidebarOpen && <span className="text-sm">Kompak</span>}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`w-full flex items-center justify-start gap-2 ${!isSidebarOpen && "w-auto justify-center px-2"}`}
              title={isSidebarOpen ? "Tutup sidebar" : "Buka sidebar"}
            >
              {isSidebarOpen ? "← Tutup" : "→"}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
            <BreadcrumbDisplay />

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              {/* Notification Center */}
              <NotificationCenter />

              {/* Theme Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" title="Pilih tema">
                    <Palette className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Pilih Tema</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {["blue", "indigo", "cyan"].map((themeOption) => (
                    <DropdownMenuItem
                      key={themeOption}
                      onClick={() => handleThemeChange(themeOption)}
                      className={theme === themeOption ? "bg-gray-100 dark:bg-gray-700" : ""}
                    >
                      <div
                        className={`w-4 h-4 rounded-full mr-2 theme-color-${themeOption}`}
                      />
                      {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                      <AvatarFallback>
                        {session?.user?.name?.split(" ")[0][0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{session?.user?.name}</p>
                      <p className="text-xs text-gray-500">{session?.user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/student/profil")}>
                    <User className="mr-2 h-4 w-4" />
                    Profil
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                    <LogOut className="mr-2 h-4 w-4" />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto px-6 py-6">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </BreadcrumbProvider>
    </NotificationProvider>
  );
};
