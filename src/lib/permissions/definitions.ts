import type {
  AbilityRule,
  AccessPermissionRule,
  AppAction,
  DefaultAccessRole,
  PermissionSubject,
  RolePermissionOverride,
  UserRole,
} from "./types";

export const APP_ACTIONS: AppAction[] = ["manage", "read", "create", "update", "delete", "export", "approve"];

export const PERMISSION_SUBJECTS: PermissionSubject[] = [
  { slug: "dashboard", label: "Dashboard", group: "Umum" },
  { slug: "penerimaan-siswa", label: "Penerimaan Siswa", group: "Umum" },
  { slug: "landing-website", label: "Landing Website", group: "Umum" },
  { slug: "akademik.tahun-ajaran", label: "Tahun Ajaran", group: "Akademik" },
  { slug: "akademik.rombel", label: "Rombel", group: "Akademik" },
  { slug: "akademik.mata-pelajaran", label: "Mata Pelajaran", group: "Akademik" },
  { slug: "akademik.jadwal", label: "Jadwal", group: "Akademik" },
  { slug: "akademik.nilai", label: "Nilai & Rapor", group: "Akademik", sensitive: true },
  { slug: "akademik.absensi", label: "Absensi", group: "Akademik" },
  { slug: "akademik.pengaturan", label: "Pengaturan Akademik", group: "Akademik" },
  { slug: "pengaturan.identitas", label: "Identitas Sekolah", group: "Pengaturan" },
  { slug: "pengaturan.notifikasi", label: "Notifikasi", group: "Pengaturan" },
  { slug: "pengaturan.pengguna", label: "Manajemen Pengguna", group: "Pengaturan", sensitive: true },
  { slug: "pengaturan.system", label: "Sistem, API, Backup", group: "Pengaturan", sensitive: true },
  { slug: "pengaturan.permissions", label: "Izin Akses Role", group: "Pengaturan", sensitive: true },
  { slug: "pengaturan.audit", label: "Audit Log", group: "Pengaturan", sensitive: true },
  { slug: "pengaturan.approval", label: "Approval Workflow", group: "Pengaturan", sensitive: true },
  { slug: "teacher.portal", label: "Portal Guru", group: "Portal" },
  { slug: "teacher.kelas", label: "Kelas Guru", group: "Portal" },
  { slug: "teacher.tugas", label: "Tugas Guru", group: "Portal" },
  { slug: "teacher.absensi", label: "Absensi Guru", group: "Portal" },
  { slug: "teacher.nilai", label: "Nilai Guru", group: "Portal", sensitive: true },
  { slug: "student.portal", label: "Portal Siswa", group: "Portal" },
  { slug: "parent.portal", label: "Portal Orang Tua", group: "Portal" },
  { slug: "keuangan", label: "Keuangan/SPP", group: "Operasional", sensitive: true },
  { slug: "bk", label: "BK & Kedisiplinan", group: "Operasional", sensitive: true },
  { slug: "perpustakaan", label: "Perpustakaan", group: "Operasional" },
  { slug: "inventaris", label: "Inventaris/Sarpras", group: "Operasional" },
  { slug: "pegawai", label: "Manajemen Pegawai", group: "Operasional", sensitive: true },
  { slug: "tata-usaha", label: "Surat Menyurat/TU", group: "Operasional" },
  { slug: "ekstrakurikuler", label: "Ekstrakurikuler", group: "Operasional" },
  { slug: "integrasi-data", label: "Integrasi Data Pendidikan", group: "Integrasi", sensitive: true },
];

