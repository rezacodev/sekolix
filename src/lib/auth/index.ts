import NextAuth from "next-auth";
import type { NextAuthOptions, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import { buildRules } from "@/lib/permissions/definitions";
import type { UserRole } from "@/types";
import type { RolePermissionOverride } from "@/lib/permissions/types";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          throw new Error("User not found");
        }

        const isPasswordValid = await compare(credentials.password, user.password!);

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        if (!user.isActive) {
          throw new Error("User account is disabled");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      const typedUser = user as (User & { role?: UserRole }) | undefined;
      if (typedUser) {
        token.id = typedUser.id;
        token.role = typedUser.role ?? "USER";

        // Fetch linked staff info
        try {
          const staff = await db.staff.findFirst({
            where: { userId: typedUser.id },
            select: { id: true, role: true }
          });

          if (staff) {
            token.staffId = staff.id;
            token.staffRole = staff.role;
            // Dual role = admin-level user who also has a teacher staff record
            const isAdminRole = ["SUPERADMIN", "ADMIN"].includes(typedUser.role ?? "");
            token.isDualRole = isAdminRole && staff.role === "TEACHER";
          }
        } catch (error) {
          console.error("Error fetching staff info in JWT callback:", error);
        }
      }
      return token as JWT & {
        id?: string;
        role?: string;
        staffId?: string;
        staffRole?: string;
        isDualRole?: boolean;
      };
    },
    async session({ session, token }) {
      if (session.user) {
        const t = token as JWT & {
          id?: string;
          role?: string;
          staffId?: string;
          staffRole?: string;
          isDualRole?: boolean;
        };
        session.user.id = t.id ?? "";
        session.user.role = (t.role ?? "USER") as UserRole;
        session.user.staffId = t.staffId;
        session.user.staffRole = t.staffRole as "TEACHER" | "STAFF" | undefined;
        session.user.isDualRole = t.isDualRole ?? false;

        // Build CASL ability rules (include DB overrides for STAFF role)
        try {
          let overrides: RolePermissionOverride[] = [];
          const role = session.user.role as UserRole;
          if (role === "STAFF") {
            const dbOverrides = await (db as any).rolePermission.findMany({
              where: { role },
            });
            overrides = dbOverrides.map((o: any) => ({
              role: o.role,
              subject: o.subject,
              action: o.action,
              inverted: o.inverted,
            }));
          }
          session.user.abilityRules = buildRules(role, overrides) as object[];
        } catch (error) {
          console.error("Error building ability rules:", error);
          session.user.abilityRules = [];
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/login")) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    }
  },
  pages: {
    signIn: "/login"
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60
  },
  secret: process.env.NEXTAUTH_SECRET
};

export const handler = NextAuth(authOptions);
