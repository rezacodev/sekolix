import { DefaultSession } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user?: {
      id: string;
      role: "ADMIN" | "EDITOR" | "USER";
      staffId?: string;
      staffRole?: "TEACHER" | "STAFF";
      isDualRole?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "ADMIN" | "EDITOR" | "USER";
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    role?: string;
    staffId?: string;
    staffRole?: string;
    isDualRole?: boolean;
  }
}
