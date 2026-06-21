import { DefaultSession } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

export type UserRole =
  | "SUPERADMIN"
  | "ADMIN"
  | "GURU"
  | "STAFF"
  | "MURID"
  | "ORANGTUA"
  | "EDITOR"
  | "USER";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user?: {
      id: string;
      role: UserRole;
      staffId?: string;
      staffRole?: "TEACHER" | "STAFF";
      isDualRole?: boolean;
      abilityRules?: object[];
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    role?: string;
    staffId?: string;
    staffRole?: string;
    isDualRole?: boolean;
    abilityRules?: object[];
  }
}
