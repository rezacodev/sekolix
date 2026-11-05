import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Roles allowed into the admin panel
const ADMIN_ROLES = ["SUPERADMIN", "ADMIN", "EDITOR"] as const;
const FINANCE_PANEL_ROLES = ["SUPERADMIN", "ADMIN", "STAFF"] as const;
const BK_PANEL_ROLES = ["SUPERADMIN", "ADMIN", "STAFF"] as const;
const LIBRARY_PANEL_ROLES = ["SUPERADMIN", "ADMIN", "STAFF"] as const;
const INVENTORY_PANEL_ROLES = ["SUPERADMIN", "ADMIN", "STAFF"] as const;
const STAFF_PANEL_ROLES = ["SUPERADMIN", "ADMIN", "STAFF"] as const;
const OFFICE_PANEL_ROLES = ["SUPERADMIN", "ADMIN", "STAFF"] as const;
const EXTRACURRICULAR_PANEL_ROLES = ["SUPERADMIN", "ADMIN", "STAFF"] as const;
const INTEGRATION_PANEL_ROLES = ["SUPERADMIN", "ADMIN"] as const;
// Roles that can access teacher portal
const TEACHER_ROLES = ["SUPERADMIN", "GURU"] as const;
// Roles allowed to manage system-level config (integrasi API, backup, dll)
const SYSTEM_CONFIG_ROLES = ["SUPERADMIN"] as const;
// System-config routes within admin
const SYSTEM_CONFIG_PATHS = [
  "/admin/pengaturan/integrasi-api",
  "/admin/pengaturan/backup",
  "/admin/pengaturan/backup-restore",
  "/admin/pengaturan/permissions",
  "/admin/pengaturan/audit-log",
  "/admin/pengaturan/approval",
] as const;

// Public-facing paths that never require login
const PUBLIC_PREFIXES = [
  "/about",
  "/contact",
  "/gallery",
  "/informasi",
  "/profil",
  "/apply",
  "/api/penerimaan-siswa",
  "/api/admin/admin-theme",
  "/api/verify",
] as const;

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    const role = token?.role as string | undefined;

    // Admin panel routes
    if (pathname.startsWith("/admin")) {
      const financePanelAccess =
        pathname.startsWith("/admin/keuangan") &&
        FINANCE_PANEL_ROLES.includes(role as typeof FINANCE_PANEL_ROLES[number]);
      const bkPanelAccess =
        pathname.startsWith("/admin/bk") &&
        BK_PANEL_ROLES.includes(role as typeof BK_PANEL_ROLES[number]);
      const libraryPanelAccess =
        pathname.startsWith("/admin/perpustakaan") &&
        LIBRARY_PANEL_ROLES.includes(role as typeof LIBRARY_PANEL_ROLES[number]);
      const inventoryPanelAccess =
        pathname.startsWith("/admin/inventaris") &&
        INVENTORY_PANEL_ROLES.includes(role as typeof INVENTORY_PANEL_ROLES[number]);
      const staffPanelAccess =
        pathname.startsWith("/admin/pegawai") &&
        STAFF_PANEL_ROLES.includes(role as typeof STAFF_PANEL_ROLES[number]);
      const officePanelAccess =
        pathname.startsWith("/admin/tata-usaha") &&
        OFFICE_PANEL_ROLES.includes(role as typeof OFFICE_PANEL_ROLES[number]);
      const extracurricularPanelAccess =
        pathname.startsWith("/admin/ekstrakurikuler") &&
        EXTRACURRICULAR_PANEL_ROLES.includes(role as typeof EXTRACURRICULAR_PANEL_ROLES[number]);
      const integrationPanelAccess =
        pathname.startsWith("/admin/integrasi-data") &&
        INTEGRATION_PANEL_ROLES.includes(role as typeof INTEGRATION_PANEL_ROLES[number]);
      if (!role || (!financePanelAccess && !bkPanelAccess && !libraryPanelAccess && !inventoryPanelAccess && !staffPanelAccess && !officePanelAccess && !extracurricularPanelAccess && !integrationPanelAccess && !ADMIN_ROLES.includes(role as typeof ADMIN_ROLES[number]))) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
      if (pathname.startsWith("/admin/integrasi-data") && !integrationPanelAccess) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }

      // System-config sub-routes: superadmin only
      if (SYSTEM_CONFIG_PATHS.some((p) => pathname.startsWith(p))) {
        if (!SYSTEM_CONFIG_ROLES.includes(role as typeof SYSTEM_CONFIG_ROLES[number])) {
          return NextResponse.redirect(new URL("/unauthorized", req.url));
        }
      }
    }

    // Teacher portal routes
    if (pathname.startsWith("/teacher")) {
      const hasTeacherAccess =
        TEACHER_ROLES.includes(role as typeof TEACHER_ROLES[number]) ||
        token?.staffRole === "TEACHER";
      if (!hasTeacherAccess) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // Student portal routes
    if (pathname.startsWith("/student")) {
      if (role !== "MURID") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // Parent portal routes
    if (pathname.startsWith("/parent")) {
      if (role !== "ORANGTUA") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Explicitly public routes (no auth required)
        if (
          pathname === "/" ||
          pathname === "/login" ||
          pathname === "/select-role" ||
          pathname === "/unauthorized" ||
          pathname.startsWith("/api/auth") ||
          PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
        ) {
          return true;
        }

        return !!token;
      }
    },
    pages: {
      signIn: "/login"
    }
  }
);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest|json|css|js|map|txt|xml)$).*)",
  ]
};
