"use client";

import "./active-admin-menu.css";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  LayoutDashboard,
  Settings,
  LogOut,
  Palette,
  Globe,
  ChevronDown,
  Menu,
  ClipboardList,
  Check
} from "lucide-react";
import { signOut } from "next-auth/react";
import { BreadcrumbProvider, useBreadcrumb } from "@/contexts/admin";
import { BreadcrumbDisplay } from "./BreadcrumbDisplay";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ADMIN_THEMES } from "@/constants/admin-themes";
import { RoleSwitcher } from "@/components/shared/RoleSwitcher";

// Breadcrumb mapping for automatic breadcrumb generation
const BREADCRUMB_MAP: Record<string, Array<{ label: string; href?: string }>> = {
  "/admin": [{ label: "Dasbor" }],
  "/admin/landing-website": [{ label: "Website Sekolah", href: "/admin/landing-website" }],
  "/admin/landing-website/posts": [
    { label: "Website Sekolah", href: "/admin/landing-website" },
    { label: "Konten" }
  ],
  "/admin/landing-website/posts/articles": [
    { label: "Website Sekolah", href: "/admin/landing-website" },
    { label: "Konten", href: "/admin/landing-website/posts" },
    { label: "Artikel" }
  ],
  "/admin/landing-website/posts/articles/new": [
    { label: "Website Sekolah", href: "/admin/landing-website" },
    { label: "Konten", href: "/admin/landing-website/posts" },
    { label: "Artikel", href: "/admin/landing-website/posts/articles" },
    { label: "Buat Baru" }
  ],
  "/admin/landing-website/posts/news": [
    { label: "Website Sekolah", href: "/admin/landing-website" },
    { label: "Konten", href: "/admin/landing-website/posts" },
    { label: "Berita" }
  ],
  "/admin/landing-website/posts/news/new": [
    { label: "Website Sekolah", href: "/admin/landing-website" },
    { label: "Konten", href: "/admin/landing-website/posts" },
    { label: "Berita", href: "/admin/landing-website/posts/news" },
    { label: "Buat Baru" }
  ],
  "/admin/landing-website/posts/events": [
    { label: "Website Sekolah", href: "/admin/landing-website" },
    { label: "Konten", href: "/admin/landing-website/posts" },
    { label: "Event" }
  ],
  "/admin/landing-website/posts/events/new": [
    { label: "Website Sekolah", href: "/admin/landing-website" },
    { label: "Konten", href: "/admin/landing-website/posts" },
    { label: "Event", href: "/admin/landing-website/posts/events" },
    { label: "Buat Baru" }
  ],
  "/admin/landing-website/pages": [
    { label: "Website Sekolah", href: "/admin/landing-website" },
    { label: "Halaman" }
  ],
  "/admin/landing-website/pages/profil": [
    { label: "Website Sekolah", href: "/admin/landing-website" },
    { label: "Halaman", href: "/admin/landing-website/pages" },
    { label: "Halaman Profil" }
  ],
  "/admin/landing-website/gallery": [
    { label: "Website Sekolah", href: "/admin/landing-website" },
    { label: "Galeri" }
  ],
  "/admin/landing-website/media": [
    { label: "Website Sekolah", href: "/admin/landing-website" },
    { label: "Perpustakaan Media" }
  ],
  "/admin/landing-website/faculty": [
    { label: "Website Sekolah", href: "/admin/landing-website" },
    { label: "Guru & Staf" }
  ],
  "/admin/landing-website/website-settings": [
    { label: "Website Sekolah", href: "/admin/landing-website" },
    { label: "Pengaturan Website" }
  ],
  "/admin/landing-website/website-settings/landing": [
    { label: "Website Sekolah", href: "/admin/landing-website" },
    { label: "Pengaturan Website", href: "/admin/landing-website/website-settings" },
    { label: "Landing Page" }
  ],
  "/admin/landing-website/website-settings/theme": [
    { label: "Website Sekolah", href: "/admin/landing-website" },
    { label: "Pengaturan Website", href: "/admin/landing-website/website-settings" },
    { label: "Tema" }
  ],
  "/admin/penerimaan-siswa/pendaftaran-baru": [
    { label: "Penerimaan Siswa", href: "/admin/penerimaan-siswa" },
    { label: "Pendaftaran Baru" }
  ],
  "/admin/penerimaan-siswa": [{ label: "Penerimaan Siswa", href: "/admin/penerimaan-siswa" }],
  "/admin/penerimaan-siswa/pembayaran": [
    { label: "Penerimaan Siswa", href: "/admin/penerimaan-siswa" },
    { label: "Pembayaran" }
  ],
  "/admin/penerimaan-siswa/siswa-diterima": [
    { label: "Penerimaan Siswa", href: "/admin/penerimaan-siswa" },
    { label: "Siswa Diterima" }
  ],
  "/admin/penerimaan-siswa/settings": [
    { label: "Penerimaan Siswa", href: "/admin/penerimaan-siswa" },
    { label: "Pengaturan Penerimaan" }
  ],
  "/admin/penerimaan-siswa/settings/registration-code": [
    { label: "Penerimaan Siswa", href: "/admin/penerimaan-siswa" },
    { label: "Pengaturan Penerimaan", href: "/admin/penerimaan-siswa/settings" },
    { label: "Kode Registrasi" }
  ],
  "/admin/penerimaan-siswa/settings/programs": [
    { label: "Penerimaan Siswa", href: "/admin/penerimaan-siswa" },
    { label: "Pengaturan Penerimaan", href: "/admin/penerimaan-siswa/settings" },
    { label: "Program" }
  ],
  "/admin/penerimaan-siswa/settings/years": [
    { label: "Penerimaan Siswa", href: "/admin/penerimaan-siswa" },
    { label: "Pengaturan Penerimaan", href: "/admin/penerimaan-siswa/settings" },
    { label: "Tahun Ajaran" }
  ],
  "/admin/manajemen-akademik/tahun-ajaran": [
    { label: "Manajemen Akademik", href: "/admin/manajemen-akademik" },
    { label: "Tahun Ajaran" }
  ],
  "/admin/manajemen-akademik": [{ label: "Manajemen Akademik", href: "/admin/manajemen-akademik" }],
  "/admin/manajemen-akademik/gtk": [
    { label: "Manajemen Akademik", href: "/admin/manajemen-akademik" },
    { label: "Guru & Tenaga Kependidikan" }
  ],
  "/admin/manajemen-akademik/rombel": [
    { label: "Manajemen Akademik", href: "/admin/manajemen-akademik" },
    { label: "Rombel, Pengampu & Jadwal" }
  ],
  "/admin/manajemen-akademik/rombel/transfer": [
    { label: "Manajemen Akademik", href: "/admin/manajemen-akademik" },
    { label: "Rombel", href: "/admin/manajemen-akademik/rombel" },
    { label: "Transfer Siswa" }
  ],
  "/admin/manajemen-akademik/kurikulum-mapel": [
    { label: "Manajemen Akademik", href: "/admin/manajemen-akademik" },
    { label: "Kurikulum & Mata Pelajaran" }
  ],
  "/admin/manajemen-akademik/jadwal-pelajaran": [
    { label: "Manajemen Akademik", href: "/admin/manajemen-akademik" },
    { label: "Jadwal Pelajaran" }
  ],
  "/admin/manajemen-akademik/guru-pengampu": [
    { label: "Manajemen Akademik", href: "/admin/manajemen-akademik" },
    { label: "Guru Pengampu" }
  ],
  "/admin/manajemen-akademik/peserta-didik": [
    { label: "Manajemen Akademik", href: "/admin/manajemen-akademik" },
    { label: "Peserta Didik" }
  ],
  "/admin/manajemen-akademik/peserta-didik/new": [
    { label: "Manajemen Akademik", href: "/admin/manajemen-akademik" },
    { label: "Peserta Didik", href: "/admin/manajemen-akademik/peserta-didik" },
    { label: "Tambah Peserta Didik" }
  ],
  "/admin/manajemen-akademik/peserta-didik/import": [
    { label: "Manajemen Akademik", href: "/admin/manajemen-akademik" },
    { label: "Peserta Didik", href: "/admin/manajemen-akademik/peserta-didik" },
    { label: "Import Data" }
  ],
  "/admin/manajemen-akademik/ruang-jam-pelajaran": [
    { label: "Manajemen Akademik", href: "/admin/manajemen-akademik" },
    { label: "Ruang & Jam Pelajaran" }
  ],
  "/admin/manajemen-akademik/nilai-rapor": [
    { label: "Manajemen Akademik", href: "/admin/manajemen-akademik" },
    { label: "Nilai & Rapor" }
  ],
  "/admin/manajemen-akademik/pengaturan-akademik": [
    { label: "Manajemen Akademik", href: "/admin/manajemen-akademik" },
    { label: "Pengaturan Akademik" }
  ],
  "/admin/manajemen-akademik/gtk/new": [
    { label: "Manajemen Akademik", href: "/admin/manajemen-akademik" },
    { label: "Guru & Tenaga Kependidikan", href: "/admin/manajemen-akademik/gtk" },
    { label: "Tambah GTK" }
  ],
  "/admin/manajemen-akademik/gtk/import": [
    { label: "Manajemen Akademik", href: "/admin/manajemen-akademik" },
    { label: "Guru & Tenaga Kependidikan", href: "/admin/manajemen-akademik/gtk" },
    { label: "Import Data" }
  ],
  "/admin/manajemen-akademik/tahun-ajaran/kalender-akademik": [
    { label: "Manajemen Akademik", href: "/admin/manajemen-akademik" },
    { label: "Tahun Ajaran", href: "/admin/manajemen-akademik/tahun-ajaran" },
    { label: "Kalender Akademik" }
  ],
  "/admin/pengaturan": [{ label: "Pengaturan" }],
  "/admin/pengaturan/identitas-sekolah": [
    { label: "Pengaturan", href: "/admin/pengaturan" },
    { label: "Identitas Sekolah" }
  ],
  "/admin/pengaturan/notifikasi": [
    { label: "Pengaturan", href: "/admin/pengaturan" },
    { label: "Notifikasi" }
  ],
  "/admin/pengaturan/integrasi-api": [
    { label: "Pengaturan", href: "/admin/pengaturan" },
    { label: "Integrasi & API" }
  ],
  "/admin/pengaturan/backup-restore": [
    { label: "Pengaturan", href: "/admin/pengaturan" },
    { label: "Backup & Restore" }
  ],
  "/admin/pengaturan/permissions": [
    { label: "Pengaturan", href: "/admin/pengaturan" },
    { label: "Izin Akses Role" }
  ],
  "/admin/pengguna": [
    { label: "Pengaturan", href: "/admin/pengaturan" },
    { label: "Manajemen Pengguna" }
  ]
};