export const DEFAULT_ACCESS_ROLES: DefaultAccessRole[] = [
  {
    slug: "KEPALA_SEKOLAH",
    name: "Kepala Sekolah",
    description: "Akses baca seluruh laporan dan approval strategis.",
    permissions: [
      { subject: "dashboard", action: "read" },
      { subject: "akademik.nilai", action: "read" },
      { subject: "keuangan", action: "read" },
      { subject: "bk", action: "read" },
      { subject: "pegawai", action: "manage" },
      { subject: "pengaturan.approval", action: "approve" },
      { subject: "pengaturan.audit", action: "read" },
    ],
  },
  {
    slug: "WAKA",
    name: "Wakil Kepala Sekolah",
    description: "Akses koordinasi akademik, kesiswaan, dan laporan operasional.",
    permissions: [
      { subject: "dashboard", action: "read" },
      { subject: "akademik.jadwal", action: "manage" },
      { subject: "akademik.nilai", action: "read" },
      { subject: "bk", action: "read" },
      { subject: "ekstrakurikuler", action: "manage" },
    ],
  },
  {
    slug: "TU",
    name: "Tata Usaha",
    description: "Akses administrasi data, surat, dan layanan sekolah.",
    permissions: [
      { subject: "penerimaan-siswa", action: "read" },
      { subject: "akademik.tahun-ajaran", action: "read" },
      { subject: "akademik.rombel", action: "read" },
      { subject: "pegawai", action: "read" },
      { subject: "tata-usaha", action: "manage" },
    ],
  },
  {
    slug: "BENDAHARA",
    name: "Bendahara",
    description: "Akses penuh untuk tagihan, pembayaran, dan laporan keuangan.",
    permissions: [
      { subject: "keuangan", action: "manage" },
      { subject: "parent.portal", action: "read" },
      { subject: "pengaturan.audit", action: "read" },
    ],
  },
  {
    slug: "BK",
    name: "Guru BK",
    description: "Akses catatan konseling, kedisiplinan, dan tindak lanjut siswa.",
    permissions: [
      { subject: "bk", action: "manage" },
      { subject: "akademik.absensi", action: "read" },
      { subject: "akademik.nilai", action: "read" },
      { subject: "parent.portal", action: "read" },
    ],
  },
  {
    slug: "PUSTAKAWAN",
    name: "Pustakawan",
    description: "Akses kelola katalog, anggota, dan transaksi perpustakaan.",
    permissions: [{ subject: "perpustakaan", action: "manage" }],
  },
  {
    slug: "SARPRAS",
    name: "Sarpras",
    description: "Akses kelola aset, ruang, peminjaman, dan pemeliharaan.",
    permissions: [
      { subject: "inventaris", action: "manage" },
      { subject: "akademik.jadwal", action: "read" },
    ],
  },
  {
    slug: "ORANG_TUA",
    name: "Orang Tua/Wali",
    description: "Akses portal orang tua. Dipakai sebagai role operasional pendamping UserRole ORANGTUA.",
    permissions: [
      { subject: "parent.portal", action: "read" },
      { subject: "keuangan", action: "read" },
    ],
  },
];

const DEFAULT_ROLE_RULES: Record<UserRole, AbilityRule[]> = {
  SUPERADMIN: [{ action: "manage", subject: "all" }],
  ADMIN: [
    { action: "manage", subject: "all" },
    { action: "manage", subject: "pengaturan.system", inverted: true },
  ],
  GURU: [
    { action: "read", subject: "dashboard" },
    { action: "manage", subject: "teacher.portal" },
    { action: "manage", subject: "teacher.kelas" },
    { action: "manage", subject: "teacher.tugas" },
    { action: "manage", subject: "teacher.absensi" },
    { action: "manage", subject: "teacher.nilai" },
  ],
  STAFF: [
    { action: "read", subject: "dashboard" },
    { action: "read", subject: "penerimaan-siswa" },
    { action: "read", subject: "akademik.tahun-ajaran" },
    { action: "read", subject: "akademik.rombel" },
    { action: "read", subject: "akademik.jadwal" },
    { action: "read", subject: "akademik.absensi" },
    { action: "read", subject: "akademik.nilai" },
  ],
  MURID: [{ action: "read", subject: "student.portal" }],
  ORANGTUA: [{ action: "read", subject: "parent.portal" }],
  EDITOR: [
    { action: "read", subject: "dashboard" },
    { action: "manage", subject: "landing-website" },
  ],
  USER: [{ action: "read", subject: "dashboard" }],
};

export function buildRules(
  role: UserRole,
  overrides: RolePermissionOverride[] = [],
  accessPermissions: AccessPermissionRule[] = []
): AbilityRule[] {
  const defaultRules = DEFAULT_ROLE_RULES[role] ?? DEFAULT_ROLE_RULES.USER;
  return [
    ...defaultRules,
    ...accessPermissions.map((rule) => ({
      action: rule.action,
      subject: rule.subject,
      inverted: rule.inverted,
    })),
    ...overrides.map((rule) => ({
      action: rule.action,
      subject: rule.subject,
      inverted: rule.inverted,
    })),
  ];
}

export function can(rules: AbilityRule[], action: string, subject: string) {
  let allowed = false;
  for (const rule of rules) {
    const actionMatches = rule.action === "manage" || rule.action === action;
    const subjectMatches = rule.subject === "all" || rule.subject === subject;
    if (!actionMatches || !subjectMatches) continue;
    allowed = !rule.inverted;
  }
  return allowed;
}
