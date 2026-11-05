export type IntegrationEntity = "students" | "staff" | "rombels" | "subjects" | "grades";
export type IntegrationSeverity = "INFO" | "WARNING" | "ERROR";

export type IntegrationTemplateColumn = {
  key: string;
  header: string;
  required?: boolean;
  width?: number;
  sample?: string | number;
};

export type IntegrationProfileSeed = {
  code: string;
  name: string;
  description: string;
  target_system: string;
  school_level: string;
  direction: "IMPORT" | "EXPORT" | "BOTH";
  settings: Record<string, unknown>;
};

export type IntegrationFieldMappingSeed = {
  profileCode: string;
  entity: IntegrationEntity;
  internal_field: string;
  target_field: string;
  label: string;
  required?: boolean;
  sort_order: number;
  transform?: string | null;
  notes?: string | null;
};

export type DataValidationRuleSeed = {
  profileCode?: string;
  entity: IntegrationEntity | "parents";
  field: string;
  rule: string;
  severity: IntegrationSeverity;
  message: string;
};

export type ValidationIssue = {
  field: string;
  severity: IntegrationSeverity;
  message: string;
};

export type StudentImportRow = {
  nik?: unknown;
  nisn?: unknown;
  fullName?: unknown;
  phone?: unknown;
  email?: unknown;
  gender?: unknown;
  placeOfBirth?: unknown;
  dateOfBirth?: unknown;
  religion?: unknown;
  address?: unknown;
  city?: unknown;
  province?: unknown;
  postalCode?: unknown;
  fatherName?: unknown;
  motherName?: unknown;
  guardianName?: unknown;
  rombelName?: unknown;
};

export const INTEGRATION_ENTITIES: IntegrationEntity[] = ["students", "staff", "rombels", "subjects", "grades"];

export const INTEGRATION_PROFILES: IntegrationProfileSeed[] = [
  {
    code: "DAPODIK_GENERAL",
    name: "Dapodik Friendly",
    description: "Preset mapping Excel internal yang selaras dengan kebutuhan umum Dapodik.",
    target_system: "DAPODIK",
    school_level: "GENERAL",
    direction: "BOTH",
    settings: { version: "friendly", delimiter: ";", dateFormat: "yyyy-mm-dd" },
  },
  {
    code: "EMIS_GENERAL",
    name: "EMIS Friendly",
    description: "Preset mapping Excel internal untuk sekolah/madrasah yang perlu format EMIS friendly.",
    target_system: "EMIS",
    school_level: "GENERAL",
    direction: "BOTH",
    settings: { version: "friendly", delimiter: ";", dateFormat: "yyyy-mm-dd" },
  },
  {
    code: "ERAPOR_GENERAL",
    name: "e-Rapor Friendly",
    description: "Preset mapping nilai, rombel, mapel, dan peserta didik untuk kebutuhan e-Rapor friendly.",
    target_system: "ERAPOR",
    school_level: "GENERAL",
    direction: "BOTH",
    settings: { version: "friendly", delimiter: ";", dateFormat: "yyyy-mm-dd" },
  },
  {
    code: "DAPODIK_SD",
    name: "Dapodik SD/MI Friendly",
    description: "Preset jenjang SD/MI untuk sekolah dasar.",
    target_system: "DAPODIK",
    school_level: "SD_MI",
    direction: "BOTH",
    settings: { version: "friendly", phase: "A-C", dateFormat: "yyyy-mm-dd" },
  },
  {
    code: "DAPODIK_SMP",
    name: "Dapodik SMP/MTs Friendly",
    description: "Preset jenjang SMP/MTs untuk sekolah menengah pertama.",
    target_system: "DAPODIK",
    school_level: "SMP_MTS",
    direction: "BOTH",
    settings: { version: "friendly", phase: "D", dateFormat: "yyyy-mm-dd" },
  },
  {
    code: "DAPODIK_SMA",
    name: "Dapodik SMA/MA/SMK Friendly",
    description: "Preset jenjang SMA/MA/SMK untuk sekolah menengah atas/kejuruan.",
    target_system: "DAPODIK",
    school_level: "SMA_MA_SMK",
    direction: "BOTH",
    settings: { version: "friendly", phase: "E-F", dateFormat: "yyyy-mm-dd" },
  },
];

