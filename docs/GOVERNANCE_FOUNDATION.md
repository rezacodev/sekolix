# Governance Foundation

Dokumen ini menjelaskan fondasi tata kelola Sekolix untuk Sprint 0 modul tambahan.

## Tujuan

Fondasi ini memastikan modul sensitif seperti keuangan, BK, data pegawai, dan integrasi data memiliki:

- role operasional yang fleksibel;
- permission granular per fitur dan aksi;
- helper server untuk validasi akses;
- activity log global;
- audit trail perubahan data sensitif;
- approval workflow dasar.

## Role Utama dan Role Operasional

`UserRole` tetap dipakai sebagai role portal utama:

- `SUPERADMIN`
- `ADMIN`
- `GURU`
- `STAFF`
- `MURID`
- `ORANGTUA`
- legacy: `EDITOR`, `USER`

Role operasional disimpan di tabel `AccessRole`, sehingga sekolah bisa punya role tambahan tanpa migration enum PostgreSQL.

Role operasional default:

| Slug | Nama |
|------|------|
| `KEPALA_SEKOLAH` | Kepala Sekolah |
| `WAKA` | Wakil Kepala Sekolah |
| `TU` | Tata Usaha |
| `BENDAHARA` | Bendahara |
| `BK` | Guru BK |
| `PUSTAKAWAN` | Pustakawan |
| `SARPRAS` | Sarpras |
| `ORANG_TUA` | Orang Tua/Wali |

## Permission

Permission terdiri dari:

- `subject`: fitur/modul, misalnya `keuangan`, `bk`, `pengaturan.audit`;
- `action`: aksi, yaitu `manage`, `read`, `create`, `update`, `delete`, `export`, `approve`;
- `inverted`: jika `true`, rule menjadi larangan eksplisit.

Daftar subject dan role default didefinisikan di `src/lib/permissions/definitions.ts`.

Halaman admin:

- `/admin/pengaturan/permissions`

API:

- `GET /api/admin/settings/permissions`
- `POST /api/admin/settings/permissions`
- `DELETE /api/admin/settings/permissions`

## Helper Server

Helper utama berada di `src/lib/governance/server.ts`.

Gunakan pola berikut di API sensitif:

```ts
const context = await requirePermission("manage", "keuangan");
if (!context) return forbidden();
```

Helper yang tersedia:

| Helper | Fungsi |
|--------|--------|
| `getGovernanceContext()` | Mengambil session, access roles, dan ability rules |
| `requirePermission(action, subject)` | Validasi permission server-side |
| `forbidden()` | Response unauthorized standar |
| `logActivity()` | Menulis activity log |
| `writeAuditTrail()` | Menulis audit trail |
| `createApprovalRequest()` | Membuat approval request dengan step default |

## Activity Log

Gunakan `ActivityLog` untuk mencatat aktivitas umum:

- login/logout;
- create/update/delete;
- export;
- approve/reject;
- seed/system job.

Field penting:

- `actor_user_id`
- `actor_name`
- `module`
- `action`
- `entity_type`
- `entity_id`
- `metadata`
- `ip_address`
- `user_agent`

Halaman admin:

- `/admin/pengaturan/audit-log`

API:

- `GET /api/admin/settings/audit-log?type=activity`

## Audit Trail

Gunakan `AuditTrail` untuk perubahan data sensitif. Minimal mencatat:

- `entity_type`
- `entity_id`
- `action`
- `before`
- `after`
- `reason`

Data yang wajib memakai audit trail:

- nilai dan rapor;
- pembayaran dan tagihan;
- data siswa;
- data pegawai;
- catatan BK;
- permission dan approval.

API:

- `GET /api/admin/settings/audit-log?type=audit`

## Approval Workflow

Approval dasar memakai:

- `ApprovalRequest`
- `ApprovalStep`

Status awal adalah `PENDING`. Status keputusan:

- `APPROVED`
- `REJECTED`
- `CANCELLED`

Halaman admin:

- `/admin/pengaturan/approval`

API:

- `GET /api/admin/settings/approval`
- `POST /api/admin/settings/approval`
- `PATCH /api/admin/settings/approval`

## Seed

Role operasional default dan permission bawaannya dibuat di:

- `prisma/seeds/_core/governance.seed.ts`

Seed ini dipanggil dari `seedCore()`, sehingga aktif di skenario minimal, demo, dan full.

## Checklist Modul Baru

Saat membuat modul baru:

- [ ] Tambahkan subject permission jika belum ada.
- [ ] Tambahkan default permission untuk role operasional yang relevan.
- [ ] Gunakan `requirePermission()` di API sensitif.
- [ ] Panggil `logActivity()` untuk create/update/delete/export.
- [ ] Panggil `writeAuditTrail()` untuk perubahan data sensitif.
- [ ] Gunakan `createApprovalRequest()` untuk aksi yang perlu persetujuan.
- [ ] Update dokumentasi modul dan TODO monitoring.
