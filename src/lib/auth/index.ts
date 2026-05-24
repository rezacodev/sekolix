import NextAuth from "next-auth";
import type { NextAuthOptions, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import type { UserRole } from "@/types";

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

        // Fetch staff info for dual role detection
        try {
          const staff = await db.staff.findFirst({
            where: { userId: typedUser.id },
            select: {
              id: true,
              role: true
            }
          });

          if (staff) {
            token.staffId = staff.id;
            token.staffRole = staff.role;
            // Dual role = ADMIN user role + TEACHER staff role
            token.isDualRole = typedUser.role === "ADMIN" && staff.role === "TEACHER";
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
        session.user.id = (token as JWT & { id?: string }).id ?? "";
        session.user.role = ((token as JWT & { role?: UserRole }).role ?? "USER") as UserRole;
        session.user.staffId = (token as JWT & { staffId?: string }).staffId;
        session.user.staffRole = (token as JWT & { staffRole?: string }).staffRole as "TEACHER" | "STAFF" | undefined;
        session.user.isDualRole = (token as JWT & { isDualRole?: boolean }).isDualRole ?? false;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // If redirecting to login, allow it
      if (url.startsWith("/login")) {
        return url;
      }

      // If URL is relative, prepend baseUrl
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      
      // If URL is on same origin, allow it
      if (new URL(url).origin === baseUrl) {
        return url;
      }

      // Default redirect to base URL
      return baseUrl;
    }
  },
  pages: {
    signIn: "/login"
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET
};

export const handler = NextAuth(authOptions);
