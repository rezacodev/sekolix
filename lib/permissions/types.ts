import { AbilityBuilder, createMongoAbility } from "@casl/ability";
import type { MongoAbility } from "@casl/ability";

export type UserRole =
  | "SUPERADMIN"
  | "ADMIN"
  | "GURU"
  | "STAFF"
  | "MURID"
  | "ORANGTUA"
  | "EDITOR"
  | "USER";

export type AppAction = "manage" | "read" | "create" | "update" | "delete";

export type AppSubject =
  | "all"
  | "dashboard"
  | "penerimaan-siswa"
  | "landing-website"
  | "akademik.tahun-ajaran"
  | "akademik.rombel"
  | "akademik.mata-pelajaran"
  | "akademik.jadwal"
  | "akademik.nilai"
  | "akademik.absensi"
  | "akademik.pengaturan"
  | "pengaturan.identitas"
  | "pengaturan.notifikasi"
  | "pengaturan.pengguna"
  | "pengaturan.system"
  | "teacher.portal"
  | "teacher.kelas"
  | "teacher.tugas"
  | "teacher.absensi"
  | "teacher.nilai"
  | "student.portal"
  | "parent.portal";

export type AppAbility = MongoAbility<[AppAction, AppSubject]>;

export type RolePermissionOverride = {
  role: UserRole;
  subject: AppSubject;
  action: AppAction;
  inverted: boolean;
};

export type AbilityBuilderInstance = AbilityBuilder<AppAbility>;