const STUDENT_COLUMNS: IntegrationTemplateColumn[] = [
  { key: "nik", header: "NIK", required: true, width: 20, sample: "3201010101010001" },
  { key: "nisn", header: "NISN", required: true, width: 16, sample: "0012345678" },
  { key: "fullName", header: "Nama Lengkap", required: true, width: 28, sample: "Ahmad Sekolix" },
  { key: "phone", header: "Telepon", required: true, width: 18, sample: "081234567890" },
  { key: "email", header: "Email", width: 26, sample: "siswa@example.sch.id" },
  { key: "gender", header: "Jenis Kelamin", width: 16, sample: "L" },
  { key: "placeOfBirth", header: "Tempat Lahir", width: 20, sample: "Bandung" },
  { key: "dateOfBirth", header: "Tanggal Lahir", width: 18, sample: "2010-05-17" },
  { key: "religion", header: "Agama", width: 16, sample: "Islam" },
  { key: "address", header: "Alamat", width: 36, sample: "Jl. Pendidikan No. 1" },
  { key: "city", header: "Kab/Kota", width: 20, sample: "Bandung" },
  { key: "province", header: "Provinsi", width: 20, sample: "Jawa Barat" },
  { key: "postalCode", header: "Kode Pos", width: 12, sample: "40111" },
  { key: "fatherName", header: "Nama Ayah", width: 24, sample: "Budi" },
  { key: "motherName", header: "Nama Ibu", width: 24, sample: "Siti" },
  { key: "guardianName", header: "Nama Wali", width: 24, sample: "" },
  { key: "rombelName", header: "Rombel", width: 18, sample: "VII A" },
];

const STAFF_COLUMNS: IntegrationTemplateColumn[] = [
  { key: "nik", header: "NIK", width: 20, sample: "3201010101010002" },
  { key: "nip", header: "NIP", width: 22, sample: "198001012006041001" },
  { key: "nuptk", header: "NUPTK", width: 20, sample: "1234567890123456" },
  { key: "name", header: "Nama", required: true, width: 28, sample: "Ibu Guru Sekolix" },
  { key: "role", header: "Peran", width: 16, sample: "TEACHER" },
  { key: "position", header: "Jabatan", width: 24, sample: "Guru Kelas" },
  { key: "jenisPTK", header: "Jenis PTK", width: 24, sample: "Guru" },
  { key: "email", header: "Email", width: 26, sample: "guru@example.sch.id" },
  { key: "phone", header: "Telepon", width: 18, sample: "081234567891" },
];

const ROMBEL_COLUMNS: IntegrationTemplateColumn[] = [
  { key: "id", header: "ID Internal", width: 14 },
  { key: "name", header: "Nama Rombel", required: true, width: 20, sample: "VII A" },
  { key: "className", header: "Tingkat/Kelas", width: 16, sample: "7" },
  { key: "programName", header: "Program", width: 22, sample: "Reguler" },
  { key: "academicYear", header: "Tahun Ajaran", width: 18, sample: "2026/2027" },
  { key: "capacity", header: "Kapasitas", width: 12, sample: 32 },
  { key: "studentCount", header: "Jumlah Siswa", width: 14, sample: 30 },
];

const SUBJECT_COLUMNS: IntegrationTemplateColumn[] = [
  { key: "id", header: "ID Internal", width: 14 },
  { key: "code", header: "Kode Mapel", required: true, width: 16, sample: "MTK" },
  { key: "name", header: "Nama Mapel", required: true, width: 28, sample: "Matematika" },
  { key: "kkm", header: "KKM", width: 10, sample: 75 },
  { key: "isPractice", header: "Praktik", width: 10, sample: "false" },
];

const GRADE_COLUMNS: IntegrationTemplateColumn[] = [
  { key: "studentName", header: "Nama Siswa", required: true, width: 28 },
  { key: "nisn", header: "NISN", width: 16 },
  { key: "subjectCode", header: "Kode Mapel", required: true, width: 16 },
  { key: "subjectName", header: "Nama Mapel", width: 28 },
  { key: "assessmentTitle", header: "Penilaian", width: 24 },
  { key: "score", header: "Nilai", required: true, width: 10 },
  { key: "notes", header: "Catatan", width: 32 },
];

export function getIntegrationTemplateColumns(entity: string): IntegrationTemplateColumn[] {
  switch (entity) {
    case "students":
      return STUDENT_COLUMNS;
    case "staff":
      return STAFF_COLUMNS;
    case "rombels":
      return ROMBEL_COLUMNS;
    case "subjects":
      return SUBJECT_COLUMNS;
    case "grades":
      return GRADE_COLUMNS;
    default:
      return [];
  }
}

export const DATA_FIELD_MAPPINGS: IntegrationFieldMappingSeed[] = INTEGRATION_PROFILES.flatMap((profile) =>
  INTEGRATION_ENTITIES.flatMap((entity) =>
    getIntegrationTemplateColumns(entity).map((column, index) => ({
      profileCode: profile.code,
      entity,
      internal_field: column.key,
      target_field: toTargetField(profile.target_system, column.key),
      label: column.header,
      required: column.required ?? false,
      sort_order: index + 1,
      transform: column.key.toLowerCase().includes("date") ? "date:yyyy-mm-dd" : null,
      notes: `${profile.name} mapping untuk ${column.header}`,
    }))
  )
);

