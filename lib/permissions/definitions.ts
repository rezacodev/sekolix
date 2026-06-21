import { AbilityBuilder, createMongoAbility } from "@casl/ability";
import type { AppAbility, AppAction, AppSubject, RolePermissionOverride, UserRole } from "./types";

// Default role permissions — used as baseline; DB overrides applied on top
function applyDefaults(
  { can, cannot }: AbilityBuilder<AppAbility>,
  role: UserRole
) {
  switch (role) {
    case "SUPERADMIN":
      can("manage", "all");
      break;

    case "ADMIN":
      can("manage", "all");
      // Admins cannot touch system-level settings
      cannot("manage", "pengaturan.system");
      break;

    case "STAFF":
      // Staff default: read-only on common admin sections; can be expanded via DB overrides
      can("read", "dashboard");
      can("read", "penerimaan-siswa");
      can("read", "akademik.tahun-ajaran");
      can("read", "akademik.rombel");
      can("read", "akademik.mata-pelajaran");
      can("read", "akademik.jadwal");
      can("read", "akademik.absensi");
      can("read", "akademik.nilai");
      break;

    case "GURU":
      can("manage", "teacher.portal");
      can("manage", "teacher.kelas");
      can("manage", "teacher.tugas");
      can("manage", "teacher.absensi");
      can("manage", "teacher.nilai");
      can("read", "dashboard");
      break;

    case "MURID":
      can("read", "student.portal");
      break;

    case "ORANGTUA":
      can("read", "parent.portal");
      break;

    // Legacy roles — map to nearest equivalent
    case "EDITOR":
      can("manage", "all");
      cannot("manage", "pengaturan.pengguna");
      cannot("manage", "pengaturan.system");
      break;

    case "USER":
      can("manage", "teacher.portal");
      can("manage", "teacher.kelas");
      can("manage", "teacher.tugas");
      can("manage", "teacher.absensi");
      can("manage", "teacher.nilai");
      can("read", "dashboard");
      break;

    default:
      // No permissions
      break;
  }
}

export function buildAbility(
  role: UserRole,
  overrides: RolePermissionOverride[] = []
): AppAbility {
  const builder = new AbilityBuilder<AppAbility>(createMongoAbility);

  applyDefaults(builder, role);

  // Apply DB overrides in order (grant first, deny second to respect inverted priority)
  for (const o of overrides.filter((x) => !x.inverted)) {
    builder.can(o.action as AppAction, o.subject as AppSubject);
  }
  for (const o of overrides.filter((x) => x.inverted)) {
    builder.cannot(o.action as AppAction, o.subject as AppSubject);
  }

  return builder.build();
}

// Build a plain-object rules array safe to pass over the wire (serialize to JWT or API response)
export function buildRules(role: UserRole, overrides: RolePermissionOverride[] = []) {
  return buildAbility(role, overrides).rules;
}
