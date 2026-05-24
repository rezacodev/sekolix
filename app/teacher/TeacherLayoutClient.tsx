"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  FileText,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  Users,
  Palette,
  Check
} from "lucide-react";
import { signOut } from "next-auth/react";
import { RoleSwitcher } from "@/components/shared/RoleSwitcher";
import { BreadcrumbDisplay } from "./BreadcrumbDisplay";
import { ADMIN_THEMES } from "@/constants/admin-themes";

type SubMenu = {
  id: string;
  label: string;
  href: string;
  badge?: string;
  comingSoon?: boolean;
};

type MenuCategory = {
  id: string;
  name: string;
  icon: typeof LayoutDashboard;
  color: string;
  description: string;
  href?: string;
  comingSoon?: boolean;
  subMenus?: SubMenu[];
};

const teacherMenuCategories: MenuCategory[] = [
  {
    id: "dashboard",
    name: "Dashboard",
    icon: LayoutDashboard,
    color: "bg-emerald-500",
    description: "Ringkasan aktivitas",
    href: "/teacher"
  },
  {
    id: "pembelajaran",
    name: "Pembelajaran",
    icon: BookOpen,
    color: "bg-purple-500",
    description: "Materi & rencana mengajar",
    subMenus: [
      { id: "pembelajaran-silabus", label: "Silabus & RPP", href: "/teacher/pembelajaran/silabus" },
      { id: "pembelajaran-materi", label: "Materi Pembelajaran", href: "/teacher/pembelajaran/materi" }
    ]
  },
  {
    id: "kelas",
    name: "Kelas Saya",
    icon: Users,
    color: "bg-blue-500",
    description: "Kelola kelas yang diampu",
    href: "/teacher/kelas"
  },
  {
    id: "tugas-nilai",
    name: "Tugas & Nilai",
    icon: ClipboardCheck,
    color: "bg-orange-500",
    description: "Tugas, penilaian & nilai",
    subMenus: [
      { id: "tugas-list", label: "Kelola Tugas Online", href: "/teacher/tugas" },
      { id: "nilai-input", label: "Input Nilai Akademik", href: "/teacher/nilai/input" },
      { id: "nilai-rekap", label: "Rekap & Analisis Nilai", href: "/teacher/nilai/rekap" }
    ]
  },
  {
    id: "ujian",
    name: "Ujian & CBT",
    icon: FileText,
    color: "bg-red-500",
    description: "Bank soal & ujian",
    subMenus: [
      { id: "ujian-bank", label: "Bank Soal", href: "/teacher/ujian/bank-soal" },
      { id: "ujian-paket", label: "Buat Paket Ujian", href: "/teacher/ujian/paket" },
      { id: "ujian-jadwal", label: "Jadwal & Pelaksanaan", href: "/teacher/ujian/jadwal" },
      { id: "ujian-hasil", label: "Hasil & Analisis", href: "/teacher/ujian/hasil" }
    ]
  },
  {
    id: "komunikasi",
    name: "Komunikasi",
    icon: MessageSquare,
    color: "bg-cyan-500",
    description: "Interaksi & kolaborasi",
    subMenus: [
      { id: "komunikasi-forum", label: "Forum Diskusi", href: "/teacher/komunikasi/forum" },
      { id: "komunikasi-pesan", label: "Pesan & Konsultasi", href: "/teacher/komunikasi/pesan" },
      { id: "komunikasi-ortu", label: "Komunikasi Orang Tua", href: "/teacher/komunikasi/orang-tua" },
      { id: "komunikasi-kolaborasi", label: "Kolaborasi Guru", href: "/teacher/komunikasi/kolaborasi" }
    ]
  },
  {
    id: "laporan",
    name: "Laporan",
    icon: BarChart3,
    color: "bg-indigo-500",
    description: "Laporan & analitik",
    subMenus: [
      { id: "laporan-mengajar", label: "Laporan Mengajar", href: "/teacher/laporan/mengajar" },
      { id: "laporan-nilai", label: "Laporan Nilai & Prestasi", href: "/teacher/laporan/nilai" },
      { id: "laporan-analisis", label: "Analisis Pembelajaran", href: "/teacher/laporan/analisis" }
    ]
  },
  {
    id: "pengaturan",
    name: "Pengaturan",
    icon: Settings,
    color: "bg-gray-500",
    description: "Profil & preferensi",
    href: "/teacher/pengaturan"
  }
];

