# Inventaris Logging Mutasi API

Dokumen ini menindaklanjuti QAH-09 dan QAH-10 dari Sprint 0.5. Basis inventaris adalah pencarian statis route `app/api/**/route.ts` yang mengekspor `POST`, `PUT`, `PATCH`, atau `DELETE`.

## Ringkasan

| Item | Jumlah |
|------|--------|
| File route API dengan mutasi | 116 |
| Kandidat tanpa logging eksplisit setelah patch QAH-10/QAH-11 | 105 |
| Route prioritas yang sudah ditambah logging/audit pada QAH baseline | 11 |

Catatan: angka ini bersifat heuristik. Route yang memanggil service lain bisa saja sudah logging di layer berbeda, tetapi tetap perlu dicek sebelum ditandai selesai.

## Route Prioritas Sudah Dikerjakan

| Area | Route | Logging |
|------|-------|---------|
| Nilai guru | `app/api/teacher/grades/route.ts` | `teacher.nilai` untuk upsert dan batch upsert |
| CBT guru | `app/api/teacher/ujian/paket/route.ts` | `teacher.cbt` untuk create paket |
| CBT guru | `app/api/teacher/ujian/paket/[id]/route.ts` | `teacher.cbt` untuk update dan delete paket |
| SPMB | `app/api/admin/penerimaan-siswa/export/route.ts` | `penerimaan-siswa` untuk export rekap |
| SPMB | `app/api/admin/penerimaan-siswa/export/biodata/route.ts` | `penerimaan-siswa` untuk export biodata |
| Akademik rombel | `app/api/admin/manajemen-akademik/rombel/transfer/execute/route.ts` | `akademik.rombel` untuk transfer batch |
| Akademik rombel | `app/api/admin/manajemen-akademik/rombel/[id]/transfer-students/route.ts` | `akademik.rombel` untuk transfer siswa |
| Siswa | `app/api/admin/manajemen-akademik/peserta-didik/route.ts` | `akademik.siswa` untuk create/update/delete plus audit trail |
| GTK | `app/api/admin/manajemen-akademik/gtk/route.ts` | `akademik.gtk` untuk create/delete plus audit trail |
| SPMB pembayaran | `app/api/admin/penerimaan-siswa/payments/route.ts` | `penerimaan-siswa.payment` untuk create plus audit trail |
| SPMB applicant | `app/api/admin/penerimaan-siswa/applicant/[id]/route.ts` | `penerimaan-siswa.applicant` untuk update/delete plus audit trail |

## Kategori Wajib Activity Log dan Audit Trail

Route dalam kategori ini harus punya `logActivity()` dan `writeAuditTrail()` dengan data before/after bila mengubah data.

| Area | Kandidat Route | Alasan |
|------|----------------|--------|
| Siswa | `app/api/admin/manajemen-akademik/peserta-didik/route.ts`, `app/api/admin/manajemen-akademik/peserta-didik/import/route.ts`, `app/api/admin/manajemen-akademik/peserta-didik/bulk-assign/route.ts` | Identitas siswa dan penempatan rombel sensitif |
| GTK | `app/api/admin/manajemen-akademik/gtk/route.ts`, `app/api/admin/manajemen-akademik/gtk/[id]/route.ts`, `app/api/admin/manajemen-akademik/gtk/import/route.ts` | Data pegawai sensitif |
| Nilai dan rapor | `app/api/teacher/nilai/input/route.ts`, `app/api/teacher/nilai/input/import/route.ts`, `app/api/teacher/nilai/rubrik/route.ts`, `app/api/teacher/ujian/hasil/[jadwalId]/koreksi/route.ts` | Nilai adalah data sensitif dan berdampak akademik |
| SPMB pembayaran/status | `app/api/admin/penerimaan-siswa/payments/route.ts`, `app/api/admin/penerimaan-siswa/applicant/[id]/route.ts`, `app/api/penerimaan-siswa/spmb/complete-profile/route.ts` | Status pendaftar dan pembayaran perlu jejak perubahan |
| Pengaturan sistem | `app/api/admin/settings/api-keys/route.ts`, `app/api/admin/settings/webhooks/route.ts`, `app/api/admin/pengaturan/backup-restore/route.ts` | Risiko operasional dan keamanan tinggi |
| Permission dan approval | `app/api/admin/settings/permissions/route.ts`, `app/api/admin/settings/approval/route.ts` | Sudah ada logging sebagian, audit trail tetap wajib dijaga |

## Kategori Wajib Activity Log

Route dalam kategori ini minimal punya `logActivity()` untuk create/update/delete/export/import, tetapi audit trail before/after bisa dipilih berdasarkan sensitivitas field.

| Area | Kandidat Route | Aksi |
|------|----------------|------|
| CMS landing | `app/api/admin/landing-website/**/route.ts` | create, update, delete, reorder, active theme |
| Akademik master | `app/api/admin/manajemen-akademik/classes/**/route.ts`, `programs`, `teacher-subjects`, `class-schedules`, `rooms`, `lesson-times` | create, update, delete |
| Akademik pengaturan | `pengaturan-akademik/kkm`, `skala`, `semester`, `bobot` | update konfigurasi |
| Portal guru | `teacher/tugas/**`, `teacher/assignments`, `teacher/pembelajaran/**`, `teacher/bank-soal/**` | create, update, delete, import |
| CBT | `teacher/ujian/jadwal/**`, `teacher/ujian/paket/[id]/publish/route.ts` | publish, schedule, close, update |
| Komunikasi | `teacher/komunikasi/forum/**`, `teacher/komunikasi/pesan/**`, `student/forum/route.ts` | create, reply, delete, send |
| Pengaturan user | `app/api/admin/pengguna/route.ts`, `teacher/pengaturan/profil/route.ts`, `teacher/pengaturan/password/route.ts` | update profil, password, user |

## Kategori Cukup Log Teknis atau Rendah Risiko

Route ini tetap perlu validasi dan guard, tetapi tidak selalu wajib audit trail penuh.

| Area | Kandidat Route | Catatan |
|------|----------------|---------|
| Notifikasi client | `app/api/student/notifications/route.ts` | Mark as read bisa activity log ringan atau telemetry internal |
| View/download material | `teacher/pembelajaran/materials/[id]/view/route.ts`, `download/route.ts` | Sebaiknya dihitung sebagai analytics, bukan audit trail |
| Preferensi tema | `admin/admin-theme/route.ts`, `teacher/teacher-theme/route.ts` | Activity log opsional kecuali tema global sekolah |
| Test webhook/notifikasi | `admin/settings/notifikasi/test/route.ts` | Log teknis cukup |

## TODO Monitoring Lanjutan

- [x] Tambahkan logging pada route prioritas nilai guru, CBT paket, export SPMB, transfer rombel, siswa, GTK, pembayaran SPMB, dan applicant SPMB.
- [ ] Tambahkan audit trail before/after untuk siswa, GTK, nilai, pembayaran SPMB, permission, dan pengaturan sistem.
- [ ] Buat helper wrapper logging mutasi agar route tidak mengulang metadata dasar.
- [ ] Tambahkan activity log untuk route CMS landing penting: publish, reorder, theme active/reset, dan delete.
- [ ] Tambahkan activity log untuk import siswa/GTK/nilai dengan metadata jumlah row sukses/gagal.
- [ ] Tambahkan negative test untuk memastikan log ditulis setelah mutasi berhasil dan tidak ditulis saat validasi gagal.
