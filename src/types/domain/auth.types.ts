/**
 * Authentication types
 */

export type UserRole = "ADMIN" | "EDITOR" | "USER";

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
  };
  expires?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}