export function TeacherLayoutClient({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  // Determine initial expanded menu based on pathname
  const getInitialMenu = () => {
    let menuToExpand = "";

    if (pathname.startsWith("/teacher/kelas")) {
      menuToExpand = "kelas";
    } else if (pathname.startsWith("/teacher/pembelajaran")) {
      menuToExpand = "pembelajaran";
    } else if (pathname.startsWith("/teacher/tugas") || pathname.startsWith("/teacher/nilai")) {
      menuToExpand = "tugas-nilai";
    } else if (pathname.startsWith("/teacher/ujian")) {
      menuToExpand = "ujian";
    } else if (pathname.startsWith("/teacher/komunikasi")) {
      menuToExpand = "komunikasi";
    } else if (pathname.startsWith("/teacher/laporan")) {
      menuToExpand = "laporan";
    }

    return menuToExpand ? [menuToExpand] : [];
  };

  const [expandedMenus, setExpandedMenus] = useState<string[]>(() => getInitialMenu());
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [teacherTheme, setTeacherTheme] = useState<string>("minimalist-light");

  const applyTeacherTheme = async (themeId: string, persist: boolean = true) => {
    if (typeof document === "undefined") return;

    const theme = ADMIN_THEMES.find(t => t.id === themeId) || ADMIN_THEMES[0];
    const root = document.documentElement;

    if (theme.mode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    Object.entries(theme.cssVars).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });

    localStorage.setItem("teacher-theme", theme.id);
    setTeacherTheme(theme.id);

    if (persist) {
      try {
        await fetch("/api/teacher/teacher-theme", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ teacherTheme: theme.id })
        });
      } catch (error) {
        console.error("Failed to persist teacher theme", error);
      }
    }
  };

  // Initialize saved theme
  useEffect(() => {
    const hydrateTheme = async () => {
      try {
        const response = await fetch("/api/teacher/teacher-theme");
        if (response.ok) {
          const data = await response.json();
          const dbTheme = data?.teacherTheme;
          if (dbTheme && ADMIN_THEMES.some(t => t.id === dbTheme)) {
            await applyTeacherTheme(dbTheme, false);
            return;
          }
        }
      } catch (error) {
        console.error("Failed to load teacher theme preference", error);
      }

      const storedTheme =
        typeof window !== "undefined" ? localStorage.getItem("teacher-theme") : null;
      if (storedTheme && ADMIN_THEMES.some(t => t.id === storedTheme)) {
        await applyTeacherTheme(storedTheme, false);
      } else {
        await applyTeacherTheme("minimalist-light", false);
      }
    };

    hydrateTheme();
  }, []);

  // Auto-expand menu when pathname changes
  useEffect(() => {
    const menuToExpand = getInitialMenu();
    setExpandedMenus(prev => {
      const newMenu = menuToExpand.length > 0 ? menuToExpand : prev;
      return JSON.stringify(prev) !== JSON.stringify(newMenu) ? newMenu : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Check authentication
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const isActiveRoute = (href: string) => {
    if (href === "/teacher") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const getIconBgClass = () => {
    return "bg-muted/30";
  };

  const getIconTextClass = () => {
    return "h-5 w-5 text-muted-foreground";
  };

  const getActiveMenuClasses = (isActive: boolean) => {
    if (!isActive) return "hover:bg-accent hover:text-accent-foreground";
    return "bg-emerald-500 text-white hover:bg-emerald-600";
  };

  const getActiveMenuStyle = (isActive: boolean) => {
    if (!isActive) return undefined;
    return {
      backgroundColor: "hsl(142.1 76.2% 36.3%)",
      color: "#ffffff"
    } as React.CSSProperties;
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={`flex flex-col border-r border-sidebar-border bg-muted/30 transition-all duration-300 ${
          isSidebarMinimized ? "w-20" : "w-72"
        }`}
      >
        {/* Header with Logo and Toggle */}
        <div className="flex h-16 items-center justify-between border-b border-border bg-card px-4">
          {!isSidebarMinimized && (
            <div className="flex items-center gap-3">
              <Image
                src="/images/logo-sekolix-transparent.png"
                alt="Sekolix"
                width={40}
                height={40}
                className="rounded-md object-contain"
                priority
              />
              <div>
                <h2 className="text-xl font-bold tracking-tight">Sekolix</h2>
                <p className="text-xs text-muted-foreground">Portal Guru</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
            className="h-8 w-8"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 min-h-0">
        <ScrollArea className="h-full px-3 py-4 bg-muted/30">
          <nav className="flex flex-col gap-1">
            {teacherMenuCategories.map((category) => {
              const Icon = category.icon;
              const hasSubMenus = category.subMenus && category.subMenus.length > 0;
              const isExpanded = expandedMenus.includes(category.id);
              const isActive = category.href ? isActiveRoute(category.href) : false;

              return (
                <div key={category.id}>
                  {/* Main Menu Item */}
                  {category.href && category.comingSoon ? (
                    <div
                      className={`flex items-center gap-3 w-full py-2.5 px-3 rounded-md text-muted-foreground/50 cursor-not-allowed select-none ${isSidebarMinimized ? "justify-center" : ""}`}
                      title={isSidebarMinimized ? `${category.name} (Segera)` : undefined}
                    >
                      <div className={`p-2 rounded-lg shrink-0 border border-sidebar-border ${getIconBgClass()}`}>
                        <Icon className="h-5 w-5 opacity-40" />
                      </div>
                      {!isSidebarMinimized && (
                        <>
                          <div className="flex-1 text-left min-w-0">
                            <span className="block text-sm font-medium">{category.name}</span>
                            <div className="text-xs text-muted-foreground/60">{category.description}</div>
                          </div>
                          <span className="px-1.5 py-0.5 bg-muted text-muted-foreground/70 text-[10px] font-medium rounded-full leading-tight shrink-0">
                            Segera
                          </span>
                        </>
                      )}
                    </div>
                  ) : category.href ? (
                    <Button
                      variant="ghost"
                      className={`w-full justify-start gap-3 h-auto py-2.5 px-3 ${getActiveMenuClasses(isActive)} ${isSidebarMinimized ? "justify-center" : ""}`}
                      style={getActiveMenuStyle(isActive)}
                      asChild
                    >
                      <Link href={category.href} title={isSidebarMinimized ? category.name : undefined}>
                        <div
                          className={`p-2 rounded-lg shrink-0 border border-sidebar-border ${isActive ? "bg-transparent" : getIconBgClass()}`}
                        >
                          <Icon
                            className={isActive ? "h-5 w-5 text-current" : getIconTextClass()}
                          />
                        </div>
                        {!isSidebarMinimized && (
                          <>
                            <div className="flex-1 text-left min-w-0">
                              <span className="block text-sm font-medium">{category.name}</span>
                              <div className="text-xs text-muted-foreground">
                                {category.description}
                              </div>
                            </div>
                            <div className="w-4 shrink-0" />
                          </>
                        )}
                      </Link>
                    </Button>
                  ) : hasSubMenus && isSidebarMinimized ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className={`w-full justify-center gap-3 h-auto py-2.5 px-3 ${getActiveMenuClasses(isActive)}`}
                          style={getActiveMenuStyle(isActive)}
                          title={category.name}
                        >
                          <div
                            className={`p-2 rounded-lg shrink-0 border border-sidebar-border ${isActive ? "bg-transparent" : getIconBgClass()}`}
                          >
                            <Icon
                              className={isActive ? "h-5 w-5 text-current" : getIconTextClass()}
                            />
                          </div>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="right" align="start" className="w-44">
                        <DropdownMenuLabel>{category.name}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {category.subMenus!.map(sub => (
                          sub.comingSoon ? (
                            <DropdownMenuItem key={sub.id} disabled className="flex items-center justify-between gap-2">
                              <span>{sub.label}</span>
                              <span className="px-1.5 py-0.5 bg-muted text-muted-foreground/70 text-[10px] font-medium rounded-full leading-tight">
                                Segera
                              </span>
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem key={sub.id} asChild>
                              <Link href={sub.href}>{sub.label}</Link>
                            </DropdownMenuItem>
                          )
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Button
                      variant="ghost"
                      className={`w-full justify-start gap-3 h-auto py-2.5 px-3 ${getActiveMenuClasses(isActive)} ${isSidebarMinimized ? "justify-center" : ""}`}
                      style={getActiveMenuStyle(isActive)}
                      onClick={() => hasSubMenus && toggleMenu(category.id)}
                      title={isSidebarMinimized ? category.name : undefined}
                    >
                      <div
                        className={`p-2 rounded-lg shrink-0 border border-sidebar-border ${isActive ? "bg-transparent" : getIconBgClass()}`}
                      >
                        <Icon
                          className={isActive ? "h-5 w-5 text-current" : getIconTextClass()}
                        />
                      </div>
                      {!isSidebarMinimized && (
                        <>
                          <div className="flex-1 text-left min-w-0">
                            <span className="block text-sm font-medium">{category.name}</span>
                            <div className="text-xs text-muted-foreground">{category.description}</div>
                          </div>
                          {hasSubMenus ? (
                            <ChevronDown
                              className={`h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0 ${isExpanded ? "rotate-180" : ""}`}
                            />
                          ) : (
                            <div className="w-4 shrink-0" />
                          )}
                        </>
                      )}
                    </Button>
                  )}

                  {!isSidebarMinimized && isExpanded && (
                    <div className="ml-11 mt-1 space-y-1">
                      {category.subMenus?.map(sub => {
                        const isSubActive = isActiveRoute(sub.href);
                        if (sub.comingSoon) {
                          return (
                            <div
                              key={sub.id}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm rounded-md text-muted-foreground/50 cursor-not-allowed select-none"
                              title="Segera hadir"
                            >
                              <span className="flex-1 text-left">{sub.label}</span>
                              <span className="px-1.5 py-0.5 bg-muted text-muted-foreground/70 text-[10px] font-medium rounded-full leading-tight shrink-0">
                                Segera
                              </span>
                            </div>
                          );
                        }
                        return (
                          <Button
                            key={sub.id}
                            variant="ghost"
                            className={`w-full justify-start text-sm h-9 ${getActiveMenuClasses(isSubActive)}`}
                            style={getActiveMenuStyle(isSubActive)}
                            asChild
                          >
                            <Link href={sub.href}>
                              <span className="flex-1 text-left">{sub.label}</span>
                              {sub.badge && (
                                <span className="px-1.5 py-0.5 bg-destructive text-destructive-foreground text-xs rounded-full">
                                  {sub.badge}
                                </span>
                              )}
                            </Link>
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </ScrollArea>
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-border bg-card px-4 py-3">
          {!isSidebarMinimized ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Image
                  src="/images/logo-sekolix-transparent.png"
                  alt="Sekolix"
                  width={28}
                  height={28}
                  className="rounded-md object-contain"
                  priority
                />
                <div>
                  <div className="text-sm font-semibold">
                    <Link
                      href="https://github.com/rezacodev/sekolix"
                      target="_blank"
                      className="text-xs text-muted-foreground hover:underline"
                    >
                      &copy; Sekolix | Portal Guru
                    </Link>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Open source - Integrated - Powerfull
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Image
                src="/images/logo-sekolix-transparent.png"
                alt="Sekolix"
                width={28}
                height={28}
                className="rounded-md object-contain"
                priority
              />
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
          <BreadcrumbDisplay />

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <RoleSwitcher />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user?.image || ""} />
                    <AvatarFallback className="bg-emerald-500 text-white">
                      {session.user?.name?.charAt(0) || "G"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">{session.user?.name || "Guru"}</p>
                    <p className="text-xs text-gray-500">Teacher</p>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsThemeModalOpen(true)}>
                  <Palette className="mr-2 h-4 w-4" />
                  Pilih Tema Portal
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/teacher/pengaturan">
                    <Settings className="mr-2 h-4 w-4" />
                    Pengaturan
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowLogoutConfirm(true)}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {/* Theme Selection Modal */}
      <Dialog open={isThemeModalOpen} onOpenChange={setIsThemeModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Pilih Tema Portal Guru</DialogTitle>
            <DialogDescription>
              Sesuaikan tampilan portal guru dengan tema pilihan Anda
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {ADMIN_THEMES.map(theme => {
              const isActive = teacherTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={async () => {
                    await applyTeacherTheme(theme.id);
                    setIsThemeModalOpen(false);
                  }}
                  className={`relative p-4 border rounded-lg text-left transition-all hover:shadow-md ${
                    isActive ? "border-primary ring-2 ring-primary/20" : "border-border"
                  }`}
                >
                  {isActive && (
                    <div className="absolute top-2 right-2">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-3">
                    {theme.swatches.map((color, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-md border border-border/50"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <h3 className="font-semibold mb-1">{theme.name}</h3>
                  <p className="text-sm text-muted-foreground">{theme.description}</p>
                </button>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsThemeModalOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Konfirmasi Logout</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Apakah Anda yakin ingin keluar dari sistem?
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={handleLogout}
              >
                Ya, Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