type SubMenu = {
  id: string;
  label: string;
  href: string;
  badge?: string;
  superadminOnly?: boolean;
};

type AppCategory = {
  id: string;
  name: string;
  icon: typeof LayoutDashboard;
  color: string;
  description: string;
  href?: string;
  subMenus?: SubMenu[];
  allowedRoles?: string[]; // if set, category is hidden for roles not in this list
};

const appCategories: AppCategory[] = [
  {
    id: "dashboard",
    name: "Dasbor",
    icon: LayoutDashboard,
    color: "bg-primary",
    description: "Ikhtisar sistem",
    href: "/admin"
  },
  {
    id: "cms",
    name: "Website Sekolah",
    icon: Globe,
    color: "bg-accent",
    description: "Kelola konten website",
    subMenus: [
      { id: "cms-posts", label: "Konten", href: "/admin/landing-website/posts" },
      { id: "cms-pages", label: "Halaman", href: "/admin/landing-website/pages" },
      { id: "cms-gallery", label: "Galeri", href: "/admin/landing-website/gallery" },
      { id: "cms-media", label: "Perpustakaan Media", href: "/admin/landing-website/media" },
      {
        id: "cms-faculty",
        label: "Guru & Tenaga Kependidikan",
        href: "/admin/landing-website/faculty"
      },
      {
        id: "cms-settings",
        label: "Pengaturan Website",
        href: "/admin/landing-website/website-settings"
      }
    ]
  },
  {
    id: "admissions",
    name: "Penerimaan Siswa",
    icon: ClipboardList,
    color: "bg-success",
    description: "Pantau proses pendaftaran",
    subMenus: [
      {
        id: "admissions-registration",
        label: "Pendaftaran Baru",
        href: "/admin/penerimaan-siswa/pendaftaran-baru"
      },
      {
        id: "admissions-payments",
        label: "Pembayaran",
        href: "/admin/penerimaan-siswa/pembayaran"
      },
      {
        id: "admissions-validation",
        label: "Siswa Diterima",
        href: "/admin/penerimaan-siswa/siswa-diterima"
      },
      {
        id: "admissions-settings",
        label: "Pengaturan Penerimaan",
        href: "/admin/penerimaan-siswa/settings"
      }
    ]
  },
  {
    id: "akademik",
    name: "Manajemen Akademik",
    icon: ClipboardList,
    color: "bg-emerald",
    description: "Kelola modul akademik",
    subMenus: [
      { id: "tahun-ajaran", label: "Tahun Ajaran", href: "/admin/manajemen-akademik/tahun-ajaran" },
      {
        id: "data-gtk",
        label: "Guru & Tenaga Kependidikan",
        href: "/admin/manajemen-akademik/gtk"
      },
      { id: "data-siswa", label: "Peserta Didik", href: "/admin/manajemen-akademik/peserta-didik" },
      {
        id: "ruang-jam-pelajaran",
        label: "Ruang & Jam Pelajaran",
        href: "/admin/manajemen-akademik/ruang-jam-pelajaran"
      },
      {
        id: "kurikulum-mapel",
        label: "Kurikulum & Mata Pelajaran",
        href: "/admin/manajemen-akademik/kurikulum-mapel"
      },
      { id: "kelas-rombel", label: "Rombel, Pengampu & Jadwal", href: "/admin/manajemen-akademik/rombel" },
      {
        id: "nilai-rapor",
        label: "Nilai & Rapor",
        href: "/admin/manajemen-akademik/nilai-rapor"
      },
      {
        id: "pengaturan-akademik",
        label: "Pengaturan Akademik",
        href: "/admin/manajemen-akademik/pengaturan-akademik"
      }
    ]
  },
  {
    id: "settings",
    name: "Pengaturan",
    icon: Settings,
    color: "bg-muted",
    description: "Konfigurasi sistem",
    allowedRoles: ["SUPERADMIN", "ADMIN"],
    subMenus: [
      {
        id: "settings-identitas",
        label: "Identitas Sekolah",
        href: "/admin/pengaturan/identitas-sekolah"
      },
      { id: "settings-users", label: "Manajemen Pengguna", href: "/admin/pengguna" },
      { id: "settings-notifikasi", label: "Notifikasi", href: "/admin/pengaturan/notifikasi" },
      { id: "settings-integrasi", label: "Integrasi & API", href: "/admin/pengaturan/integrasi-api", superadminOnly: true },
      { id: "settings-backup", label: "Backup & Restore", href: "/admin/pengaturan/backup-restore", superadminOnly: true },
      { id: "settings-permissions", label: "Izin Akses Role", href: "/admin/pengaturan/permissions", superadminOnly: true }
    ]
  }
];

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  // Determine initial expanded menu based on pathname
  const getInitialMenu = () => {
    let menuToExpand = ""; // no default expansion

    if (pathname.startsWith("/admin/penerimaan-siswa")) {
      menuToExpand = "admissions";
    } else if (pathname.startsWith("/admin/landing-website")) {
      menuToExpand = "cms";
    } else if (pathname.startsWith("/admin/pengguna")) {
      menuToExpand = "settings"; // Change to settings
    } else if (pathname.startsWith("/admin/pengaturan")) {
      menuToExpand = "settings";
    } else if (pathname.startsWith("/admin/manajemen-akademik")) {
      menuToExpand = "akademik";
    }

    return menuToExpand ? [menuToExpand] : [];
  };

  const [expandedMenus, setExpandedMenus] = useState<string[]>(getInitialMenu());
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [adminTheme, setAdminTheme] = useState<string>("minimalist-light");
  const applyAdminTheme = async (themeId: string, persist: boolean = true) => {
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

    localStorage.setItem("admin-theme", theme.id);
    setAdminTheme(theme.id);

    if (persist) {
      try {
        await fetch("/api/admin/admin-theme", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ adminTheme: theme.id })
        });
      } catch (error) {
        console.error("Failed to persist admin theme", error);
      }
    }
  };

  // Auto-expand menu when pathname changes

  useEffect(() => {
    let menuToExpand = ""; // no default expansion

    if (pathname.startsWith("/admin/penerimaan-siswa")) {
      menuToExpand = "admissions";
    } else if (pathname.startsWith("/admin/landing-website")) {
      menuToExpand = "cms";
    } else if (pathname.startsWith("/admin/pengguna")) {
      menuToExpand = "settings"; // Change to settings
    } else if (pathname.startsWith("/admin/pengaturan")) {
      menuToExpand = "settings";
    } else if (pathname.startsWith("/admin/manajemen-akademik")) {
      menuToExpand = "akademik";
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExpandedMenus(menuToExpand ? [menuToExpand] : []);
  }, [pathname]);

  // Redirect to login if unauthenticated - only on login page or when status is definitively unauthenticated
  useEffect(() => {
    if (status === "unauthenticated" && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [status, router, pathname]);

  // Initialize saved admin theme (DB preference > localStorage fallback)
  useEffect(() => {
    const hydrateTheme = async () => {
      try {
        const response = await fetch("/api/admin/admin-theme");
        if (response.ok) {
          const data = await response.json();
          const dbTheme = data?.adminTheme;
          if (dbTheme && ADMIN_THEMES.some(t => t.id === dbTheme)) {
            await applyAdminTheme(dbTheme, false);
            return;
          }
        }
      } catch (error) {
        console.error("Failed to load admin theme preference", error);
      }

      const storedTheme =
        typeof window !== "undefined" ? localStorage.getItem("admin-theme") : null;
      if (storedTheme && ADMIN_THEMES.some(t => t.id === storedTheme)) {
        await applyAdminTheme(storedTheme, false);
      } else {
        await applyAdminTheme("minimalist-light", false);
      }
    };

    hydrateTheme();
  }, []);

  // Show loading state while checking authentication (but not on login page)
  if (status === "loading" && pathname !== "/admin/login") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  // If on login page, render children without sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <BreadcrumbProvider>
      <AdminLayoutContent
        pathname={pathname}
        expandedMenus={expandedMenus}
        setExpandedMenus={setExpandedMenus}
        isSidebarMinimized={isSidebarMinimized}
        setIsSidebarMinimized={setIsSidebarMinimized}
        showLogoutConfirm={showLogoutConfirm}
        setShowLogoutConfirm={setShowLogoutConfirm}
        adminTheme={adminTheme}
        applyAdminTheme={applyAdminTheme}
        session={session}
      >
        {children}
      </AdminLayoutContent>
    </BreadcrumbProvider>
  );
}

function AdminLayoutContent({
  pathname,
  expandedMenus,
  setExpandedMenus,
  isSidebarMinimized,
  setIsSidebarMinimized,
  showLogoutConfirm,
  setShowLogoutConfirm,
  adminTheme,
  applyAdminTheme,
  session,
  children
}: {
  pathname: string;
  expandedMenus: string[];
  setExpandedMenus: (menus: string[] | ((prev: string[]) => string[])) => void;
  isSidebarMinimized: boolean;
  setIsSidebarMinimized: (minimized: boolean) => void;
  showLogoutConfirm: boolean;
  setShowLogoutConfirm: (show: boolean) => void;
  adminTheme: string;
  applyAdminTheme: (themeId: string) => Promise<void> | void;
  session: Session | null;
  children: React.ReactNode;
}) {
  const breadcrumb = useBreadcrumb();
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Auto-set breadcrumbs based on pathname
  useEffect(() => {
    if (!breadcrumb) return;

    let newBreadcrumbs: Array<{ label: string; href?: string }> | null = null;

    // Find matching breadcrumb from the map
    for (const [path, crumbs] of Object.entries(BREADCRUMB_MAP)) {
      if (pathname === path) {
        newBreadcrumbs = crumbs;
        break;
      }
    }

    // Handle dynamic edit routes for articles, news, and events
    if (!newBreadcrumbs) {
      const articleEditMatch = pathname.match(
        /^\/admin\/landing-website\/posts\/articles\/([^/]+)\/edit$/
      );
      if (articleEditMatch) {
        newBreadcrumbs = [
          { label: "Website Sekolah", href: "/admin/landing-website" },
          { label: "Konten", href: "/admin/landing-website/posts" },
          { label: "Artikel", href: "/admin/landing-website/posts/articles" },
          { label: "Edit Artikel" }
        ];
      }

      const newsEditMatch = pathname.match(
        /^\/admin\/landing-website\/posts\/news\/([^/]+)\/edit$/
      );
      if (newsEditMatch) {
        newBreadcrumbs = [
          { label: "Website Sekolah", href: "/admin/landing-website" },
          { label: "Konten", href: "/admin/landing-website/posts" },
          { label: "Berita", href: "/admin/landing-website/posts/news" },
          { label: "Edit Berita" }
        ];
      }

      const eventEditMatch = pathname.match(
        /^\/admin\/landing-website\/posts\/events\/([^/]+)\/edit$/
      );
      if (eventEditMatch) {
        newBreadcrumbs = [
          { label: "Website Sekolah", href: "/admin/landing-website" },
          { label: "Konten", href: "/admin/landing-website/posts" },
          { label: "Event", href: "/admin/landing-website/posts/events" },
          { label: "Edit Event" }
        ];
      }
    }

    // Only update if breadcrumbs need to change
    if (newBreadcrumbs !== null) {
      // Check if it's different from current
      const isSame =
        breadcrumb.breadcrumbs.length === newBreadcrumbs.length &&
        breadcrumb.breadcrumbs.every(
          (b, i) => b.label === newBreadcrumbs![i].label && b.href === newBreadcrumbs![i].href
        );
      if (!isSame) {
        breadcrumb.setBreadcrumbs(newBreadcrumbs);
      }
    } else if (!pathname.includes("/pages/profil/")) {
      // Clear breadcrumbs for non-profile paths that don't match the map
      if (breadcrumb.breadcrumbs.length > 0) {
        breadcrumb.setBreadcrumbs([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await signOut({ callbackUrl: "/admin/login" });
  };

  const toggleMenu = (appId: string) => {
    setExpandedMenus(
      (prev: string[]) =>
        prev.includes(appId)
          ? [] // Close if already open
          : [appId] // Open only this menu, close others
    );
  };

  const isActiveRoute = (href: string) => {
    if (href === "/admin") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };
  const getIconBgClass = () => {
    // Use a neutral muted background for menu icons across all themes to avoid
    // them appearing 'active' unless the menu item is actually active.
    const theme = ADMIN_THEMES.find(t => t.id === adminTheme);
    const darkSuffix = theme && theme.mode === "dark" ? "/30" : "/20";
    return `bg-muted${darkSuffix}`;
  };

  const getIconTextClass = () => {
    // Use a neutral muted icon foreground by default across themes for consistency
    return "h-5 w-5 text-muted-foreground";
  };

  // Custom class for active menu using sidebar-accent and sidebar-accent-foreground
  const getActiveMenuClasses = (isActive: boolean) => {
    if (!isActive) return "hover:bg-accent hover:text-accent-foreground";
    return "active-admin-menu";
  };

  // For inline style fallback (for text color)
  const getActiveMenuStyle = (isActive: boolean) => {
    if (!isActive) return undefined;
    const theme = ADMIN_THEMES.find(t => t.id === adminTheme);
    if (theme) {
      return {
        backgroundColor: theme.cssVars["sidebar-accent"],
        color: theme.cssVars["sidebar-accent-foreground"]
      } as React.CSSProperties;
    }
    return undefined;
  };

  const userInitials =
    session?.user?.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() ||
    session?.user?.email?.[0]?.toUpperCase() ||
    "?";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside
        className={`flex flex-col border-r border-sidebar-border bg-muted/30 transition-all duration-300 ${isSidebarMinimized ? "w-20" : "w-72"}`}
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
                <p className="text-xs text-muted-foreground">Admin Panel</p>
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

        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full px-3 py-4 bg-muted/30">
            <nav className="flex flex-col gap-1">
              {appCategories.filter(app =>
                !app.allowedRoles || app.allowedRoles.includes(session?.user?.role ?? "")
              ).map(app => {
                const Icon = app.icon;
                const hasSubMenus = app.subMenus && app.subMenus.length > 0;
                const isExpanded = expandedMenus.includes(app.id);
                const isActive = app.href ? isActiveRoute(app.href) : false;

                return (
                  <div key={app.id}>
                    {/* Main Menu Item */}
                    {app.href ? (
                      <Button
                        variant="ghost"
                        className={`w-full justify-start gap-3 h-auto py-2.5 px-3 ${getActiveMenuClasses(isActive)} ${isSidebarMinimized ? "justify-center" : ""}`}
                        style={getActiveMenuStyle(isActive)}
                        asChild
                      >
                        <Link href={app.href} title={isSidebarMinimized ? app.name : undefined}>
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
                                <span className="block text-sm font-medium">{app.name}</span>
                                <div className="text-xs text-muted-foreground">
                                  {app.description}
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
                            title={app.name}
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
                          <DropdownMenuLabel>{app.name}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {app.subMenus!.filter(sub => !sub.superadminOnly || session?.user?.role === "SUPERADMIN").map(sub => (
                            <DropdownMenuItem key={sub.id} asChild>
                              <Link href={sub.href}>{sub.label}</Link>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Button
                        variant="ghost"
                        className={`w-full justify-start gap-3 h-auto py-2.5 px-3 ${getActiveMenuClasses(isActive)} ${isSidebarMinimized ? "justify-center" : ""}`}
                        style={getActiveMenuStyle(isActive)}
                        onClick={() => hasSubMenus && toggleMenu(app.id)}
                        title={isSidebarMinimized ? app.name : undefined}
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
                              <span className="block text-sm font-medium">{app.name}</span>
                              <div className="text-xs text-muted-foreground">{app.description}</div>
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
                        {app.subMenus?.filter(sub => !sub.superadminOnly || session?.user?.role === "SUPERADMIN").map(sub => {
                          const isSubActive = isActiveRoute(sub.href);
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

        {/* Sticky footer at bottom of sidebar */}
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
                      &copy; Sekolix | Digitisasi Sekolah
                    </Link>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Open source - Integrated - Powerfull
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end"></div>
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
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
          <BreadcrumbDisplay />
          <div className="flex items-center gap-3">
            <RoleSwitcher />
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 hover:bg-accent">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session?.user?.image || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm font-medium">{session?.user?.name || "User"}</span>
                  <span className="text-xs text-muted-foreground">{session?.user?.role}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsThemeModalOpen(true)}>
                <Palette className="mr-2 h-4 w-4" />
                Pilih Tema Admin
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowLogoutConfirm(true)}>
                <LogOut className="mr-2 h-4 w-4" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        open={showLogoutConfirm}
        title="Keluar"
        description="Apakah Anda yakin ingin keluar? Anda akan diarahkan ke halaman login."
        confirmText="Keluar"
        cancelText="Batal"
        isDestructive={true}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      <Dialog open={isThemeModalOpen} onOpenChange={setIsThemeModalOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Pilih Tema Admin</DialogTitle>
            <DialogDescription>
              Tema tersimpan di akun Anda, akan otomatis dipakai saat login berikutnya.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ADMIN_THEMES.map(theme => {
              const isActive = adminTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={async () => {
                    await applyAdminTheme(theme.id);
                    setIsThemeModalOpen(false);
                  }}
                  className={`text-left rounded-lg border p-4 transition hover:border-primary/60 hover:shadow-sm ${isActive ? "border-primary ring-1 ring-primary/40" : "border-border"}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{theme.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {theme.mode} · {theme.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {theme.swatches.map(color => (
                        <span
                          key={color}
                          className="h-4 w-4 rounded-full border"
                          style={{ backgroundColor: color, borderColor: theme.cssVars.border }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 flex h-20 overflow-hidden rounded-md border">
                    <div className="flex-1" style={{ backgroundColor: theme.cssVars.background }} />
                    <div className="flex-1" style={{ backgroundColor: theme.cssVars.primary }} />
                    <div className="flex-1" style={{ backgroundColor: theme.cssVars.accent }} />
                  </div>
                  {isActive && (
                    <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
                      <Check className="h-4 w-4" /> Aktif
                    </div>
                  )}
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
    </div>
  );
}
