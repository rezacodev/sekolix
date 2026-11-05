export type AppAction = "manage" | "read" | "create" | "update" | "delete" | "export" | "approve";

export type UserRole =
  | "SUPERADMIN"
  | "ADMIN"
  | "GURU"
  | "STAFF"
  | "MURID"
  | "ORANGTUA"
  | "EDITOR"
  | "USER";

export type RolePermissionOverride = {
  role?: UserRole;
  subject: string;
  action: string;
  inverted?: boolean;
};

export type AccessPermissionRule = {
  roleSlug?: string;
  subject: string;
  action: string;
  inverted?: boolean;
};

export type AbilityRule = {
  action: string;
  subject: string;
  inverted?: boolean;
};

export type PermissionSubject = {
  slug: string;
  label: string;
  group: string;
  sensitive?: boolean;
};

export type DefaultAccessRole = {
  slug: string;
  name: string;
  description: string;
  permissions: AccessPermissionRule[];
};
