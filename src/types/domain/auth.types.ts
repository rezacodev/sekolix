/**
 * Authentication types
 */

export type UserRole =
  | "SUPERADMIN"
  | "ADMIN"
  | "GURU"
  | "STAFF"
  | "MURID"
  | "ORANGTUA"
  | "EDITOR"  // legacy
  | "USER";   // legacy

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  image: string | null;
  isActive: boolean;
}

export interface AuthSession {
  user?: AuthUser & {
    id: string;
    role: UserRole;
    accessRoles?: Array<{ slug: string; name: string }>;
  };
  expires?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}