export const DATA_VALIDATION_RULES: DataValidationRuleSeed[] = [
  { entity: "students", field: "nik", rule: "digits:16", severity: "ERROR", message: "NIK siswa harus 16 digit." },
  { entity: "students", field: "nisn", rule: "digits:10", severity: "ERROR", message: "NISN siswa harus 10 digit." },
  { entity: "students", field: "fullName", rule: "required", severity: "ERROR", message: "Nama lengkap siswa wajib diisi." },
  { entity: "students", field: "rombel", rule: "exists_or_report", severity: "WARNING", message: "Rombel siswa perlu dipastikan." },
  { entity: "parents", field: "parentName", rule: "one_of:fatherName,motherName,guardianName", severity: "WARNING", message: "Minimal satu data orang tua/wali perlu diisi." },
  { entity: "subjects", field: "code", rule: "required_unique", severity: "ERROR", message: "Kode mapel wajib unik." },
  { entity: "staff", field: "name", rule: "required", severity: "ERROR", message: "Nama GTK wajib diisi." },
];

export function normalizeDigits(value: unknown) {
  return String(value ?? "").replace(/\D+/g, "");
}

export function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

export function normalizeEmail(value: unknown) {
  const text = normalizeText(value);
  return text.includes("@") ? text : "";
}

export function validateStudentImportRow(row: StudentImportRow): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const nik = normalizeDigits(row.nik);
  const nisn = normalizeDigits(row.nisn);
  const fullName = normalizeText(row.fullName);
  const phone = normalizeText(row.phone);

  if (!nik || nik.length !== 16) {
    issues.push({ field: "nik", severity: "ERROR", message: "NIK wajib 16 digit." });
  }
  if (!nisn || nisn.length !== 10) {
    issues.push({ field: "nisn", severity: "ERROR", message: "NISN wajib 10 digit." });
  }
  if (!fullName) {
    issues.push({ field: "fullName", severity: "ERROR", message: "Nama lengkap wajib diisi." });
  }
  if (!phone) {
    issues.push({ field: "phone", severity: "ERROR", message: "Telepon wajib diisi untuk data siswa internal." });
  }
  if (!normalizeText(row.fatherName) && !normalizeText(row.motherName) && !normalizeText(row.guardianName)) {
    issues.push({ field: "parent", severity: "WARNING", message: "Minimal satu nama orang tua/wali sebaiknya diisi." });
  }
  if (!normalizeText(row.rombelName)) {
    issues.push({ field: "rombel", severity: "WARNING", message: "Rombel belum diisi atau belum dipetakan." });
  }

  return issues;
}

export function mapStudentImportRow(row: StudentImportRow) {
  return {
    nik: normalizeDigits(row.nik),
    nisn: normalizeDigits(row.nisn) || null,
    fullName: normalizeText(row.fullName),
    phone: normalizeText(row.phone),
    email: normalizeEmail(row.email) || null,
    gender: normalizeText(row.gender) || null,
    placeOfBirth: normalizeText(row.placeOfBirth) || null,
    dateOfBirth: normalizeText(row.dateOfBirth) || null,
    religion: normalizeText(row.religion) || null,
    address: normalizeText(row.address) || null,
    city: normalizeText(row.city) || null,
    province: normalizeText(row.province) || null,
    postalCode: normalizeText(row.postalCode) || null,
    fatherName: normalizeText(row.fatherName) || null,
    motherName: normalizeText(row.motherName) || null,
    guardianName: normalizeText(row.guardianName) || null,
    rombelName: normalizeText(row.rombelName) || null,
  };
}

export function parseImportRows(payload: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(payload)) return payload.filter(isRecord);
  if (isRecord(payload) && Array.isArray(payload.rows)) return payload.rows.filter(isRecord);
  if (isRecord(payload) && Array.isArray(payload.items)) return payload.items.filter(isRecord);
  return [];
}

export function supportedEntityOrDefault(entity: string | null | undefined): IntegrationEntity {
  return INTEGRATION_ENTITIES.includes(entity as IntegrationEntity) ? (entity as IntegrationEntity) : "students";
}

export function jsonSafe(value: unknown): unknown {
  return JSON.parse(
    JSON.stringify(value, (_key, currentValue) => (typeof currentValue === "bigint" ? currentValue.toString() : currentValue))
  );
}

function toTargetField(targetSystem: string, key: string) {
  const prefix = targetSystem.toLowerCase().replace(/[^a-z0-9]+/g, "_");
  return `${prefix}_${key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
