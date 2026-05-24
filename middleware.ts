import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Admin routes protection
    if (pathname.startsWith("/admin")) {
      if (token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // Teacher routes protection
    if (pathname.startsWith("/teacher")) {
      // Allow if user has TEACHER staff role
      if (token?.staffRole !== "TEACHER") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // Allow access
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Public routes that don't require authentication
        const publicRoutes = [
          "/login",
          "/select-role",
          "/unauthorized",
          "/"
        ];

        // Check if current path is public
        if (publicRoutes.some(route => pathname === route || pathname.startsWith("/api/auth"))) {
          return true;
        }

        // For protected routes, require token
        return !!token;
      }
    },
    pages: {
      signIn: "/login"
    }
  }
);

// Configure which routes use middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ]
};
